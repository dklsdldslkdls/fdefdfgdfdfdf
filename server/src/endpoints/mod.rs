use std::sync::Arc;

use actix::Addr;
use actix_web::{HttpResponse, web};
use chrono::{Duration, Utc};
use serde::Deserialize;
use ulid::Ulid;
use uuid::Uuid;

use crate::{
    error::{Error, Result},
    types::{Appstate, Claims},
    websocket::{
        GetUID,
        server::{GetClient, GetClients},
    },
};

#[derive(Deserialize)]
pub struct Payload {
    pub id: Uuid,
}

#[actix_web::get("/api/get_client")]
pub async fn get_client(
    payload: web::Json<Payload>,
    srv: web::Data<Addr<crate::websocket::server::Server>>,
) -> Result<Option<String>> {
    let id = match srv
        .send(GetClient { id: payload.id })
        .await
        .map_err(|e| Error::WebsocketServer(e.to_string()))?
    {
        Some(client) => Some(client.send(GetUID).await?),
        None => None,
    };

    Ok(id)
}

#[actix_web::post("/client/auth")]
pub async fn authenticate(app_state: web::Data<Arc<Appstate>>) -> Result<HttpResponse> {
    let id = Uuid::new_v4();

    let token = app_state.token_manager.generate_token(&Claims {
        id: id,
        exp: Utc::now()
            .checked_add_signed(Duration::hours(1))
            .expect("valid timestamp")
            .timestamp() as usize,
    })?;

    Ok(HttpResponse::Ok().json(serde_json::json!({"access_token": token})))
}

#[actix_web::get("/api/clients")]
pub async fn get_clients(srv: web::Data<Addr<crate::websocket::server::Server>>) -> Result<String> {
    let clients = srv
        .send(GetClients)
        .await
        .map_err(|e| Error::WebsocketServer(e.to_string()))?;

    Ok(serde_json::to_string(&clients)?)
}

#[actix_web::get("/api/clients/{id}")]
pub async fn get_client_by_id(
    id: web::Path<Uuid>,
    srv: web::Data<Addr<crate::websocket::server::Server>>,
) -> Result<Option<String>> {
    let id = match srv
        .send(GetClient {
            id: id.into_inner(),
        })
        .await
        .map_err(|e| Error::WebsocketServer(e.to_string()))?
    {
        Some(client) => Some(client.send(GetUID).await?),
        None => None,
    };

    Ok(id)
}
