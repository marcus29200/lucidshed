from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.database.common.models import MAX_ID_LENGTH, Model


class BaseIteration(BaseModel):
    title: Optional[str] = ""
    description: Optional[str] = ""
    status: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    created_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)
    modified_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)


class Iteration(Model, BaseIteration):
    id: int
    organization_id: str = Field(max_length=MAX_ID_LENGTH)
