use tauri::{AppHandle, Manager};

use crate::{constants, types::AppState, websocket::start_ws_client};

pub mod auth;
pub mod common;

#[tauri::command]
pub fn connect_ws(app: AppHandle) {
    println!("retry called");
    let handle = app.app_handle().clone();
    tauri::async_runtime::spawn(async move { start_ws_client(handle, true).await });
}

#[tauri::command]
pub async fn change_id_request(app: AppHandle) -> Result<(), String> {
    let app_s = app.state::<AppState>();

    let response = reqwest::Client::new()
        .post("http://localhost:8080/api/self/changeid")
        .header("Authorization", app_s.get_access_token().await.unwrap())
        .send()
        .await
        .map_err(|e| format!("Failed to send request: {}", e))?;

    println!("Response: {:?}", response.status());

    let token = response
        .json::<serde_json::Value>()
        .await
        .map_err(|e| format!("Failed to serialize server response {}", e))?["access_token"]
        .as_str()
        .unwrap()
        .to_string();

    app_s
        .set_access_token(
            token,
            app.path()
                .app_data_dir()
                .map_err(|e| format!("Failed to get app data dir: {}", e))?
                .join(constants::CONFIG_FILE_NAME),
        )
        .await
        .map_err(|e| format!("failed to set access token {:?}", e))?;

    Ok(())
}
