pub mod endpoints;
pub mod error;
pub mod websocket;
use actix::{Actor, Addr};
use actix_web::{App, HttpRequest, HttpResponse, HttpServer, Responder, web};
use actix_web_actors::ws;
use std::{ops::Deref, sync::Arc};
use uuid::Uuid;

use crate::websocket::WsClient;

pub async fn ws_index(
    req: HttpRequest,
    stream: web::Payload,
    srv: web::Data<Addr<crate::websocket::server::Server>>,
) -> crate::error::Result<impl Responder> {
    let id = Uuid::new_v4();

    let ws = WsClient::new(id, srv.get_ref().clone());

    Ok(ws::start(ws, &req, stream)?)
}

#[actix_web::main]
async fn main() -> Result<(), std::io::Error> {
    tracing_subscriber::fmt::init();
    let ws_server = crate::websocket::server::Server::start_default();

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(ws_server.clone()))
            .route("/ws", web::get().to(ws_index)) // .route("/ws", web::get().to())
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await?;

    Ok(())
}
