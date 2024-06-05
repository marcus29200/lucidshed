from datetime import datetime
from data_api.orm.common import MAX_ID_LENGTH, Model
from pydantic import BaseModel, Field
from typing import Optional


class BaseWorkItem(BaseModel):
    title: Optional[str] = ""
    description: Optional[str] = ""
    status: Optional[str] = ""
    priority: Optional[str] = ""
    archived_at: Optional[datetime] = None
    archived_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)
    deleted_at: Optional[datetime] = None
    deleted_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)
    completed_at: Optional[datetime] = None
    completed_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)
    
    # Status should be free text, but should be validated against a list, whether a default list or custom list

    # Priority should be free text, but should be validated against a list, whether a default list or custom list

class WorkItem(Model, BaseWorkItem):
    created_at: datetime
    created_by_id: str = Field(max_length=MAX_ID_LENGTH)
    modified_at: datetime # Should probably be filled by db query of audit log table
    modified_by_id: str = Field(max_length=MAX_ID_LENGTH)
