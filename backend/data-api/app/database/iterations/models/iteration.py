from datetime import datetime
from enum import StrEnum
from typing import Optional

from pydantic import BaseModel, Field

from app.database.common.models import MAX_ID_LENGTH, Model


class IterationSortableField(StrEnum):
    ID: str = "id"
    TITLE: str = "title"
    STATUS: str = "status"
    START_DATE: str = "start_date"
    END_DATE: str = "end_date"
    CREATED_AT: str = "created_at"
    MODIFIED_AT: str = "modified_at"


class BaseIteration(BaseModel):
    title: Optional[str] = ""
    description: Optional[str] = ""
    status: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    created_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)
    modified_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)


class Iteration(Model, BaseIteration):
    id: int  # type: ignore
