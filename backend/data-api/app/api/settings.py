from typing import Optional

from pydantic import BaseModel


class Settings(BaseModel):
    host: str = "0.0.0.0"
    port: int = 8080

    database_dsn: Optional[str] = "postgres://postgres:password@localhost:5432/data-api?sslmode=disable"


import os
from typing import List

from dotenv import load_dotenv
from starlette.config import Config
from starlette.datastructures import CommaSeparatedStrings

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
