use actix::Message;
use uuid::Uuid;

#[derive(Message)]
#[rtype(result = "String")]
pub struct ChangeId {
    pub uid: Uuid,
    pub new_id: Uuid,
}
