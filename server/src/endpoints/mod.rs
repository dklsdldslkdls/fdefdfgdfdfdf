use actix::Addr;
use actix_web::{HttpResponse, web};
use serde::Deserialize;
use uuid::Uuid;

use crate::{
    error::{Error, Result},
    websocket::{GetUID, server::GetClient},
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
pub async fn authenticate(
    srv: web::Data<Addr<crate::websocket::server::Server>>,
) -> Result<HttpResponse> {
    Ok(HttpResponse::Ok().finish())
}
