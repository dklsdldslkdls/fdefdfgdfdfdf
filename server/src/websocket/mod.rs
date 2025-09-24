pub mod actions;
pub mod event;
pub mod server;

use crate::types::Appstate;
use crate::websocket::event::{ClientEventType, Connect, Disconnect, Event};
use crate::websocket::server::Server;
use actix::{Actor, Addr, AsyncContext, Context, Message, Recipient};
use actix::{ActorContext, StreamHandler};
use actix_web_actors::ws::{self};
use sqlx::PgPool;
use std::sync::Arc;
use std::{
    collections::HashMap,
    time::{Duration, Instant},
};
use uuid::Uuid;

const HEARTBEAT_INTERVAL: Duration = Duration::from_secs(5);
const CLIENT_TIMEOUT: Duration = Duration::from_secs(10);

#[derive(Message)]
#[rtype(result = "String")]
pub struct GetUID;

#[derive(Message)]
#[rtype(result = "()")]
pub struct WsClient {
    id: Uuid,
    last_seen: Instant,
    server_addr: Addr<Server>,
    app_state: Arc<Appstate>,
}

impl WsClient {
    pub fn new(id: Uuid, server_addr: Addr<Server>, app_state: Arc<Appstate>) -> Self {
        WsClient {
            id,
            server_addr,
            last_seen: Instant::now(),
            app_state,
        }
    }
}

impl actix::Handler<GetUID> for WsClient {
    type Result = String;

    fn handle(&mut self, _msg: GetUID, _ctx: &mut Self::Context) -> Self::Result {
        self.id.to_string()
    }
}

impl Actor for WsClient {
    type Context = ws::WebsocketContext<Self>;

    fn started(&mut self, ctx: &mut Self::Context) {
        self.last_seen = Instant::now();
        println!("connected {}", self.id);

        self.server_addr.do_send(Connect {
            id: self.id,
            addr: ctx.address(),
        });

        ctx.run_interval(HEARTBEAT_INTERVAL, |client, ctx| {
            if Instant::now().duration_since(client.last_seen) > CLIENT_TIMEOUT {
                ctx.stop();
            } else {
                client.last_seen = Instant::now();
            }

            ctx.ping(b"");
        });
    }

    fn stopped(&mut self, _: &mut Self::Context) {
        println!("disconnected {}", self.id);

        self.server_addr.do_send(Disconnect { id: self.id });
    }
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for WsClient {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        match msg {
            Ok(ws::Message::Text(raw)) => {
                let raw_event: Event = match serde_json::from_str(&raw) {
                    Ok(event) => event,
                    Err(e) => {
                        tracing::error!("Failed to parse event: {}", e);
                        return;
                    }
                };

                match raw_event.event_type {
                    _ => {}
                }
            }
            Ok(ws::Message::Pong(_)) => {
                self.last_seen = Instant::now();
            }
            Ok(ws::Message::Ping(msg)) => {
                ctx.pong(&msg);
            }
            Err(e) => {
                tracing::error!("{}", e.to_string())
            }

            _ => {}
        }
    }
}
