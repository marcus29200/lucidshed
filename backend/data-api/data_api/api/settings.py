from pydantic import BaseModel
from typing import Optional


class Settings(BaseModel):
    host: str = "0.0.0.0"
    port: int = 8080

    database_dsn: Optional[str] = (
        "postgres://postgres:password@localhost:5432/data-api?sslmode=disable"
    )
