from datetime import datetime
from enum import StrEnum
from typing import List, Optional

from app.database.work_items.models.work_item import BaseWorkItem, WorkItem


class SupportItemStatus(StrEnum):
    NEW: str = "new"
    OPEN: str = "open"
    PENDING: str = "pending"
    ONHOLD: str = "on-hold"


class SupportItemType(StrEnum):
    PROBLEM: str = "problem"
    QUESTION: str = "question"
    REQUEST: str = "request"


class BaseSupportItem(BaseWorkItem):
    status: Optional[SupportItemStatus] = SupportItemStatus.NEW
    owner: Optional[str] = None
    customer: Optional[str] = None
    primary_contact: Optional[str] = None
    secondary_contact: Optional[List[str]] = []
    next_response_due: Optional[datetime] = None
    # email_thread: Optional[List[Email]] = [] # TODO Create DB models and relationships.
    # Or store as comments but set these to public vs private for external/internal communications?
    # solution: Optional[str] = None  # TODO Possible config value, needs definition

    def __init__(self, **data):
        data["status"] = data.get("status") or SupportItemStatus.NEW.value  # No None Status

        super().__init__(**data)


class SupportItem(WorkItem, BaseSupportItem):
    pass
