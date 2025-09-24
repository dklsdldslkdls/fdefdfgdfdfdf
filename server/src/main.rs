pub mod endpoints;
pub mod error;
pub mod types;
pub mod utils;
pub mod websocket;
use std::{collections::HashMap, env, rc::Rc, sync::Arc};

use crate::{
    error::{Error, Result},
    types::{Appstate, TokenManager},
    websocket::WsClient,
};
use actix::{Actor, Addr};
use actix_web::{App, HttpRequest, HttpServer, Responder, web};
use actix_web_actors::ws;
use sqlx::postgres::PgPoolOptions;
use uuid::Uuid;

pub async fn ws_index(
    req: HttpRequest,
    stream: web::Payload,
    srv: web::Data<Addr<crate::websocket::server::Server>>,
    app_state: web::Data<Arc<Appstate>>,
) -> crate::error::Result<impl Responder> {
    let token = req
        .headers()
        .get("Authorization")
        .and_then(|hv| hv.to_str().ok())
        .ok_or_else(|| actix_web::error::ErrorUnauthorized("Missing Authorization header"))?;
    let claims = app_state.token_manager.validate_token(&token)?;
    println!("client tried to reconnect with id {}", claims.id);

    if sqlx::query!(
        "SELECT id FROM clients WHERE id = $1",
        claims.id.to_string()
    )
    .fetch_optional(app_state.pool())
    .await?
    .is_none()
    {
        println!("not found in databae");
        return Err(Error::Unauthorized);
    }

    let ws = WsClient::new(
        claims.id,
        srv.get_ref().clone(),
        app_state.get_ref().clone(),
    );

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

    let token_manager = TokenManager::new(jwt_secret);
    let ws_server = crate::websocket::server::Server::start_default();
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&format!(
            "postgres://{}:{}@localhost:5432/{}",
            pg_username, db_passwd, db_name
        ))
        .await?;

    let app_state = Arc::new(Appstate::new(pool, token_manager));

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(ws_server.clone()))
            .app_data(web::Data::new(app_state.clone()))
            .route("/ws", web::get().to(ws_index))
            .service(crate::endpoints::authenticate)
            .service(crate::endpoints::change_id)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await?;

    Ok(())
}
