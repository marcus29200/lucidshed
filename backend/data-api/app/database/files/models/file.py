import json
from enum import StrEnum
from typing import Any, Dict, Optional, Union

from pydantic import BaseModel, Field

from app.api.settings import settings
from app.database.common.models import MAX_ID_LENGTH, Model


class BaseFile(BaseModel):
    path: str
    content: Optional[str] = None
    file_name: Optional[str] = None
    created_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)
    modified_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)

    def __init__(self, **data: Any):
        if not data.get("path"):
            data["path"] = settings.gcs_path

        super().__init__(**data)


class File(Model, BaseFile):
    id: str
    file_name: str
    organization_id: str = Field(max_length=MAX_ID_LENGTH)

    def __init__(self, **data: Any):
        if not data.get("file_name"):
            data["file_name"] = data["id"]

        super().__init__(**data)

        
