use actix::{Addr, Message, Recipient};
use serde::Serialize;
use uuid::Uuid;

use crate::websocket::WsClient;

#[derive(Message, Serialize)]
#[rtype(result = "()")]
#[serde(rename_all = "camelCase")]
pub struct Event {
    pub event_type: String,
    pub data: serde_json::Value,
}

#[derive(Message)]
#[rtype(result = "()")]
pub struct Connect {
    pub id: Uuid,
    pub addr: Addr<WsClient>,
}

#[derive(Message)]
#[rtype(result = "()")]
pub struct Disconnect {
    pub id: Uuid,
}
