from typing import List, Optional

from pydantic import Field

from app.database.common.models import MAX_ID_LENGTH
from app.database.work_items.models.work_item import BaseWorkItem, WorkItem


class BaseFeatureRequest(BaseWorkItem):
    # id: int
    title: Optional[str] = Field("", max_length=256)
    company: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)
    submitted_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)
    # feature_assigned: Optional[List[str]] = []  # TODO make searchable, typeahead, etc.
    description: Optional[str] = ""
    # tags: Optional[List[Tag]] = []  # TODO Create DB models and relationships
    comments: Optional[List[str]] = []


class FeatureRequest(WorkItem, BaseFeatureRequest):
    pass
