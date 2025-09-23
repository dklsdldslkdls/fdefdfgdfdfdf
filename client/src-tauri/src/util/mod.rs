pub fn get_access_token() -> Result<String, Box<dyn std::error::Error>> {
    let token = tauri::async_runtime::block_on(async move {
        let response = reqwest::Client::new()
            .post("http://localhost:8080/client/auth")
            .send()
            .await?;

        if !response.status().is_success() {
            return Err("Authentication failed".into());
        }

        let raw_val: serde_json::Value = response.json().await?;
        Ok(raw_val["access_token"].as_str().unwrap().to_string())
    });

    token
}
