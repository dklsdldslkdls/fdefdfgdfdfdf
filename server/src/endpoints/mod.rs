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
    utils::extract_auth_token,
    websocket::{
        GetUID,
        actions::ChangeId,
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

    let tx = app_state.pool().begin().await?;

    sqlx::query!("INSERT INTO clients (id) VALUES ($1)", id.to_string())
        .execute(app_state.pool())
        .await?;

    tx.commit().await?;

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
#[actix_web::post("/api/self/changeid")]
pub async fn change_id(
    req: actix_web::HttpRequest,
    app_state: web::Data<Arc<Appstate>>,
    srv: web::Data<Addr<crate::websocket::server::Server>>,
) -> Result<HttpResponse> {
    let id = Uuid::new_v4();
    let claims = app_state
        .token_manager
        .validate_token(&extract_auth_token(&req)?)?;

    let new_token = app_state.token_manager.generate_token(&claims)?;

    Ok(HttpResponse::Ok().json(serde_json::json!({"access_token": new_token})))
}
