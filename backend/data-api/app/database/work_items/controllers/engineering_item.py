from app.database.work_items.controllers.work_item import WorkItemController
from app.database.work_items.models.engineering_item import (
    BaseEngineeringItem,
    EngineeringItem,
)
from app.database.work_items.queries import WORK_ITEM_QUERIES


class EngineeringController(WorkItemController):
    async def create(
        self, *, new_engineering_item: BaseEngineeringItem, current_user: str
    ):
        # Create db record
        # How do we handle if completed is set right away?
        record = await self.db.fetchrow(
            WORK_ITEM_QUERIES["CREATE_ENGINEERING_ITEM"],
            "test",  # TODO Org id, needs to come from the jwt token, and also, might need to control the db we access
            new_engineering_item.title,
            new_engineering_item.description,
            new_engineering_item.status,
            new_engineering_item.priority,
            new_engineering_item.item_type,
            new_engineering_item.estimate,
            new_engineering_item.iteration_id,
            new_engineering_item.tags,
            new_engineering_item.related_tickets,
            new_engineering_item.related_files,
            new_engineering_item.created_by_id or current_user,
            current_user,
        )

        # TODO Create history entry

        return EngineeringItem(**record)

    async def get(self, *, organization_id: str, id: int):
        record = await super().get(organization_id=organization_id, id=id)

        return EngineeringItem(**record)

    async def update(
        self,
        *,
        organization_id: str,
        id: str,
        updated_engineering_item: EngineeringItem,
        current_user: str,
    ):
        old_engineering_item = await self.get(organization_id=organization_id, id=id)

        new_item_json = updated_engineering_item.model_dump(exclude_unset=True)
        old_item_json = old_engineering_item.model_dump()

        old_item_json.update(**new_item_json)

        record = await self.db.fetchrow(
            WORK_ITEM_QUERIES["UPDATE_ENGINEERING_ITEM"],
            organization_id,  # TODO Org id, come from the jwt token, and might need to control the db we access
            id,
            old_item_json["title"],
            old_item_json["description"],
            old_item_json["status"],
            old_item_json["priority"],
            old_item_json["item_type"],
            old_item_json["estimate"],
            old_item_json["iteration_id"],
            old_item_json["tags"],
            old_item_json["related_tickets"],
            old_item_json["related_files"],
            old_item_json["created_by_id"],
            current_user,
            old_item_json["archived_at"],
            old_item_json["archived_by_id"],
            old_item_json["deleted_at"],
            old_item_json["deleted_by_id"],
            old_item_json["completed_at"],
            old_item_json["completed_by_id"],
        )

        # TODO Create history entry on new engineering item changes

        return EngineeringItem(**record)
