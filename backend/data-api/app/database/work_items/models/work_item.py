from datetime import datetime
from enum import StrEnum
from typing import Optional

from pydantic import Field

from app.database.common.models import MAX_ID_LENGTH, BaseModel, Model
from app.database.users.models.user import SlimUser


class WorkItemSortableField(StrEnum):
    ID = "id"
    TITLE = "title"
    STATUS = "status"
    PRIORITY = "priority"
    DUE_DATE = "due_date"
    CREATED_AT = "created_at"
    MODIFIED_AT = "modified_at"


class Priority(StrEnum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class CheckinFrequency(StrEnum):
    DAILY = "daily"
    WEEKLY = "weekly"
    BIWEEKLY = "bi-weekly"
    MONTHLY = "monthly"


class BaseWorkItem(BaseModel):
    title: Optional[str] = Field("", max_length=256)
    description: Optional[str] = ""
    status: Optional[str] = None
    priority: Optional[Priority] = None
    estimated_completion_date: Optional[datetime] = None
    checkin_frequency: Optional[CheckinFrequency] = None
    starred: Optional[bool] = False
    # product_area: Optional[str] = None  # TODO Possible config value, needs definition, should be like priority
    # tags: Optional[List[Tag]] = []  # TODO Create DB models and relationships
    # related_files: Optional[List[str]] = []  # TODO Create DB models for these relationships
    assigned_to_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)
    assigned_to: Optional[SlimUser] = None
    created_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)
    created_by: Optional[SlimUser] = None
    modified_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)
    archived_at: Optional[datetime] = None
    archived_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)
    completed_at: Optional[datetime] = None
    completed_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)

    # Status should be free text, but should be validated against a list, whether a default list or custom list

    # Priority should be free text, but should be validated against a list, whether a default list or custom list


class WorkItem(Model, BaseWorkItem):
    pass
