from enum import StrEnum
from typing import Any, Optional

from google.cloud import storage
from pydantic import BaseModel, Field

from app.api.settings import settings
from app.database.common.models import MAX_ID_LENGTH, Model

SIGNED_URL_EXPIRATION_MINUTES = 60 * 15


class FileSortableField(StrEnum):
    ID: str = "id"
    file_name: str = "title"
    CREATED_AT: str = "created_at"
    MODIFIED_AT: str = "modified_at"


class BaseFile(BaseModel):
    file_name: Optional[str] = None
    created_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)
    modified_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)


class File(Model, BaseFile):
    id: str
    file_name: str
    path: str
    organization_id: str = Field(max_length=MAX_ID_LENGTH)
    signed_url: Optional[str] = None

    def __init__(self, **data: Any):
        if not data.get("file_name"):
            data["file_name"] = data["id"]

        super().__init__(**data)

        self.signed_url = self.generate_signed_url()

    def generate_signed_url(self) -> str:
        client = storage.Client()

        bucket = client.bucket(settings.gcs_bucket)
        blob = bucket.blob(self.path)
        url = blob.generate_signed_url(expiration=SIGNED_URL_EXPIRATION_MINUTES)
        return url
