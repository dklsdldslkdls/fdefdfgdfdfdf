use crate::websocket::WsClient;
use actix::{Addr, Message, Recipient};
use serde::{Deserialize, Serialize, de::DeserializeOwned};
use uuid::Uuid;

#[derive(Deserialize, Serialize, Debug)]
#[serde(rename_all = "UPPERCASE")]
pub enum ClientEventType {
    ChangeMyId,
}

#[derive(Message, Serialize, Deserialize, Debug)]
#[rtype(result = "()")]
#[serde(rename_all = "camelCase")]
pub struct Event<T = serde_json::Value, E = ClientEventType> {
    pub event_type: E,
    pub data: T,
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
