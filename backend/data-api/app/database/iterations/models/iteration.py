from datetime import datetime
from enum import StrEnum
from typing import Optional, Set

from pydantic import Field

from app.database.common.models import MAX_ID_LENGTH, BaseModel, Model


class IterationSortableField(StrEnum):
    ID = "id"
    TITLE = "title"
    STATUS = "status"
    START_DATE = "start_date"
    END_DATE = "end_date"
    CREATED_AT = "created_at"
    MODIFIED_AT = "modified_at"


class BaseIteration(BaseModel):
    title: Optional[str] = ""
    description: Optional[str] = ""
    status: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    created_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)
    modified_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)


class Iteration(Model, BaseIteration):
    @property
    def indexed_fields(self) -> Set[str]:
        return {"id", "title", "description", "status", "start_date", "end_date", "created_at", "modified_at"}
