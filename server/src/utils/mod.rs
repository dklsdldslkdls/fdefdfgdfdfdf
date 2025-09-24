use crate::error::Result;
use actix_web::HttpRequest;

pub fn extract_auth_token(req: &HttpRequest) -> Result<String> {
    let token = req
        .headers()
        .get("Authorization")
        .and_then(|hv| hv.to_str().ok())
        .ok_or_else(|| actix_web::error::ErrorUnauthorized("Missing Authorization header"))?;

    Ok(String::from(token))
}
