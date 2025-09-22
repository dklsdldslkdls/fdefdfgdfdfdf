use jsonwebtoken::{DecodingKey, EncodingKey, Header};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::error::Result;

#[derive(Serialize, Deserialize)]
pub struct Claims {
    pub id: Uuid,
    pub exp: usize,
}

pub struct TokenManager {
    secret: String,
    enc_key: EncodingKey,
    dec_key: DecodingKey,
}

impl TokenManager {
    pub fn new(secret: String) -> Self {
        let enc_key = EncodingKey::from_secret(secret.as_bytes());
        let dec_key = DecodingKey::from_secret(secret.as_bytes());
        Self {
            secret,
            enc_key,
            dec_key,
        }
    }

    pub fn create_token(&self, payload: &Claims) -> Result<String> {
        Ok(jsonwebtoken::encode(
            &Header::default(),
            &payload,
            &self.enc_key,
        )?)
    }

    pub fn validate_token(&self, token: &str) -> Result<Claims> {
        Ok(jsonwebtoken::decode::<Claims>(
            token,
            &self.dec_key,
            &jsonwebtoken::Validation::default(),
        )
        .map(|data| data.claims)?)
    }
}
