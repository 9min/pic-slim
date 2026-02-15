use base64::Engine;
use image::ImageReader;
use std::io::Cursor;
use std::path::Path;

pub fn generate_thumbnail(path: &Path) -> Result<String, String> {
    let img = ImageReader::open(path)
        .map_err(|e| format!("이미지 열기 실패: {}", e))?
        .decode()
        .map_err(|e| format!("이미지 디코딩 실패: {}", e))?;

    let thumb = img.thumbnail(128, 128);

    let mut buf = Cursor::new(Vec::new());
    thumb
        .write_to(&mut buf, image::ImageFormat::Jpeg)
        .map_err(|e| format!("썸네일 인코딩 실패: {}", e))?;

    let b64 = base64::engine::general_purpose::STANDARD.encode(buf.into_inner());
    Ok(format!("data:image/jpeg;base64,{}", b64))
}

pub fn generate_preview(path: &Path) -> Result<String, String> {
    let img = ImageReader::open(path)
        .map_err(|e| format!("이미지 열기 실패: {}", e))?
        .decode()
        .map_err(|e| format!("이미지 디코딩 실패: {}", e))?;

    let preview = img.thumbnail(800, 800);

    let mut buf = Cursor::new(Vec::new());
    preview
        .write_to(&mut buf, image::ImageFormat::Jpeg)
        .map_err(|e| format!("프리뷰 인코딩 실패: {}", e))?;

    let b64 = base64::engine::general_purpose::STANDARD.encode(buf.into_inner());
    Ok(format!("data:image/jpeg;base64,{}", b64))
}
