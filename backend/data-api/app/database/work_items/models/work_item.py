from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.database.common.models import MAX_ID_LENGTH, Model


class BaseWorkItem(BaseModel):
    title: Optional[str] = ""
    description: Optional[str] = ""
    status: Optional[str] = None
    priority: Optional[str] = None
    created_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)
    modified_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)
    archived_at: Optional[datetime] = None
    archived_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)
    completed_at: Optional[datetime] = None
    completed_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)

    # Status should be free text, but should be validated against a list, whether a default list or custom list

    # Priority should be free text, but should be validated against a list, whether a default list or custom list


class WorkItem(Model, BaseWorkItem):
    pass
