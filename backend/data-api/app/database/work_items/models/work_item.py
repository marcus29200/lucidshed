from datetime import datetime
from typing import Optional
from enum import StrEnum

from pydantic import BaseModel, Field

from app.database.common.models import MAX_ID_LENGTH, Model


class Priority(StrEnum):
    CRITICAL: str = "critical"
    HIGH: str = "high"
    MEDIUM: str = "medium"
    LOW: str = "low"


class CheckinFrequency(StrEnum):
    DAILY: str = "daily"
    WEEKLY: str = "weekly"
    BIWEEKLY: str = "bi-weekly"
    MONTHLY: str = "monthly"


class BaseWorkItem(BaseModel):
    title: Optional[str] = ""
    description: Optional[str] = ""
    status: Optional[str] = None
    priority: Optional[Priority] = None
    estimated_completion_date: Optional[datetime] = None
    checkin_frequency: Optional[CheckinFrequency] = None
    starred: Optional[bool] = False
    # TODO Implement relationships for stories/tasks, also the category like related/dependant
    # product_area: Optional[str] = None  # TODO Possible config value, needs definition
    # tags: Optional[List[Tag]] = []  # TODO Create DB models and relationships
    # related_tickets: Optional[List[str]] = []  # TODO Create DB models for these relationships
    # related_files: Optional[List[str]] = []  # TODO Create DB models for these relationships
    # comments: Optional[List[Comment]] = []  # TODO Create DB models and relationships
    created_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)
    modified_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)
    archived_at: Optional[datetime] = None
    archived_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)
    completed_at: Optional[datetime] = None
    completed_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)

    # Status should be free text, but should be validated against a list, whether a default list or custom list

    # Priority should be free text, but should be validated against a list, whether a default list or custom list


class WorkItem(Model, BaseWorkItem):
    id: int
    organization_id: str = Field(max_length=MAX_ID_LENGTH)
