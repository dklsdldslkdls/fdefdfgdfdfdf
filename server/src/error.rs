use actix_web::{HttpResponse, ResponseError, error::HttpError};

pub type Result<T> = std::result::Result<T, Error>;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),

    #[error(transparent)]
    Json(#[from] serde_json::Error),

    #[error(transparent)]
    Jwt(#[from] jsonwebtoken::errors::Error),

    #[error(transparent)]
    ActixWeb(#[from] actix_web::Error),
}

impl ResponseError for Error {
    fn status_code(&self) -> actix_web::http::StatusCode {
        match self {
            Error::Io(_) => actix_web::http::StatusCode::INTERNAL_SERVER_ERROR,
            Error::Json(_) => actix_web::http::StatusCode::BAD_REQUEST,
            Error::Jwt(_) => actix_web::http::StatusCode::UNAUTHORIZED,
            Error::ActixWeb(_) => actix_web::http::StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    fn error_response(&self) -> HttpResponse {
        match self {
            Error::Io(e) => HttpResponse::InternalServerError().json(e.to_string()),
            Error::Json(e) => HttpResponse::BadRequest().json(e.to_string()),
            Error::Jwt(_) => HttpResponse::Unauthorized().finish(),
            Error::ActixWeb(e) => HttpResponse::InternalServerError().json(e.to_string()),
        }
    }
}
