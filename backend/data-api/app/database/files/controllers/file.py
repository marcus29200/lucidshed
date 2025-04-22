from os.path import join
from typing import List, Optional, Tuple
from uuid import uuid4

from google.cloud import storage

from app.api.utils import generate_cursor, parse_cursor
from app.database.common.controllers import BaseController
from app.database.common.queries import QUERIES
from app.database.files.models.file import BaseFile, File
from app.settings import data_db, settings


class FileController(BaseController):
    _type = "FILE"
    _create_history = False
    RETURN_MODEL = File

    async def create(self, organization_id: str, new_item: BaseFile, current_user: str) -> File:
        new_item.id = uuid4().hex
        new_item.path = join(settings.gcs_path or "", organization_id, new_item.id)

        return await super().create(new_item=new_item, current_user=current_user)

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

        return await super().delete(id=id, current_user=current_user)
