import json
from datetime import datetime
from typing import Any, Dict, Optional, Set, Tuple
from uuid import uuid4

from pydantic import BaseModel as PydanticBaseModel
from pydantic import Field

MAX_ID_LENGTH = 64
MAX_IMAGE_SIZE = 5000000


class BaseModel(PydanticBaseModel):
    # TODO Need to add base model fields here too.
    id: Optional[str] = None
    created_at: Optional[datetime] = None
    created_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)
    modified_at: Optional[datetime] = None
    modified_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)
    deleted_at: Optional[datetime] = None
    deleted_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)

    def get_value(self, value):
        if value is None or value == "None":
            return "NULL"

        if isinstance(value, dict):
            value = json.dumps(value, default=str)

        return f"'{value}'"

    def dump_to_create_sql(self, current_user: str) -> Tuple[str, str]:
        if not self.id:
            self.id = uuid4().hex

        model_json = self.model_dump(
            exclude=set(["created_at", "created_by_id", "modified_at", "modified_by_id"]), exclude_unset=True
        )

        columns = ",".join(list(model_json.keys()) + ["created_at", "created_by_id", "modified_at", "modified_by_id"])
        values = ",".join(
            [self.get_value(value) for value in model_json.values()]
            + ["NOW()", f"'{self.created_by_id or current_user}'", "NOW()", f"'{current_user}'"]
        )

        return columns, values

    def dump_to_update_sql(self, current_user: str) -> str:
        updated_fields = ["modified_at=NOW()", f"modified_by_id='{current_user}'"]

        updated_fields += [
            f"{key}={self.get_value(value)}"
            for key, value in self.model_dump(
                exclude=set(["id", "created_at", "modified_at", "modified_by_id"]), exclude_unset=True
            ).items()
        ]

        return ",".join(updated_fields)


class Model(BaseModel):
    id: str
    created_at: datetime
    created_by_id: str = Field(max_length=MAX_ID_LENGTH)
    modified_at: datetime  # Should probably be filled by db query of audit log table
    modified_by_id: str = Field(max_length=MAX_ID_LENGTH)
    deleted_at: Optional[datetime] = None
    deleted_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)

    @property
    def indexed_fields(self):
        return set()

    @property
    def searchable_fields(self):
        return []

    def get_fields_to_index(self, updated_fields: Optional[Set[str]] = set()) -> list[str]:
        return list(self.indexed_fields.intersection(updated_fields) if updated_fields else self.indexed_fields)

    def get_searchable_doc(self, updated_fields: Optional[set[str]] = None) -> Dict[str, Any]:
        doc = {field: getattr(self, field) for field in self.get_fields_to_index(updated_fields)}

        doc["type"] = self.__class__.__name__

        return doc
