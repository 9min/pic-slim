use image::ImageReader;
use std::path::Path;

pub fn compress(input_path: &Path, output_path: &Path, quality: u32) -> Result<u64, String> {
    let img = ImageReader::open(input_path)
        .map_err(|e| format!("JPEG 열기 실패: {}", e))?
        .decode()
        .map_err(|e| format!("JPEG 디코딩 실패: {}", e))?;

    let rgb = img.to_rgb8();
    let (width, height) = rgb.dimensions();

    let mut comp = mozjpeg::Compress::new(mozjpeg::ColorSpace::JCS_RGB);
    comp.set_size(width as usize, height as usize);
    comp.set_quality(quality as f32);
    comp.set_progressive_mode();
    comp.set_optimize_scans(true);

    let mut started = comp
        .start_compress(Vec::new())
        .map_err(|e| format!("mozjpeg 압축 시작 실패: {}", e))?;

    started
        .write_scanlines(rgb.as_raw())
        .map_err(|e| format!("mozjpeg 스캔라인 쓰기 실패: {}", e))?;

    let data = started
        .finish()
        .map_err(|e| format!("mozjpeg 압축 완료 실패: {}", e))?;

    std::fs::write(output_path, &data).map_err(|e| format!("JPEG 저장 실패: {}", e))?;

    Ok(data.len() as u64)
}
