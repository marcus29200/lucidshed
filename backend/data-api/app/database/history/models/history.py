import json
from enum import StrEnum
from typing import Any, Dict, Optional, Union

from pydantic import BaseModel, Field

from app.database.common.models import MAX_ID_LENGTH, Model


class HistoryAction(StrEnum):
    CREATE: str = "create"
    GET: str = "get"
    UPDATE: str = "update"
    DELETE: str = "delete"


class BaseHistory(BaseModel):
    item_id: Union[str, int]
    item_type: str
    message: Optional[str] = ""
    action: Optional[HistoryAction] = None
    metadata: Optional[Dict[Any, Any]] = {}
    created_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)
    modified_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)

    def __init__(self, **data):
        if isinstance(data.get("metadata"), str):
            data["metadata"] = json.loads(data["metadata"])

        super().__init__(**data)


class History(Model, BaseHistory):
    id: str
    action: HistoryAction
