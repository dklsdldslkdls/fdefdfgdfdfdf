use tauri::{async_runtime::Mutex, utils::config, Manager};
use tauri_plugin_http::reqwest;

use crate::{
    types::{AppState, ConfigFile},
    util::get_access_token,
};

pub mod commands;
pub mod constants;
pub mod types;
pub mod util;
pub mod websocket;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_websocket::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::common::show_main_window,
            commands::connect_ws,
            commands::change_id_request
        ])
        .setup(|app| {
            let handle = app.handle().clone();

            let path = app.path().app_data_dir()?;
            match path.join(constants::CONFIG_FILE_NAME).exists() {
                true => {
                    let config: ConfigFile =
                        types::ConfigFile::load(path.join(constants::CONFIG_FILE_NAME))?;

                    println!("Loaded config: {:?}", config);
                    let access_token = config
                        .access_token()
                        .and_then(|token| Some(token.to_owned()));
                    app.manage(AppState::new(access_token, config));
                }
                false => {
                    // types::ConfigFile::new(Some("eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6ImYyNGVhMjNmLWJkN2ItNDU4My1iZjFhLWQ2OTNiMGMwMjQ5NCIsImV4cCI6MTc1ODYyNDE4M30.Y9sUS8k3_dvcddeS1p9hJITlmfLdzA63WJXsQMVUGhg".to_string())).save(path.join(constants::CONFIG_FILE_NAME))?;
                    let token = get_access_token()?;
                    let config = types::ConfigFile::new(Some(token.clone()));
                    config.save(path.join(constants::CONFIG_FILE_NAME))?;
                    app.manage(AppState::new(Some(token), config));
                }
            }

            tauri::async_runtime::spawn(async move {
                websocket::start_ws_client(handle, false).await;
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
