use crate::compressor::{self, CompressionResult};
use crate::thumbnail;
use crate::utils::{self, ImageFormat};
use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use tauri::ipc::Channel;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImageFileInfo {
    pub id: String,
    pub path: String,
    pub name: String,
    pub size: u64,
    pub size_display: String,
    pub format: ImageFormat,
    pub thumbnail: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompressionSettings {
    pub quality: u32,
    pub output_dir: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct CompressionEvent {
    pub event_type: String, // "start", "complete", "error"
    pub image_id: String,
    pub result: Option<CompressionResult>,
}

#[tauri::command]
pub fn load_images(paths: Vec<String>) -> Vec<ImageFileInfo> {
    paths
        .into_iter()
        .filter_map(|p| {
            let path = Path::new(&p);
            if !path.exists() || !path.is_file() {
                return None;
            }

            let format = utils::detect_format(path)?;
            let metadata = std::fs::metadata(path).ok()?;
            let size = metadata.len();
            let name = path
                .file_name()
                .unwrap_or_default()
                .to_string_lossy()
                .to_string();

            let thumbnail = thumbnail::generate_thumbnail(path).unwrap_or_default();

            Some(ImageFileInfo {
                id: uuid::Uuid::new_v4().to_string(),
                path: p,
                name,
                size,
                size_display: utils::format_file_size(size),
                format,
                thumbnail,
            })
        })
        .collect()
}

#[tauri::command]
pub fn compress_images(
    images: Vec<ImageFileInfo>,
    settings: CompressionSettings,
    on_event: Channel<CompressionEvent>,
) -> Vec<CompressionResult> {
    let output_dir = PathBuf::from(&settings.output_dir);
    let _ = utils::ensure_output_dir(&output_dir);

    let results: Vec<CompressionResult> = images
        .par_iter()
        .map(|img| {
            // Emit start event
            let _ = on_event.send(CompressionEvent {
                event_type: "start".to_string(),
                image_id: img.id.clone(),
                result: None,
            });

            let input_path = Path::new(&img.path);
            let output_path = output_dir.join(&img.name);

            let result =
                compressor::compress(input_path, &output_path, img.format, settings.quality);

            // Emit complete or error event
            let event_type = if result.success {
                "complete"
            } else {
                "error"
            };
            let _ = on_event.send(CompressionEvent {
                event_type: event_type.to_string(),
                image_id: img.id.clone(),
                result: Some(result.clone()),
            });

            result
        })
        .collect();

    results
}

#[tauri::command]
pub fn open_output_folder(path: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("폴더 열기 실패: {}", e))?;
    }
    #[cfg(not(target_os = "windows"))]
    {
        std::process::Command::new("xdg-open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("폴더 열기 실패: {}", e))?;
    }
    Ok(())
}

#[tauri::command]
pub fn get_default_output_dir() -> String {
    if let Some(pictures) = dirs_next_pictures_dir() {
        let output = pictures.join("PicSlim");
        return output.to_string_lossy().to_string();
    }
    // Fallback to user's home directory
    if let Some(home) = std::env::var_os("USERPROFILE")
        .or_else(|| std::env::var_os("HOME"))
    {
        let output = PathBuf::from(home).join("Pictures").join("PicSlim");
        return output.to_string_lossy().to_string();
    }
    "PicSlim_Output".to_string()
}

fn dirs_next_pictures_dir() -> Option<PathBuf> {
    #[cfg(target_os = "windows")]
    {
        std::env::var_os("USERPROFILE").map(|h| PathBuf::from(h).join("Pictures"))
    }
    #[cfg(not(target_os = "windows"))]
    {
        std::env::var_os("HOME").map(|h| PathBuf::from(h).join("Pictures"))
    }
}

#[tauri::command]
pub fn get_image_preview(path: String) -> Result<String, String> {
    thumbnail::generate_preview(Path::new(&path))
}
