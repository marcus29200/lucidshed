from typing import Any, Dict, List, Optional

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
        offset: Optional[int] = 0
    ) -> List[Dict[str, Any]]:
        # Get item record here
        records = await self.db.fetch(QUERIES["GET_ALL_ENGINEERING_ITEM"], organization_id, limit, offset)

        return records

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
