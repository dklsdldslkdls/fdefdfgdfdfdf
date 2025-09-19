pub mod event;
pub mod server;

use actix::{Actor, Addr, AsyncContext, Context, Message, Recipient};
use actix::{ActorContext, StreamHandler};
use actix_web_actors::ws::{self};
use std::{
    collections::HashMap,
    time::{Duration, Instant},
};
use uuid::Uuid;

use crate::websocket::event::{Connect, Disconnect};
use crate::websocket::server::Server;

const HEARTBEAT_INTERVAL: Duration = Duration::from_secs(5);
const CLIENT_TIMEOUT: Duration = Duration::from_secs(10);

#[derive(Message)]
#[rtype(result = "()")]
pub struct WsClient {
    id: Uuid,
    last_seen: Instant,
    server_addr: Addr<Server>,
}

impl WsClient {
    pub fn new(id: Uuid, server_addr: Addr<Server>) -> Self {
        WsClient {
            id,
            server_addr,
            last_seen: Instant::now(),
        }
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

    fn stopped(&mut self, ctx: &mut Self::Context) {
        println!("disconnected {}", self.id);

        self.server_addr.do_send(Disconnect { id: self.id });
    }
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for WsClient {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        match msg {
            Ok(ws::Message::Pong(_)) => {
                self.last_seen = Instant::now();
            }
            Ok(ws::Message::Ping(msg)) => {
                ctx.pong(&msg);
            }
            // gestisci altri messaggi WebSocket (Text, Binary, Close, ecc.) qui
            _ => (),
        }
    }
}
