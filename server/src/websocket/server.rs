use crate::websocket::event::{Connect, Disconnect};
use crate::websocket::{WsClient, actions};
use actix::{Actor, Addr, Handler, Message};
use std::collections::HashMap;
use uuid::Uuid;

#[derive(Message)]
#[rtype(result = "Option<Addr<WsClient>>")]
pub struct GetClient {
    pub id: Uuid,
}

#[derive(Message)]
#[rtype(result = "Vec<String>")]
pub struct GetClients;

#[derive(Default)]
pub struct Server {
    sessions: HashMap<Uuid, Addr<WsClient>>,
}

impl Actor for Server {
    type Context = actix::Context<Self>;
}

impl Handler<GetClients> for Server {
    type Result = Vec<String>;

    fn handle(&mut self, _msg: GetClients, _ctx: &mut Self::Context) -> Self::Result {
        self.sessions.keys().map(|id| id.to_string()).collect()
    }
}

// impl Handler<actions::ChangeId> for Server {
//     type Result = String;

//     fn handle(&mut self, client: actions::ChangeId, _ctx: &mut Self::Context) -> Self::Result {
//         let old_client = self.sessions.remove(&client.uid).unwrap();

//         self.sessions.insert(client.new_id, old_client);

//         client.new_id.to_string()
//     }
// }

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
