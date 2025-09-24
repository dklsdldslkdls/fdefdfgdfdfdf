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

    pub fn set_access_token(&mut self, token: String) -> Result<(), Box<dyn std::error::Error>> {
        self.access_token = Some(token);

        Ok(())
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
pub struct AppState {
    token: Mutex<Option<String>>,
    config: Mutex<ConfigFile>,
}

impl AppState {
    pub fn new(token: Option<String>, config: ConfigFile) -> Self {
        Self {
            token: Mutex::new(token),
            config: Mutex::new(config),
        }
    }

    pub async fn set_access_token(
        &self,
        token: String,
        path: PathBuf,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let mut guard = self.token.lock().await;
        *guard = Some(token.clone());

        let mut guard = self.config.lock().await;
        guard.set_access_token(token.clone())?;
        guard.save(path);

        Ok(())
    }

    pub async fn clear_access_token(&self) -> Result<(), Box<dyn std::error::Error>> {
        let mut guard = self.token.lock().await;
        *guard = None;

        Ok(())
    }

    pub async fn get_access_token(&self) -> Option<String> {
        self.token.lock().await.clone()
    }

    pub async fn has_token(&self) -> bool {
        self.token.lock().await.is_some()
    }
}
