use crate::error::Result;
use crate::websocket::WsClient;
use crate::websocket::event::{Connect, Disconnect, Event};
use actix::{Actor, Addr, AsyncContext, Handler, Recipient};
use serde::Serialize;
use std::collections::HashMap;
use uuid::Uuid;

#[derive(Default)]
pub struct Server {
    sessions: HashMap<Uuid, Addr<WsClient>>,
}

impl Actor for Server {
    type Context = actix::Context<Self>;
}

impl Handler<Connect> for Server {
    type Result = ();

    fn handle(&mut self, msg: Connect, ctx: &mut Self::Context) {
        let id = msg.id;
        let addr = ctx.address();
        self.sessions.insert(id, msg.addr);
    }
}

impl Handler<Disconnect> for Server {
    type Result = ();

    fn handle(&mut self, msg: Disconnect, ctx: &mut Self::Context) {
        self.sessions.remove(&msg.id);
    }
}
