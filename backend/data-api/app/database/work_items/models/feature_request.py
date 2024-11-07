from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.database.common.models import MAX_ID_LENGTH
from app.database.users.models.user import SlimUser


class FeatureRequest(BaseModel):
    feature_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)
    title: Optional[str] = Field("", max_length=256)
    company: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)
    submitted_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)
    submitted_by: Optional[SlimUser] = None
    submitted_date: Optional[datetime] = None
    feature_assigned: Optional[List[str]] = []  # TODO make searchable, typeahead, etc.
    description: Optional[str] = ""
    # tags: Optional[List[Tag]] = []  # TODO Create DB models and relationships
    comments: Optional[List[str]] = []


class FeatureList(BaseModel):
    features: List[FeatureRequest] = []
    title: Optional[str] = Field("", max_length=256)
    number_of_requests: int = 0
    prioritization: Optional[str] = None  # this should be a weighted average
    reach: int = 0  # TODO should be a range from 1 - 5
    impact: int = 0  # TODO should be a range from 1 - 5
    confidence: int = 0  # TODO should be a range from 1 - 5
    level_of_effort: int = 0  # TODO should be a range from 1 - 5
    growth: int = 0  # TODO should be a range from 1 - 5
