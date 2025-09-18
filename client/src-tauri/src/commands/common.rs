use tauri::{AppHandle, Manager};

#[tauri::command]
pub fn show_main_window(window: AppHandle) {
    window.get_webview_window("main").unwrap().show().unwrap();
}
