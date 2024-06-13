from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

MAX_ID_LENGTH = 64


class Model(BaseModel):
    id: str
    created_at: datetime
    created_by_id: str = Field(max_length=MAX_ID_LENGTH)
    modified_at: datetime  # Should probably be filled by db query of audit log table
    modified_by_id: str = Field(max_length=MAX_ID_LENGTH)
    deleted_at: Optional[datetime] = None
    deleted_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)
