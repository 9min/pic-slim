use rayon::prelude::*;
use std::path::Path;

/// Memory threshold for parallel processing (512 MB).
/// GIFs exceeding this estimated memory usage fall back to sequential processing.
const PARALLEL_MEMORY_LIMIT: usize = 512 * 1024 * 1024;

/// Quality-adaptive compression parameters derived from the user quality slider (60–95).
struct QualityParams {
    dithering: f32,
    /// Lossy tolerance: pixels within this RGBA distance are merged for better LZW runs.
    /// 0 means lossless (no pixel alignment).
    lossy_tolerance: u8,
}

fn quality_params(quality: u32) -> QualityParams {
    match quality {
        90..=u32::MAX => QualityParams {
            dithering: 0.65,
            lossy_tolerance: 0,
        },
        75..=89 => QualityParams {
            dithering: 0.45,
            lossy_tolerance: 2,
        },
        _ => QualityParams {
            dithering: 0.25,
            lossy_tolerance: 4,
        },
    }
}

/// Decoded frame with full-canvas RGBA pixels and original timing metadata.
struct DecodedFrame {
    /// Full canvas RGBA (width * height * 4 bytes).
    canvas: Vec<u8>,
    delay: u16,
}

/// Delta-optimized frame ready for quantization and encoding.
struct DeltaFrame {
    /// RGBA pixels for the sub-region (or full canvas for the first frame).
    rgba: Vec<u8>,
    width: u16,
    height: u16,
    left: u16,
    top: u16,
    delay: u16,
    dispose: gif::DisposalMethod,
}

pub fn compress(input_path: &Path, output_path: &Path, quality: u32) -> Result<u64, String> {
    let params = quality_params(quality);

    // --- Phase 1: Decode all frames to full-canvas RGBA ---
    let (canvas_w, canvas_h, decoded_frames) = decode_all_frames(input_path)?;

    let is_single_frame = decoded_frames.len() <= 1;
    let estimated_memory = canvas_w as usize * canvas_h as usize * 4 * decoded_frames.len();
    let use_parallel = !is_single_frame && estimated_memory <= PARALLEL_MEMORY_LIMIT;

    // --- Phase 2: Compute delta frames (sequential — each frame depends on the previous) ---
    let delta_frames = compute_delta_frames(&decoded_frames, canvas_w, canvas_h, is_single_frame);

    // --- Phase 3: Quantize + LZW pre-encode (parallel when possible) ---
    let encoded_frames = if use_parallel {
        encode_frames_parallel(&delta_frames, quality, &params)
    } else {
        encode_frames_sequential(&delta_frames, quality, &params)
    };

    // --- Phase 4: Write all frames sequentially ---
    write_gif(output_path, canvas_w, canvas_h, &encoded_frames)?;

    let compressed_size = std::fs::metadata(output_path)
        .map(|m| m.len())
        .map_err(|e| format!("GIF 크기 확인 실패: {}", e))?;

    Ok(compressed_size)
}

// ---------------------------------------------------------------------------
// Phase 1: Full-canvas decoding
// ---------------------------------------------------------------------------

fn decode_all_frames(input_path: &Path) -> Result<(u16, u16, Vec<DecodedFrame>), String> {
    let file =
        std::fs::File::open(input_path).map_err(|e| format!("GIF 열기 실패: {}", e))?;
    let mut opts = gif::DecodeOptions::new();
    opts.set_color_output(gif::ColorOutput::RGBA);
    let mut reader = opts
        .read_info(file)
        .map_err(|e| format!("GIF 디코딩 실패: {}", e))?;

    let w = reader.width();
    let h = reader.height();
    let canvas_size = w as usize * h as usize * 4;

    // Derive background fill color from global palette + bg_color index
    let bg_fill = {
        let bg_idx = reader.bg_color().unwrap_or(0);
        match reader.global_palette() {
            Some(pal) => {
                let offset = bg_idx * 3;
                if offset + 2 < pal.len() {
                    [pal[offset], pal[offset + 1], pal[offset + 2], 0xFF]
                } else {
                    [0, 0, 0, 0]
                }
            }
            None => [0, 0, 0, 0],
        }
    };

    let mut frames: Vec<DecodedFrame> = Vec::new();
    // Canvas tracks the cumulative composited image (disposal-aware).
    let mut canvas = vec![0u8; canvas_size];

    while let Some(frame) = reader
        .read_next_frame()
        .map_err(|e| format!("GIF 프레임 읽기 실패: {}", e))?
    {
        let fl = frame.left as usize;
        let ft = frame.top as usize;
        let fw = frame.width as usize;
        let fh = frame.height as usize;
        let delay = frame.delay;
        let dispose = frame.dispose;

        // Snapshot canvas BEFORE compositing for DisposalMethod::Previous
        let pre_composite = if dispose == gif::DisposalMethod::Previous {
            Some(canvas.clone())
        } else {
            None
        };

        // Composite the sub-frame onto the canvas
        let rgba_buf = &frame.buffer;
        for row in 0..fh {
            let cy = ft + row;
            if cy >= h as usize {
                break;
            }
            for col in 0..fw {
                let cx = fl + col;
                if cx >= w as usize {
                    break;
                }
                let src_idx = (row * fw + col) * 4;
                let dst_idx = (cy * w as usize + cx) * 4;
                let alpha = rgba_buf[src_idx + 3];
                if alpha > 0 {
                    canvas[dst_idx..dst_idx + 4]
                        .copy_from_slice(&rgba_buf[src_idx..src_idx + 4]);
                }
            }
        }

        // Snapshot the current canvas as this frame's full image
        frames.push(DecodedFrame {
            canvas: canvas.clone(),
            delay,
        });

        // Handle disposal for the NEXT frame's base
        match dispose {
            gif::DisposalMethod::Background => {
                // Fill sub-frame region with GIF logical background color
                for row in 0..fh {
                    let cy = ft + row;
                    if cy >= h as usize {
                        break;
                    }
                    for col in 0..fw {
                        let cx = fl + col;
                        if cx >= w as usize {
                            break;
                        }
                        let idx = (cy * w as usize + cx) * 4;
                        canvas[idx..idx + 4].copy_from_slice(&bg_fill);
                    }
                }
            }
            gif::DisposalMethod::Previous => {
                // Restore canvas to the state before this frame was composited
                if let Some(prev) = pre_composite {
                    canvas.copy_from_slice(&prev);
                } else {
                    canvas.fill(0);
                }
            }
            _ => {
                // Keep / Any — canvas stays as-is
            }
        }
    }

    Ok((w, h, frames))
}

// ---------------------------------------------------------------------------
// Phase 2: Delta computation
// ---------------------------------------------------------------------------

fn compute_delta_frames(
    decoded: &[DecodedFrame],
    width: u16,
    height: u16,
    is_single_frame: bool,
) -> Vec<DeltaFrame> {
    let w = width as usize;
    let h = height as usize;

    decoded
        .iter()
        .enumerate()
        .map(|(i, frame)| {
            if i == 0 || is_single_frame {
                // First frame (or single-frame GIF): encode entire canvas
                DeltaFrame {
                    rgba: frame.canvas.clone(),
                    width,
                    height,
                    left: 0,
                    top: 0,
                    delay: frame.delay,
                    dispose: gif::DisposalMethod::Keep,
                }
            } else {
                let prev = &decoded[i - 1].canvas;
                let curr = &frame.canvas;

                // Find bounding box of changed pixels
                let mut min_x = w;
                let mut min_y = h;
                let mut max_x: usize = 0;
                let mut max_y: usize = 0;

                for y in 0..h {
                    for x in 0..w {
                        let idx = (y * w + x) * 4;
                        if prev[idx..idx + 4] != curr[idx..idx + 4] {
                            min_x = min_x.min(x);
                            min_y = min_y.min(y);
                            max_x = max_x.max(x);
                            max_y = max_y.max(y);
                        }
                    }
                }

                if min_x > max_x || min_y > max_y {
                    // No change — emit a 1x1 transparent frame
                    DeltaFrame {
                        rgba: vec![0, 0, 0, 0],
                        width: 1,
                        height: 1,
                        left: 0,
                        top: 0,
                        delay: frame.delay,
                        dispose: gif::DisposalMethod::Keep,
                    }
                } else {
                    let dw = max_x - min_x + 1;
                    let dh = max_y - min_y + 1;
                    let mut delta_rgba = vec![0u8; dw * dh * 4];

                    for dy in 0..dh {
                        for dx in 0..dw {
                            let sx = min_x + dx;
                            let sy = min_y + dy;
                            let src_idx = (sy * w + sx) * 4;
                            let dst_idx = (dy * dw + dx) * 4;

                            if prev[src_idx..src_idx + 4] == curr[src_idx..src_idx + 4] {
                                // Unchanged pixel → transparent
                                delta_rgba[dst_idx..dst_idx + 4]
                                    .copy_from_slice(&[0, 0, 0, 0]);
                            } else {
                                delta_rgba[dst_idx..dst_idx + 4]
                                    .copy_from_slice(&curr[src_idx..src_idx + 4]);
                            }
                        }
                    }

                    DeltaFrame {
                        rgba: delta_rgba,
                        width: dw as u16,
                        height: dh as u16,
                        left: min_x as u16,
                        top: min_y as u16,
                        delay: frame.delay,
                        dispose: gif::DisposalMethod::Keep,
                    }
                }
            }
        })
        .collect()
}

// ---------------------------------------------------------------------------
// Phase 3a: Parallel encoding
// ---------------------------------------------------------------------------

fn encode_frames_parallel(
    delta_frames: &[DeltaFrame],
    quality: u32,
    params: &QualityParams,
) -> Vec<gif::Frame<'static>> {
    delta_frames
        .par_iter()
        .map(|df| encode_single_frame(df, quality, params))
        .collect()
}

// ---------------------------------------------------------------------------
// Phase 3b: Sequential encoding (fallback for large GIFs)
// ---------------------------------------------------------------------------

fn encode_frames_sequential(
    delta_frames: &[DeltaFrame],
    quality: u32,
    params: &QualityParams,
) -> Vec<gif::Frame<'static>> {
    delta_frames
        .iter()
        .map(|df| encode_single_frame(df, quality, params))
        .collect()
}

// ---------------------------------------------------------------------------
// Single frame encoding: quantize → optional lossy alignment → LZW pre-encode
// ---------------------------------------------------------------------------

fn encode_single_frame(
    df: &DeltaFrame,
    quality: u32,
    params: &QualityParams,
) -> gif::Frame<'static> {
    let fw = df.width as usize;
    let fh = df.height as usize;

    // Apply lossy pixel alignment before quantization (if enabled)
    let rgba_input = if params.lossy_tolerance > 0 {
        lossy_pixel_align(&df.rgba, fw, fh, params.lossy_tolerance)
    } else {
        df.rgba.clone()
    };

    // Try imagequant quantization
    if let Some((palette, pixels, transparent_idx)) =
        quantize_frame(&rgba_input, fw, fh, quality, params.dithering)
    {
        let mut palette_bytes = Vec::with_capacity(palette.len() * 3);
        for c in &palette {
            palette_bytes.push(c.r);
            palette_bytes.push(c.g);
            palette_bytes.push(c.b);
        }

        let mut frame = gif::Frame::default();
        frame.width = df.width;
        frame.height = df.height;
        frame.left = df.left;
        frame.top = df.top;
        frame.delay = df.delay;
        frame.dispose = df.dispose;
        frame.palette = Some(palette_bytes);
        frame.transparent = transparent_idx;
        frame.buffer = std::borrow::Cow::Owned(pixels);
        frame.make_lzw_pre_encoded();
        frame
    } else {
        // Fallback: use gif crate's built-in RGBA → indexed conversion
        let mut rgba_owned = rgba_input;
        let mut frame = gif::Frame::from_rgba(df.width, df.height, &mut rgba_owned);
        frame.left = df.left;
        frame.top = df.top;
        frame.delay = df.delay;
        frame.dispose = df.dispose;
        frame.make_lzw_pre_encoded();
        frame
    }
}

// ---------------------------------------------------------------------------
// Quantization with imagequant
// ---------------------------------------------------------------------------

fn quantize_frame(
    rgba_buf: &[u8],
    width: usize,
    height: usize,
    quality: u32,
    dithering: f32,
) -> Option<(Vec<imagequant::RGBA>, Vec<u8>, Option<u8>)> {
    let expected_len = width * height * 4;
    if rgba_buf.len() < expected_len {
        return None;
    }

    let mut liq = imagequant::new();
    liq.set_quality(0, quality as u8).ok()?;
    // Reserve one palette slot for transparency → max 255 colors
    liq.set_max_colors(255).ok()?;

    let rgba_pixels: &[imagequant::RGBA] = unsafe {
        std::slice::from_raw_parts(rgba_buf.as_ptr() as *const imagequant::RGBA, width * height)
    };

    let mut img = liq.new_image_borrowed(rgba_pixels, width, height, 0.0).ok()?;
    let mut res = liq.quantize(&mut img).ok()?;
    res.set_dithering_level(dithering).ok()?;

    let (palette, pixels) = res.remapped(&mut img).ok()?;

    // Find existing transparent entry, or the slot is implicitly available
    // because we limited max_colors to 255
    let transparent_idx = palette.iter().position(|c| c.a == 0).map(|i| i as u8);

    Some((palette, pixels, transparent_idx))
}

// ---------------------------------------------------------------------------
// Lossy pixel alignment: merge similar adjacent pixels for better LZW runs
// ---------------------------------------------------------------------------

fn lossy_pixel_align(rgba: &[u8], width: usize, height: usize, tolerance: u8) -> Vec<u8> {
    let mut out = rgba.to_vec();
    let tol = tolerance as i16;

    for y in 0..height {
        for x in 1..width {
            let curr = (y * width + x) * 4;
            let prev = curr - 4;

            // Skip if either pixel is transparent
            if out[curr + 3] == 0 || out[prev + 3] == 0 {
                continue;
            }

            let dr = (out[curr] as i16 - out[prev] as i16).abs();
            let dg = (out[curr + 1] as i16 - out[prev + 1] as i16).abs();
            let db = (out[curr + 2] as i16 - out[prev + 2] as i16).abs();

            if dr <= tol && dg <= tol && db <= tol {
                out[curr] = out[prev];
                out[curr + 1] = out[prev + 1];
                out[curr + 2] = out[prev + 2];
                // Keep alpha as-is
            }
        }
    }

    out
}

// ---------------------------------------------------------------------------
// Phase 4: Write the GIF
// ---------------------------------------------------------------------------

fn write_gif(
    output_path: &Path,
    width: u16,
    height: u16,
    frames: &[gif::Frame<'static>],
) -> Result<(), String> {
    let mut output = std::fs::File::create(output_path)
        .map_err(|e| format!("GIF 출력 파일 생성 실패: {}", e))?;

    let mut encoder = gif::Encoder::new(&mut output, width, height, &[])
        .map_err(|e| format!("GIF 인코더 생성 실패: {}", e))?;

    encoder
        .set_repeat(gif::Repeat::Infinite)
        .map_err(|e| format!("GIF 반복 설정 실패: {}", e))?;

    for frame in frames {
        encoder
            .write_lzw_pre_encoded_frame(frame)
            .map_err(|e| format!("GIF 프레임 쓰기 실패: {}", e))?;
    }

    drop(encoder);
    Ok(())
}
