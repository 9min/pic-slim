use std::path::Path;

pub fn compress(input_path: &Path, output_path: &Path, quality: u32) -> Result<u64, String> {
    // Step 1: Decode with lodepng
    let image = lodepng::decode32_file(input_path)
        .map_err(|e| format!("PNG 디코딩 실패: {}", e))?;

    let width = image.width;
    let height = image.height;

    // Step 2: Lossy quantization with imagequant
    let mut liq = imagequant::new();
    liq.set_quality(0, quality as u8)
        .map_err(|e| format!("imagequant 품질 설정 실패: {}", e))?;

    let mut img = liq
        .new_image(image.buffer.as_slice(), width, height, 0.0)
        .map_err(|e| format!("imagequant 이미지 생성 실패: {}", e))?;

    let mut res = match liq.quantize(&mut img) {
        Ok(res) => res,
        Err(_) => {
            // If quantization fails, fall back to lossless-only optimization
            return compress_lossless_only(input_path, output_path);
        }
    };

    res.set_dithering_level(1.0)
        .map_err(|e| format!("디더링 설정 실패: {}", e))?;

    let (palette, pixels) = res
        .remapped(&mut img)
        .map_err(|e| format!("imagequant 리맵 실패: {}", e))?;

    // Step 3: Encode quantized result with lodepng
    let mut encoder = lodepng::Encoder::new();
    encoder.set_auto_convert(false);

    {
        let info = encoder.info_raw_mut();
        info.colortype = lodepng::ColorType::PALETTE;
        info.set_bitdepth(8);
        let rgba_palette: Vec<lodepng::RGBA> = palette
            .iter()
            .map(|c| lodepng::RGBA {
                r: c.r,
                g: c.g,
                b: c.b,
                a: c.a,
            })
            .collect();
        info.set_palette(&rgba_palette)
            .map_err(|e| format!("팔레트 설정 실패: {}", e))?;
    }

    {
        let info = encoder.info_png_mut();
        info.color.colortype = lodepng::ColorType::PALETTE;
        info.color.set_bitdepth(8);
        let rgba_palette: Vec<lodepng::RGBA> = palette
            .iter()
            .map(|c| lodepng::RGBA {
                r: c.r,
                g: c.g,
                b: c.b,
                a: c.a,
            })
            .collect();
        info.color
            .set_palette(&rgba_palette)
            .map_err(|e| format!("팔레트 설정 실패: {}", e))?;
    }

    let png_data = encoder
        .encode(&pixels, width, height)
        .map_err(|e| format!("PNG 인코딩 실패: {}", e))?;

    // Step 4: Lossless optimization with oxipng
    let optimized = oxipng::optimize_from_memory(
        &png_data,
        &oxipng::Options {
            strip: oxipng::StripChunks::Safe,
            ..oxipng::Options::from_preset(2)
        },
    )
    .map_err(|e| format!("oxipng 최적화 실패: {}", e))?;

    std::fs::write(output_path, &optimized).map_err(|e| format!("PNG 저장 실패: {}", e))?;

    Ok(optimized.len() as u64)
}

fn compress_lossless_only(input_path: &Path, output_path: &Path) -> Result<u64, String> {
    let data = std::fs::read(input_path).map_err(|e| format!("PNG 읽기 실패: {}", e))?;

    let optimized = oxipng::optimize_from_memory(
        &data,
        &oxipng::Options {
            strip: oxipng::StripChunks::Safe,
            ..oxipng::Options::from_preset(2)
        },
    )
    .map_err(|e| format!("oxipng 최적화 실패: {}", e))?;

    std::fs::write(output_path, &optimized).map_err(|e| format!("PNG 저장 실패: {}", e))?;

    Ok(optimized.len() as u64)
}
