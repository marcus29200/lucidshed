from datetime import datetime
from typing import Any, Dict, Optional, Set

from pydantic import BaseModel, Field

MAX_ID_LENGTH = 64
MAX_IMAGE_SIZE = 5000000


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
