pub mod event;

use std::sync::{
    atomic::{AtomicBool, Ordering},
    Arc,
};

use futures_util::{SinkExt, StreamExt};
use serde_json::json;
use tauri::{
    http::{HeaderValue, Request},
    AppHandle, Emitter, Listener, Manager,
};
use tokio::sync::Notify;
use tokio_tungstenite::{connect_async, connect_async_with_config};
use tungstenite::{client::IntoClientRequest, Bytes, Message};

use crate::types::AppState;

pub async fn start_ws_client(app: AppHandle, skip_frontend_wait: bool) {
    println!("Starting WebSocket client");
    let frontend_ready = Arc::new(Notify::new());
    let frontend_clone = frontend_ready.clone();

    if skip_frontend_wait {
        frontend_clone.notify_one();
    }

    let id = app.listen_any("frontend-ready", move |_| {
        frontend_clone.notify_one();
    });

    frontend_ready.notified().await;
    app.unlisten(id);

    let store = app.state::<AppState>();
    let mut url = "ws://localhost:8080/ws".into_client_request().unwrap();
    let headers = url.headers_mut();
    headers.insert(
        "Authorization",
        HeaderValue::from_str(store.get_access_token().await.unwrap().clone().as_str()).unwrap(),
    );

    let (mut socket, _) = match connect_async(url).await {
        Ok(socket) => socket,
        Err(err) => {
            app.emit(
                "initialization-status",
                json!({ "status": "failed", "message": err.to_string() }),
            )
            .unwrap();
            eprintln!("Failed to connect to WebSocket server: {}", err);
            return;
        }
    };

    app.emit("initialization-status", json!({ "status": "success" }))
        .unwrap();
    while let Some(Ok(msg)) = socket.next().await {
        if let Message::Text(ref text) = msg {
            println!("Received message: {}", text);
        }

        if let Message::Ping(_) = msg {
            app.emit("webscoket-status", json!({"status": "alive"}))
                .unwrap();
            socket.send(Message::Pong(Bytes::new())).await.unwrap();
        }
    }
}
