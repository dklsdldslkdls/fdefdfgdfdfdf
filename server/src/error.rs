use actix_web::{HttpResponse, ResponseError, error::HttpError, http::StatusCode};

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

    #[error("{0}")]
    WebsocketServer(String),

    #[error(transparent)]
    MailBox(#[from] actix::MailboxError),

    #[error("something unexpected happen with the database {}", 0.to_string())]
    Database(#[from] sqlx::Error),

    #[error("Oops some environment variable is missing")]
    Enviroment(#[from] std::env::VarError),

    #[error("Oops some ulid generation failed {0}")]
    UlidGeneration(#[from] ulid::MonotonicError),
}

impl ResponseError for Error {
    fn status_code(&self) -> actix_web::http::StatusCode {
        match self {
            Error::Io(_) => actix_web::http::StatusCode::INTERNAL_SERVER_ERROR,
            Error::Json(_) => actix_web::http::StatusCode::BAD_REQUEST,
            Error::Jwt(_) => actix_web::http::StatusCode::UNAUTHORIZED,
            Error::ActixWeb(_) => actix_web::http::StatusCode::INTERNAL_SERVER_ERROR,
            Error::WebsocketServer(_) => actix_web::http::StatusCode::INTERNAL_SERVER_ERROR,
            Error::MailBox(_) => actix_web::http::StatusCode::INTERNAL_SERVER_ERROR,
            Error::Database(_) => actix_web::http::StatusCode::INTERNAL_SERVER_ERROR,
            Error::Enviroment(_) => actix_web::http::StatusCode::INTERNAL_SERVER_ERROR,
            Error::UlidGeneration(monotonic_error) => {
                actix_web::http::StatusCode::INTERNAL_SERVER_ERROR
            }
        }
    }

    fn error_response(&self) -> HttpResponse {
        match self {
            Error::Io(e) => HttpResponse::InternalServerError().json(e.to_string()),
            Error::Json(e) => HttpResponse::BadRequest().json(e.to_string()),
            Error::Jwt(_) => HttpResponse::Unauthorized().finish(),
            Error::ActixWeb(e) => HttpResponse::InternalServerError().json(e.to_string()),
            Error::WebsocketServer(e) => HttpResponse::InternalServerError().json(e.to_string()),
            Error::MailBox(mailbox_error) => {
                HttpResponse::InternalServerError().json(mailbox_error.to_string())
            }
            Error::Database(error) => HttpResponse::InternalServerError().json(error.to_string()),
            Error::Enviroment(_) => HttpResponse::InternalServerError().finish(),
            Error::UlidGeneration(_) => HttpResponse::InternalServerError().finish(),
        }
    }
}
