import os
from typing import List, Optional

from dotenv import load_dotenv
from pydantic import BaseModel
from starlette.config import Config
from starlette.datastructures import CommaSeparatedStrings


class Settings(BaseModel):
    host: str = "0.0.0.0"
    port: int = 8080

    database_dsn: Optional[str] = "postgres://postgres:password@localhost:5432/data-api?sslmode=disable"


load_dotenv(".env")

config = Config(".env")
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SECRET_KEY = config("SECRET_KEY")
ALGORITHM = config("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(config("ACCESS_TOKEN_EXPIRE_MINUTES", default=30))

ROUTE_PREFIX_V1 = "/v1"
ALLOWED_HOSTS: List[str] = config(
    "ALLOWED_HOSTS",
    cast=CommaSeparatedStrings,
    default="",
)
