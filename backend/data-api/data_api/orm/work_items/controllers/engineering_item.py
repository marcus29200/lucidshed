from data_api.orm.work_items.controllers.work_item import WorkItemController
from data_api.orm.work_items.models.engineering_item import BaseEngineeringItem, EngineeringItem
from data_api.orm.work_items.queries import WORK_ITEM_QUERIES


class EngineeringController(WorkItemController):
    async def create(self, engineering_item: BaseEngineeringItem):
        # Create db record
        # How do we handle if completed is set right away?
        record = await self.db.fetchrow(
            WORK_ITEM_QUERIES["CREATE_ENGINEERING_ITEM"],
            "test",  # TODO Org id, needs to come from the jwt token, and also, might need to control the db we access
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
            engineering_item.created_by_id or "test@test.com",  # TODO Should default to current user if not defined
            "test@test.com",  # TODO Should be the current user
        )

        # TODO Create history entry

        return EngineeringItem(**record)

    async def get(self, *, organization_id: str, id: int):
        record = await super().get(organization_id=organization_id, id=id)

        return EngineeringItem(**record)

    async def update(self, new_engineering_item: EngineeringItem):
        old_engineering_item = await self.get(
            organization_id=new_engineering_item.organization_id,
            id=new_engineering_item.id,
        )

        new_item_json = new_engineering_item.model_dump(exclude_unset=True)
        old_item_json = old_engineering_item.model_dump()

        old_item_json.update(**new_item_json)

        record = await self.db.fetchrow(
            WORK_ITEM_QUERIES["UPDATE_ENGINEERING_ITEM"],
            "test",  # TODO Org id, needs to come from the jwt token, and might need to control the db we access
            new_item_json["id"],
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
            "test@test.com",  # TODO Should be the current user
            old_item_json["archived_at"],
            old_item_json["archived_by_id"],
            old_item_json["deleted_at"],
            old_item_json["deleted_by_id"],
            old_item_json["completed_at"],
            old_item_json["completed_by_id"],
        )

        # TODO Create history entry on new engineering item changes

        return EngineeringItem(**record)
