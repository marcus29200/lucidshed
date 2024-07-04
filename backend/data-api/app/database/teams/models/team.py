from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.database.common.models import MAX_ID_LENGTH, Model


class BaseTeam(BaseModel):
    title: Optional[str] = ""
    description: Optional[str] = ""
    created_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)
    modified_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)


class Team(Model, BaseTeam):
    id: int
    organization_id: str = Field(max_length=MAX_ID_LENGTH)
