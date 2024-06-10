from typing import Any, Dict

from app.database.common.queries import WORK_ITEM_QUERIES
from app.database.database import DatabaseController
from app.exceptions.common import ObjectNotFoundException


class WorkItemController:
    def __init__(self, db: DatabaseController):
        self.db: DatabaseController = db

    async def create(self, obj: Any):
        raise NotImplementedError()

    async def get(self, *, organization_id: str, id: int) -> Dict[str, Any]:
        # Get item record here
        record = await self.db.fetchrow(WORK_ITEM_QUERIES["GET_ENGINEERING_ITEM"], organization_id, id)

        if not record:
            raise ObjectNotFoundException(organization_id=organization_id, object_id=id)

        return record

    async def update(self, obj: Any):
        raise NotImplementedError()

    async def delete(self, *, organization_id: str, id: int, current_user: str) -> bool:
        result = await self.db.execute(
            WORK_ITEM_QUERIES["DELETE_ENGINEERING_ITEM"],
            organization_id,
            id,
            current_user,
        )

        if result != "UPDATE 1":
            raise ObjectNotFoundException(organization_id=organization_id, object_id=id)

        return True
