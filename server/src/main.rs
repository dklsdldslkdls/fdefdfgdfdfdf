pub mod endpoints;
pub mod error;
pub mod types;
pub mod websocket;
use std::{collections::HashMap, env};

use crate::{error::Result, types::TokenManager, websocket::WsClient};
use actix::{Actor, Addr};
use actix_web::{App, HttpRequest, HttpServer, Responder, web};
use actix_web_actors::ws;
use sqlx::postgres::PgPoolOptions;
use uuid::Uuid;

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
async fn main() -> Result<()> {
    dotenvy::dotenv().ok();
    tracing_subscriber::fmt::init();

    let pg_username = env::var("PG_USERNAME")?;
    let db_passwd = env::var("DB_PASSWD")?;
    let db_name = env::var("DB_NAME")?;
    let jwt_secret = env::var("JWT_SECRET")?;

    let app_state = TokenManager::new(jwt_secret);
    let ws_server = crate::websocket::server::Server::start_default();
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&format!(
            "postgres://{}:{}@localhost:5432/{}",
            pg_username, db_passwd, db_name
        ))
        .await?;

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(ws_server.clone()))
            .route("/ws", web::get().to(ws_index))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await?;

    Ok(())
}
