use std::{
    fs::File,
    io::{Read, Write},
    path::PathBuf,
};

use postcard::to_allocvec;
use serde::{Deserialize, Serialize};
use tauri::{
    async_runtime::Mutex, webview::cookie::time::format_description::well_known::iso8601::Config,
};
use tokio::sync::MutexGuard;

use crate::constants::CONFIG_FILE_NAME;

#[derive(Debug, Serialize, Deserialize)]
pub struct ConfigFile {
    access_token: Option<String>,
}

impl ConfigFile {
    pub fn new(access_token: Option<String>) -> Self {
        Self { access_token }
    }

    pub fn access_token(&self) -> Option<&str> {
        self.access_token.as_deref()
    }

    pub fn save(&self, path: PathBuf) -> Result<(), Box<dyn std::error::Error>> {
        let mut file = File::create(path)?;
        let bytes = to_allocvec(&self)?;
        file.write_all(&bytes)?;
        Ok(())
    }

    pub fn load(path: PathBuf) -> Result<Self, Box<dyn std::error::Error>> {
        let mut file = File::open(path)?;
        let mut bytes = Vec::new();
        file.read_to_end(&mut bytes)?;
        Ok(postcard::from_bytes(&bytes)?)
    }
}

impl Default for ConfigFile {
    fn default() -> Self {
        Self { access_token: None }
    }
}

#[derive(Default)]
pub struct AppState(Mutex<Option<String>>);

impl AppState {
    pub fn new(token: Option<String>) -> Self {
        Self(Mutex::new(token))
    }

    pub async fn set_access_token(&self, token: String) -> Result<(), Box<dyn std::error::Error>> {
        let mut guard = self.0.lock().await;
        *guard = Some(token);

        Ok(())
    }

    pub async fn clear_access_token(&self) -> Result<(), Box<dyn std::error::Error>> {
        let mut guard = self.0.lock().await;
        *guard = None;

        Ok(())
    }

    pub async fn get_access_token(&self) -> Option<String> {
        self.0.lock().await.clone()
    }

    pub async fn has_token(&self) -> bool {
        self.0.lock().await.is_some()
    }
}
