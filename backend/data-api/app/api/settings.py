import logging
from contextvars import ContextVar
from os import getenv
from typing import Optional

from pydantic import BaseModel

data_db: ContextVar = ContextVar("data_db")
user_db: ContextVar = ContextVar("user_db")

logger = logging.getLogger(__name__)


class Settings(BaseModel):
    host: str = getenv("APP_HOST", "0.0.0.0")
    port: int = int(getenv("APP_PORT", 8080))

    database_connection_name: Optional[str] = getenv("DATABASE_CONNECTION_NAME", None)
    database_host: str = getenv("DATABASE_HOST", "localhost")
    database_port: int = int(getenv("DATABASE_PORT", 5432))
    database_user: str = getenv("DATABASE_USER", "postgres")
    database_password: str = getenv("DATABASE_PASSWORD", "password")
    user_db_name: str = getenv("USER_DB_NAME", "users")

    access_token_expire_seconds: float = float(getenv("ACCESS_TOKEN_EXPIRE_SECONDS") or 3600)

    auth_secret_key: str = getenv("AUTH_SECRET_KEY", "test")

    google_client_id: Optional[str] = getenv("GOOGLE_CLIENT_ID", None)
    google_client_secret: Optional[str] = getenv("GOOGLE_CLIENT_SECRET", None)

    testing: bool = bool(getenv("TESTING", False))

    sendgrid_api_key: Optional[str] = getenv("SENDGRID_API_KEY", None)
    from_email: Optional[str] = getenv("FROM_EMAIL", "support@lucidshed.com")

    def get_database_url(self, db_name: Optional[str] = None) -> str:
        db_name = db_name or self.user_db_name

        if self.database_connection_name:
            url = f"postgresql://{self.database_user}:{self.database_password}@{self.database_host}:{self.database_port}/{db_name}?host=/cloudsql/{self.database_connection_name}"  # noqa
        else:
            url = f"postgresql://{self.database_user}:{self.database_password}@{self.database_host}:{self.database_port}/{db_name}"  # noqa

        return url


settings = Settings()
