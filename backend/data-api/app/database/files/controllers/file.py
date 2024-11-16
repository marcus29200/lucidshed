from os.path import join
from typing import List, Optional, Tuple
from uuid import uuid4

from google.cloud import storage

from app.api.settings import data_db, settings
from app.api.utils import generate_cursor, parse_cursor
from app.database.common.queries import QUERIES
from app.database.files.models.file import BaseFile, File
from app.exceptions.common import ObjectNotFoundException


class FileController:
    async def create(self, organization_id: str, file: BaseFile, current_user: str) -> File:
        file_id = uuid4().hex
        record = await data_db.get().fetchrow(
            QUERIES["CREATE_FILE"],
            file_id,
            file.file_name,
            join(settings.gcs_path or "", organization_id, file_id),
            current_user,
            current_user,
        )

        return File(**record)

    async def get(self, *, id: str) -> File:
        record = await data_db.get().fetchrow(QUERIES["GET_FILE"], id)

        if not record:
            raise ObjectNotFoundException(object_id=id)

        return File(**record)

    async def get_all(
        self,
        *,
        sort: Optional[str] = "id",
        limit: Optional[int] = 1000,
        cursor: Optional[str] = None,
    ) -> Tuple[List[File], Optional[str]]:
        offset = 0
        if cursor:
            sort, offset, _ = parse_cursor(cursor)

        records = await data_db.get().fetch(QUERIES["GET_ALL_FILES"], sort, limit, offset)

        cursor = None
        if len(records) == limit:
            cursor = generate_cursor(sort, offset + limit)

        return [File(**record) for record in records], cursor

    async def delete(self, *, id: str, current_user: str) -> bool:
        file = await self.get(id=id)

        # Delete from gcs
        storage_client = storage.Client()
        bucket = storage_client.bucket(settings.gcs_bucket)
        blob = bucket.blob(file.path)
        blob.delete()

        # Delete db record
        await data_db.get().execute(QUERIES["DELETE_FILE"], id, current_user)

        return True
