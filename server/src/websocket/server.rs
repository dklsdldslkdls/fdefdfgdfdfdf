use crate::websocket::WsClient;
use crate::websocket::event::{Connect, Disconnect};
use actix::{Actor, Addr, Handler, Message};
use std::collections::HashMap;
use uuid::Uuid;

#[derive(Message)]
#[rtype(result = "Option<Addr<WsClient>>")]
pub struct GetClient {
    pub id: Uuid,
}

#[derive(Default)]
pub struct Server {
    sessions: HashMap<Uuid, Addr<WsClient>>,
}

impl Actor for Server {
    type Context = actix::Context<Self>;
}

impl Handler<GetClient> for Server {
    type Result = Option<Addr<WsClient>>;

    fn handle(&mut self, msg: GetClient, _ctx: &mut Self::Context) -> Self::Result {
        self.sessions.get(&msg.id).cloned()
    }
}

impl Handler<Connect> for Server {
    type Result = ();

    fn handle(&mut self, msg: Connect, ctx: &mut Self::Context) {
        let id = msg.id;
        self.sessions.insert(id, msg.addr);
    }
}

impl Handler<Disconnect> for Server {
    type Result = ();

    fn handle(&mut self, msg: Disconnect, ctx: &mut Self::Context) {
        self.sessions.remove(&msg.id);
    }
}
