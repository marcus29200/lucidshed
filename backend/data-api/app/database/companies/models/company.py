from typing import Optional

from pydantic import BaseModel, Field

from app.database.common.models import Model


class BaseCompany(BaseModel):
    name: str = Field(..., max_length=256)
    description: Optional[str] = ""


class Company(Model, BaseCompany):
    id: int  # type: ignore
