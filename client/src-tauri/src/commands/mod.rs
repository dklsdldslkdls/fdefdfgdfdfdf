use tauri::{AppHandle, Manager};

use crate::websocket::start_ws_client;

pub mod auth;
pub mod common;

#[tauri::command]
pub fn connect_ws(app: AppHandle) {
    println!("retry called");
    let handle = app.app_handle().clone();
    tauri::async_runtime::spawn(async move { start_ws_client(handle, true).await });
}
