use serde::{de::DeserializeOwned, Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "UPPERCASE")]
pub enum EventType {
    ChangeMyId,
    MessageReceived,
}

#[derive(Deserialize, Serialize)]
pub struct Event<D> {
    event_type: EventType,
    data: D,
}
