mod commands;
mod compressor;
mod thumbnail;
mod utils;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::load_images,
            commands::compress_images,
            commands::open_output_folder,
            commands::get_default_output_dir,
            commands::get_image_preview,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
