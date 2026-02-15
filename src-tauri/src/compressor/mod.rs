pub mod gif;
pub mod jpeg;
pub mod png;

use crate::utils::ImageFormat;
use std::path::Path;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct CompressionResult {
    pub success: bool,
    pub original_size: u64,
    pub compressed_size: u64,
    pub output_path: String,
    pub error: Option<String>,
}

pub fn compress(
    input_path: &Path,
    output_path: &Path,
    format: ImageFormat,
    quality: u32,
) -> CompressionResult {
    let original_size = std::fs::metadata(input_path)
        .map(|m| m.len())
        .unwrap_or(0);

    let result = match format {
        ImageFormat::Jpeg => jpeg::compress(input_path, output_path, quality),
        ImageFormat::Png => png::compress(input_path, output_path, quality),
        ImageFormat::Gif => gif::compress(input_path, output_path, quality),
    };

    match result {
        Ok(compressed_size) => {
            // If compressed is larger than original, copy original instead
            if compressed_size >= original_size {
                if let Err(e) = std::fs::copy(input_path, output_path) {
                    return CompressionResult {
                        success: false,
                        original_size,
                        compressed_size: 0,
                        output_path: output_path.to_string_lossy().to_string(),
                        error: Some(format!("원본 복사 실패: {}", e)),
                    };
                }
                CompressionResult {
                    success: true,
                    original_size,
                    compressed_size: original_size,
                    output_path: output_path.to_string_lossy().to_string(),
                    error: None,
                }
            } else {
                CompressionResult {
                    success: true,
                    original_size,
                    compressed_size,
                    output_path: output_path.to_string_lossy().to_string(),
                    error: None,
                }
            }
        }
        Err(e) => CompressionResult {
            success: false,
            original_size,
            compressed_size: 0,
            output_path: output_path.to_string_lossy().to_string(),
            error: Some(e),
        },
    }
}
