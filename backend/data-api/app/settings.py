import logging
from contextvars import ContextVar
from typing import Dict, List, Optional

from asyncpg import Pool
from pydantic_settings import BaseSettings, SettingsConfigDict

database_pools: ContextVar[Dict[str, Pool]] = ContextVar("database_pools", default={})

data_db: ContextVar = ContextVar("data_db")
user_db: ContextVar = ContextVar("user_db")

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    # Application settings
    host: str = "0.0.0.0"
    port: int = 8080
    testing: bool = False
    frontend_url: str = "http://localhost:3000"

    log_level: str = "INFO"

    rate_limit_requests: bool = True
    notify_of_signup: List[str] = []

    # Database settings
    database_connection_name: Optional[str] = None
    database_host: str = "localhost"
    database_port: int = 5432
    database_user: str = "postgres"
    database_password: str = "password"
    user_db_name: str = "users"

    # Authentication settings
    auth_token_expire_seconds: float = 3600
    auth_secret_key: str = "test"

    # Google settings
    google_client_id: Optional[str] = None
    google_client_secret: Optional[str] = None
    google_service_account_email: Optional[str] = "test@test.iam.gserviceaccount.com"

    # Google Cloud Storage settings
    gcs_bucket: Optional[str] = None
    gcs_path: Optional[str] = "/api/files"

    # Sendgrid settings
    sendgrid_api_key: Optional[str] = None
    from_email: Optional[str] = "support@lucidshed.com"
    from_name: Optional[str] = "LucidShed Support"

    # OpenAI settings
    openai_api_key: Optional[str] = None

    # Opensearch settings
    opensearch_host: Optional[str] = "localhost"
    opensearch_username: Optional[str] = "admin"
    opensearch_password: Optional[str] = "Luc1dshedTester!"
    opensearch_async_indexing: bool = True
    opensearch_enabled: bool = True

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    def get_database_url(self, db_name: Optional[str] = None) -> str:
        url = f"postgresql://{self.database_user}:{self.database_password}@{self.database_host}:{self.database_port}"

        if db_name:
            url = f"{url}/{db_name}"

        # If we're configured to use Cloud SQL
        if self.database_connection_name:
            url = f"{url}?host=/cloudsql/{self.database_connection_name}"

        return url


settings = Settings()
