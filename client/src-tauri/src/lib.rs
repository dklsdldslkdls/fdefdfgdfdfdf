use tauri::{async_runtime::Mutex, utils::config, Manager};

use crate::types::{AppState, ConfigFile};

pub mod commands;
pub mod constants;
pub mod types;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![commands::common::show_main_window])
        .setup(|app| {
            let path = app.path().app_data_dir()?;
            match !path.join(constants::CONFIG_FILE_NAME).exists() {
                true => {
                    let config = serde_json::to_string(&types::ConfigFile::default())?;
                    std::fs::write(path.join(constants::CONFIG_FILE_NAME), config)?;
                    app.manage(AppState::default());
                }
                false => {
                    let config: ConfigFile = serde_json::from_str(&std::fs::read_to_string(
                        path.join(constants::CONFIG_FILE_NAME),
                    )?)?;
                    config.access_token();
                    // app.manage(AppState::new());
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
