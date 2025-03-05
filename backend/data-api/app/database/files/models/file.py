from enum import StrEnum
from typing import Any, Optional

from google.auth import default, impersonated_credentials
from google.cloud import storage
from pydantic import Field

from app.api.settings import settings
from app.database.common.models import MAX_ID_LENGTH, BaseModel, Model

SIGNED_URL_EXPIRATION_MINUTES = 60 * 15


class FileSortableField(StrEnum):
    ID = "id"
    FILE_NAME = "file_name"
    CREATED_AT = "created_at"
    MODIFIED_AT = "modified_at"


class BaseFile(BaseModel):
    file_name: Optional[str] = None
    path: Optional[str] = None
    created_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)
    modified_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)


class File(Model, BaseFile):
    id: str
    file_name: str
    path: str
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

        credentials, _ = default()
        target_creds = impersonated_credentials.Credentials(
            source_credentials=credentials,
            target_principal=settings.google_service_account_email,
            target_scopes=["https://www.googleapis.com/auth/cloud-platform"],
        )

        url = blob.generate_signed_url(expiration=SIGNED_URL_EXPIRATION_MINUTES, credentials=target_creds)
        return url
