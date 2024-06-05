from typing import Any, Dict, Optional
from datetime import datetime
from data_api.orm.work_items.models.work_item import WorkItem
from data_api.exceptions.common import ObjectNotFoundException
from data_api.database.database import DatabaseController


class WorkItemController:
    def __init__(self, db: DatabaseController):
        self.db: DatabaseController = db

    async def create(self, **kwargs):
        raise NotImplementedError()

    async def get(self, *, organization_id: str, id: Optional[str] = None) -> Dict[str, Any]:
        # Get item record here
        record = await self.db.fetchrow()

        if not record:
            raise ObjectNotFoundException(organization_id=organization_id, object_id=id)
        
        return record 

    async def update(self, **kwargs):
        raise NotImplementedError()

    async def delete():
        pass
