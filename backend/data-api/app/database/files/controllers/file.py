import json
from typing import List
from uuid import uuid4

from app.api.settings import data_db, settings
from app.database.common.queries import QUERIES
from app.database.files.models.file import BaseFile, File
from app.exceptions.common import ObjectNotFoundException

from google.cloud import storage


# Finish updating based on audit log models
class FileController:
    async def create(self, organization_id: str, file: BaseFile, current_user: str) -> File:
        async with data_db.get().transaction():
            # Create db record
            # How do we handle if completed is set right away?
            record = await data_db.get().fetchrow(
                QUERIES["CREATE_FILE"],
                uuid4().hex,
                organization_id,
                settings.gcs_path,
                current_user,
                current_user,
            )
            file = File(**record)

            # Add to gcs
            # NOTE: We should probably upload in chunks though
            storage_client = storage.Client()
            bucket = storage_client.bucket(settings.gcs_bucket)
            blob = bucket.blob(f"{settings.gcs_path}/{file.id}")
            blob.upload_from_string(file.content)

        return File(**record)

    async def get(self, *, organization_id: str, id: int) -> File:
        record = await data_db.get().fetchrow(QUERIES["GET_FILE"], organization_id, id)

        if not record:
            raise ObjectNotFoundException(organization_id=organization_id, object_id=id)

        return File(**record)

    async def get_all(self, *, organization_id: str) -> List[File]:
        # Get item record here
        records = await data_db.get().fetch(QUERIES["GET_ALL_FILES"], organization_id)

        return [File(**record) for record in records]

    async def delete(self, *, organization_id: str, id: int, current_user: str) -> bool:
        file = await self.get(organization_id=organization_id, id=id)

        # Delete from gcs
        storage_client = storage.Client()
        bucket = storage_client.bucket(settings.gcs_bucket)
        blob = bucket.blob(f"{file.path}/{id}")
        blob.delete()

        # Delete db record
        await data_db.get().execute(QUERIES["DELETE_FILE"], organization_id, id, current_user)

        return True