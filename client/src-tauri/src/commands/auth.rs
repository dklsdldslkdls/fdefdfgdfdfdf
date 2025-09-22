use tauri::{AppHandle, Emitter, Manager, State};
use tokio::sync::Mutex;

use crate::types::AppState;

// use crate::{constants::CONFIG_FILE_NAME, types::ConfigFile};

#[tauri::command]
pub async fn authenticate(
    app: AppHandle,
    state: State<'_, Mutex<AppState>>,
) -> Result<(), Box<dyn std::error::Error>> {
    let path = app.path().app_data_dir()?;

    app.emit("auth:success", ());
    todo!()
}
