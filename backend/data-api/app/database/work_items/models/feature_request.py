import json
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.database.common.models import MAX_ID_LENGTH
from app.database.users.models.user import SlimUser


class FeatureRequest(BaseModel):
    title: Optional[str] = Field("", max_length=256)
    company: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)
    company_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)
    submitted_by: Optional[SlimUser] = None
    submitted_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)
    submitted_date: Optional[datetime] = None
    feature_assigned: Optional[List[str]] = []  # TODO make searchable, typeahead, etc.
    description: Optional[str] = ""
    # tags: Optional[List[Tag]] = []  # TODO Create DB models and relationships
    comments: Optional[List[str]] = []

    def __init__(self, **data):
        if isinstance(data.get("company"), str):
            data["company"] = json.loads(data["company"])
        if isinstance(data.get("submitted_by"), str):
            data["submitted_by"] = json.loads(data["submitted_by"])
        if isinstance(data["submitted_date"], datetime):
            data["submitted_date"] = data["submitted_date"].isoformat()

        super().__init__(**data)
