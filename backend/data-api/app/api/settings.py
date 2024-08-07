from contextvars import ContextVar
from os import getenv
from typing import Any, Dict, Optional

from pydantic import BaseModel

data_db: ContextVar = ContextVar("data_db")
user_db: ContextVar = ContextVar("user_db")


class Settings(BaseModel):
    host: str = getenv("APP_HOST", "0.0.0.0")
    port: int = int(getenv("APP_PORT", 8080))

    database_settings: Dict[str, Any] = {
        "host": getenv("DATABASE_HOST", "localhost"),
        "port": getenv("DATABASE_PORT", 5432),
        "user": getenv("DATABASE_USER", "postgres"),
        "password": getenv("DATABASE_PASSWORD", "password"),
    }
    user_db_name: str = getenv("USER_DB_NAME", "users")

    access_token_expire_minutes: float = float(getenv("ACCESS_TOKEN_EXPIRE_MINUTES") or 30)

    auth_secret_key: Optional[str] = getenv("AUTH_SECRET_KEY", "test")

    google_client_id: Optional[str] = getenv("GOOGLE_CLIENT_ID", None)
    google_client_secret: Optional[str] = getenv("GOOGLE_CLIENT_SECRET", None)

    testing: bool = bool(getenv("TESTING", True))


settings = Settings()
