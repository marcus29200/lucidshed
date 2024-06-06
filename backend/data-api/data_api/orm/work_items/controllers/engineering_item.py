from typing import Any, Dict, Optional
from datetime import datetime
from data_api.orm.work_items.controllers.work_item import WorkItemController
from data_api.orm.work_items.models.engineering_item import (
    BaseEngineeringItem,
    EngineeringItem,
)
from data_api.orm.work_items.queries import WORK_ITEM_QUERIES


class EngineeringItemController(WorkItemController):
    async def create(self, engineering_item: BaseEngineeringItem):
        # Create db record
        # How do we handle if completed is set right away?
        record = await self.db.fetchrow(
            WORK_ITEM_QUERIES.get("CREATE_ENGINEERING_WORK_ITEM"),
            "test",  # TODO Org id, needs to come from the validated jwt token
            engineering_item.title,
            engineering_item.description,
            engineering_item.status,
            engineering_item.priority,
            engineering_item.item_type,
            engineering_item.created_by_id
            or "test@test.com",  # TODO Should default to current user if not defined
            "test@test.com",  # TODO Should be the current user
        )

        # Need to possibly populate fields here
        return EngineeringItem(**record)

    async def get(self, *, organization_id: str, id: Optional[str] = None):
        record = await super().get(organization_id=organization_id, id=id)

        return EngineeringItem(**record)

    async def update(self, **kwargs):
        pass
