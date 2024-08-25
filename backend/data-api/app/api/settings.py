import logging
from contextvars import ContextVar
from os import getenv
from typing import Optional

from pydantic import BaseModel

data_db: ContextVar = ContextVar("data_db")
user_db: ContextVar = ContextVar("user_db")

logger = logging.getLogger(__name__)


class Settings(BaseModel):
    # Application settings
    host: str = getenv("APP_HOST", "0.0.0.0")
    port: int = int(getenv("APP_PORT", 8080))
    testing: bool = bool(getenv("TESTING", False))

    # Database settings
    database_connection_name: Optional[str] = getenv("DATABASE_CONNECTION_NAME", None)
    database_host: str = getenv("DATABASE_HOST", "localhost")
    database_port: int = int(getenv("DATABASE_PORT", 5432))
    database_user: str = getenv("DATABASE_USER", "postgres")
    database_password: str = getenv("DATABASE_PASSWORD", "password")
    user_db_name: str = getenv("USER_DB_NAME", "users")

    # Authentication settings
    auth_token_expire_seconds: float = float(getenv("AUTH_TOKEN_EXPIRE_SECONDS") or 3600)
    auth_secret_key: str = getenv("AUTH_SECRET_KEY", "test")

    # Google settings
    google_client_id: Optional[str] = getenv("GOOGLE_CLIENT_ID", None)
    google_client_secret: Optional[str] = getenv("GOOGLE_CLIENT_SECRET", None)

    # Sendgrid settings
    sendgrid_api_key: Optional[str] = getenv("SENDGRID_API_KEY", None)
    from_email: Optional[str] = getenv("SENDGRID_FROM_EMAIL", "<LucidShed Support> support@lucidshed.com")

    def get_database_url(self, db_name: Optional[str] = None) -> str:
        url = f"postgresql://{self.database_user}:{self.database_password}@{self.database_host}:{self.database_port}"
     
        if db_name:
            url = f"{url}/{db_name}"

        if self.database_connection_name:
            url = f"{url}?host=/cloudsql/{self.database_connection_name}"

        return url


settings = Settings()
