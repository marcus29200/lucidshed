import json
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.database.common.models import MAX_ID_LENGTH, Model
from app.database.users.models.user import SlimUser


class FeatureRequest(Model, BaseModel):
    # id: int
    title: Optional[str] = Field("", max_length=256)
    company: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)
    submitted_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)
    submitted_date: Optional[datetime] = None
    feature_assigned: Optional[List[str]] = []  # TODO make searchable, typeahead, etc.
    description: Optional[str] = ""
    # tags: Optional[List[Tag]] = []  # TODO Create DB models and relationships
    comments: Optional[List[str]] = []
    created_at: Optional[datetime]
    created_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)
    modified_at: Optional[datetime]
    modified_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)

    def __init__(self, **data):
        if isinstance(data["submitted_date"], datetime):
            data["submitted_date"] = data["submitted_date"].isoformat()

        super().__init__(**data)
