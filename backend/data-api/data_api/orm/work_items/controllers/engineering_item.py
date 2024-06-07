from typing import Any, Dict, Optional
from datetime import datetime
from data_api.orm.work_items.controllers.work_item import WorkItemController
from data_api.orm.work_items.models.engineering_item import (
    BaseEngineeringItem,
    EngineeringItem,
)
from data_api.orm.work_items.queries import WORK_ITEM_QUERIES


class EngineeringController(WorkItemController):
    async def create(self, engineering_item: BaseEngineeringItem):
        # Create db record
        # How do we handle if completed is set right away?
        record = await self.db.fetchrow(
            WORK_ITEM_QUERIES.get("CREATE_ENGINEERING_ITEM"),
            "test",  # TODO Org id, needs to come from the validated jwt token, and also, this might need to control the db we access
            engineering_item.title,
            engineering_item.description,
            engineering_item.status,
            engineering_item.priority,
            engineering_item.item_type,
            engineering_item.estimate,
            engineering_item.iteration_id,
            engineering_item.tags,
            engineering_item.related_tickets,
            engineering_item.related_files,
            engineering_item.created_by_id
            or "test@test.com",  # TODO Should default to current user if not defined
            "test@test.com",  # TODO Should be the current user
        )

        # TODO Create history entry

        return EngineeringItem(**record)

    async def get(self, *, organization_id: str, id: Optional[str] = None):
        record = await super().get(organization_id=organization_id, id=id)

        return EngineeringItem(**record)

    async def update(self, new_engineering_item: EngineeringItem):
        old_engineering_item = await self.get(
            organization_id=new_engineering_item.organization_id,
            id=new_engineering_item.id,
        )

        new_engineering_item = new_engineering_item.model_dump(exclude_unset=True)
        old_engineering_item = old_engineering_item.model_dump()

        old_engineering_item.update(**new_engineering_item)

        record = await self.db.fetchrow(
            WORK_ITEM_QUERIES.get("UPDATE_ENGINEERING_ITEM"),
            "test",  # TODO Org id, needs to come from the validated jwt token, and also, this might need to control the db we access
            new_engineering_item["id"],
            old_engineering_item["title"],
            old_engineering_item["description"],
            old_engineering_item["status"],
            old_engineering_item["priority"],
            old_engineering_item["item_type"],
            old_engineering_item["estimate"],
            old_engineering_item["iteration_id"],
            old_engineering_item["tags"],
            old_engineering_item["related_tickets"],
            old_engineering_item["related_files"],
            old_engineering_item["created_by_id"],
            "test@test.com",  # TODO Should be the current user
            old_engineering_item["archived_at"],
            old_engineering_item["archived_by_id"],
            old_engineering_item["deleted_at"],
            old_engineering_item["deleted_by_id"],
            old_engineering_item["completed_at"],
            old_engineering_item["completed_by_id"],
        )

        # TODO Create history entry on new engineering item changes

        return EngineeringItem(**record)
