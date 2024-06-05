from typing import Any, Dict, Optional
from datetime import datetime
from data_api.orm.work_items.controllers.work_item import WorkItemController
from data_api.orm.work_items.models.engineering_item import BaseEngineeringItem, EngineeringItem
from data_api.orm.work_items.queries import WORK_ITEM_QUERIES

class EngineeringItemController(WorkItemController):
    async def create(self, engineering_item: BaseEngineeringItem):
        # Create db record
        # Need to add created by/modified by, then return 
        new_engineering_item = await self.db.execute(
            WORK_ITEM_QUERIES.get("CREATE_ENGINEERING_WORK_ITEM"),
            **engineering_item.model_dump()  # This might not work... 
        )

        # Need to possibly populate fields here
        return EngineeringItem()

    async def get(self, *, organization_id: str, id: Optional[str] = None):
        record = await super().get(organization_id=organization_id, id=id)

        return EngineeringItem(**record)

    async def update(self, **kwargs):
        pass
