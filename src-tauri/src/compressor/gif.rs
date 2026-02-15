use std::path::Path;

pub fn compress(input_path: &Path, output_path: &Path, quality: u32) -> Result<u64, String> {
    let file = std::fs::File::open(input_path).map_err(|e| format!("GIF 열기 실패: {}", e))?;
    let mut decoder = gif::DecodeOptions::new();
    decoder.set_color_output(gif::ColorOutput::RGBA);
    let mut reader = decoder
        .read_info(file)
        .map_err(|e| format!("GIF 디코딩 실패: {}", e))?;

    let width = reader.width();
    let height = reader.height();

    let mut output = std::fs::File::create(output_path)
        .map_err(|e| format!("GIF 출력 파일 생성 실패: {}", e))?;

    let mut encoder = gif::Encoder::new(&mut output, width, height, &[])
        .map_err(|e| format!("GIF 인코더 생성 실패: {}", e))?;

    encoder
        .set_repeat(gif::Repeat::Infinite)
        .map_err(|e| format!("GIF 반복 설정 실패: {}", e))?;

    while let Some(frame) = reader
        .read_next_frame()
        .map_err(|e| format!("GIF 프레임 읽기 실패: {}", e))?
    {
        let fw = frame.width as usize;
        let fh = frame.height as usize;
        let delay = frame.delay;
        let dispose = frame.dispose;
        let left = frame.left;
        let top = frame.top;

        // RGBA buffer from decoder
        let rgba_buf = &frame.buffer;

        // Try imagequant palette optimization
        match quantize_frame(rgba_buf, fw, fh, quality) {
            Some((palette, pixels, transparent_idx)) => {
                // Build flat palette bytes (RGB)
                let mut palette_bytes = Vec::with_capacity(palette.len() * 3);
                for c in &palette {
                    palette_bytes.push(c.r);
                    palette_bytes.push(c.g);
                    palette_bytes.push(c.b);
                }

                let mut new_frame = gif::Frame::default();
                new_frame.width = fw as u16;
                new_frame.height = fh as u16;
                new_frame.delay = delay;
                new_frame.dispose = dispose;
                new_frame.left = left;
                new_frame.top = top;
                new_frame.palette = Some(palette_bytes);
                new_frame.buffer = std::borrow::Cow::Owned(pixels);
                new_frame.transparent = transparent_idx;

                encoder
                    .write_frame(&new_frame)
                    .map_err(|e| format!("GIF 프레임 쓰기 실패: {}", e))?;
            }
            None => {
                // Quantization failed — fall back to re-encoding original RGBA frame
                // Build an identity-quantized frame from RGBA data
                fallback_write_frame(&mut encoder, frame, fw, fh)?;
            }
        }
    }

    drop(encoder);

    let compressed_size = std::fs::metadata(output_path)
        .map(|m| m.len())
        .map_err(|e| format!("GIF 크기 확인 실패: {}", e))?;

    Ok(compressed_size)
}

/// Quantize an RGBA frame using imagequant, returning (palette, indexed_pixels, transparent_index).
fn quantize_frame(
    rgba_buf: &[u8],
    width: usize,
    height: usize,
    quality: u32,
) -> Option<(Vec<imagequant::RGBA>, Vec<u8>, Option<u8>)> {
    let mut liq = imagequant::new();
    liq.set_quality(0, quality as u8).ok()?;

    // Convert &[u8] to &[imagequant::RGBA]
    let expected_len = width * height * 4;
    if rgba_buf.len() < expected_len {
        return None;
    }
    let rgba_pixels: &[imagequant::RGBA] = unsafe {
        std::slice::from_raw_parts(rgba_buf.as_ptr() as *const imagequant::RGBA, width * height)
    };

    let mut img = liq.new_image_borrowed(rgba_pixels, width, height, 0.0).ok()?;
    let mut res = liq.quantize(&mut img).ok()?;

    // Lower dithering for GIF — frames transition fast so heavy dithering is noisy
    res.set_dithering_level(0.5).ok()?;

    let (palette, pixels) = res.remapped(&mut img).ok()?;

    // Find transparent palette entry (alpha = 0)
    let transparent_idx = palette
        .iter()
        .position(|c| c.a == 0)
        .map(|i| i as u8);

    Some((palette, pixels, transparent_idx))
}

/// Fallback: write the original frame when quantization fails.
/// Re-encodes RGBA data into an indexed frame using the gif crate.
fn fallback_write_frame(
    encoder: &mut gif::Encoder<&mut std::fs::File>,
    frame: &gif::Frame,
    width: usize,
    height: usize,
) -> Result<(), String> {
    let rgba_buf = &frame.buffer;

    // Use gif::Frame::from_rgba to create an indexed frame from RGBA data
    let mut rgba_owned = rgba_buf.to_vec();
    let mut new_frame =
        gif::Frame::from_rgba(width as u16, height as u16, &mut rgba_owned);
    new_frame.delay = frame.delay;
    new_frame.dispose = frame.dispose;
    new_frame.left = frame.left;
    new_frame.top = frame.top;

    encoder
        .write_frame(&new_frame)
        .map_err(|e| format!("GIF 프레임 쓰기 실패 (폴백): {}", e))?;

    Ok(())
}
