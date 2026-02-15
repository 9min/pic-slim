use std::path::Path;

pub fn compress(input_path: &Path, output_path: &Path, _quality: u32) -> Result<u64, String> {
    // Use gif crate for basic optimization: copy frames with optimized encoding
    let file = std::fs::File::open(input_path).map_err(|e| format!("GIF 열기 실패: {}", e))?;
    let mut decoder = gif::DecodeOptions::new();
    decoder.set_color_output(gif::ColorOutput::Indexed);
    let mut reader = decoder
        .read_info(file)
        .map_err(|e| format!("GIF 디코딩 실패: {}", e))?;

    let mut output = std::fs::File::create(output_path)
        .map_err(|e| format!("GIF 출력 파일 생성 실패: {}", e))?;

    let width = reader.width();
    let height = reader.height();
    let global_palette = reader.global_palette().map(|p| p.to_vec());

    let mut encoder = gif::Encoder::new(&mut output, width, height, &[])
        .map_err(|e| format!("GIF 인코더 생성 실패: {}", e))?;

    if let Some(ref palette) = global_palette {
        encoder
            .set_repeat(gif::Repeat::Infinite)
            .map_err(|e| format!("GIF 반복 설정 실패: {}", e))?;
        let _ = palette; // global palette is set per-frame if needed
    }

    encoder
        .set_repeat(gif::Repeat::Infinite)
        .map_err(|e| format!("GIF 반복 설정 실패: {}", e))?;

    while let Some(frame) = reader
        .read_next_frame()
        .map_err(|e| format!("GIF 프레임 읽기 실패: {}", e))?
    {
        let mut new_frame = frame.clone();
        // If frame has no local palette, use global
        if new_frame.palette.is_none() {
            if let Some(ref gp) = global_palette {
                new_frame.palette = Some(gp.clone());
            }
        }
        encoder
            .write_frame(&new_frame)
            .map_err(|e| format!("GIF 프레임 쓰기 실패: {}", e))?;
    }

    drop(encoder);

    let compressed_size = std::fs::metadata(output_path)
        .map(|m| m.len())
        .map_err(|e| format!("GIF 크기 확인 실패: {}", e))?;

    Ok(compressed_size)
}
