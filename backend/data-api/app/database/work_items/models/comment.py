from typing import Optional

from pydantic import BaseModel, Field

from app.database.common.models import MAX_ID_LENGTH, Model


class BaseWorkItemComment(BaseModel):
    work_item_id: Optional[str] = None
    description: Optional[str] = ""
    created_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)
    modified_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)


class WorkItemComment(Model, BaseWorkItemComment):
    work_item_id: str


class BaseFeatureRequestComment(BaseModel):
    feature_request_id: Optional[int] = None
    description: Optional[str] = ""
    created_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)
    modified_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)


class FeatureRequestComment(Model, BaseFeatureRequestComment):
    feature_request_id: int
