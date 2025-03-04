from datetime import datetime
from typing import List, Optional

from pydantic import Field

from app.database.common.models import MAX_ID_LENGTH
from app.database.work_items.models.work_item import BaseWorkItem, WorkItem


class BaseFeatureRequest(BaseWorkItem):
    title: Optional[str] = Field("", max_length=256)
    submitted_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)
    submitted_date: Optional[datetime] = None
    feature_assigned: Optional[str] = Field("", max_length=256)  # TODO make searchable, typeahead, etc.
    description: Optional[str] = ""
    company_id: Optional[int] = None
    # tags: Optional[List[Tag]] = []  # TODO Create DB models and relationships
    comments: Optional[List[str]] = []


class FeatureRequest(WorkItem, BaseFeatureRequest):
    """TODO: add fields to index in OpenSearch"""

    pass
