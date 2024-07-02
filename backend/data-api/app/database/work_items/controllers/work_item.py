from typing import Any, Dict, List, Optional, Tuple

from app.api.utils import generate_cursor, parse_cursor
from app.database.common.queries import QUERIES
from app.database.database import DatabaseController
from app.exceptions.common import ObjectNotFoundException


class WorkItemController:
    def __init__(self, db: DatabaseController):
        self.db: DatabaseController = db

    async def create(self, obj: Any):
        raise NotImplementedError()

    async def get(self, *, organization_id: str, id: int) -> Dict[str, Any]:
        # Get item record here
        record = await self.db.fetchrow(QUERIES["GET_ENGINEERING_ITEM"], organization_id, id)

        if not record:
            raise ObjectNotFoundException(organization_id=organization_id, object_id=id)

        return record

    async def get_all(
        self,
        *,
        organization_id: str,
        sort: Optional[str] = "id",
        limit: Optional[int] = 1000,
        cursor: Optional[str] = None
    ) -> Tuple[List[Dict[str, Any]], str]:
        offset = 0
        if cursor:
            sort, offset = parse_cursor(cursor)

        # Get item record here
        records = await self.db.fetch(QUERIES["GET_ALL_ENGINEERING_ITEM"], organization_id, sort, limit, offset)

        cursor = None
        if len(records) == limit:
            cursor = generate_cursor(sort, offset + limit)

        return records, cursor

    async def update(self, obj: Any):
        raise NotImplementedError()

    async def delete(self, *, organization_id: str, id: int, current_user: str) -> bool:
        result = await self.db.execute(
            QUERIES["DELETE_ENGINEERING_ITEM"],
            organization_id,
            id,
            current_user,
        )

        if result != "UPDATE 1":
            raise ObjectNotFoundException(organization_id=organization_id, object_id=id)

        return True
