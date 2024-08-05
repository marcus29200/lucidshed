from typing import List, Optional, Tuple

from app.api.settings import data_db
from app.database.common.queries import QUERIES
from app.database.history.models.history import BaseHistory
from app.database.work_items.controllers.work_item import WorkItemController
from app.database.work_items.models.engineering_item import BaseEngineeringItem, EngineeringItem, EngineeringItemType
from app.database.work_items.models.work_item import WorkItemSortableField


class EngineeringController(WorkItemController):
    async def create(
        self, *, organization_id: str, new_item: BaseEngineeringItem, current_user: str
    ) -> EngineeringItem:
        # Create db record
        # How do we handle if completed is set right away?
        record = await data_db.get().fetchrow(
            QUERIES["CREATE_ENGINEERING_ITEM"],
            organization_id,
            new_item.title,
            new_item.description,
            new_item.status,
            new_item.priority,
            new_item.estimated_completion_date,
            new_item.starred,
            new_item.item_type,
            new_item.item_sub_type,
            new_item.estimate,
            new_item.iteration_id,
            new_item.team_id,
            new_item.due_date,
            new_item.acceptance_criteria,
            new_item.created_by_id or current_user,
            current_user,
        )

        await self.history_controller.create(
            organization_id,
            BaseHistory(
                item_id=record["id"],
                item_type="engineering",
                action="create",
                metadata=new_item.model_dump(exclude_unset=True),
            ),
            current_user,
        )

        return EngineeringItem(**record)

    async def get(self, *, organization_id: str, id: int) -> EngineeringItem:
        record = await super()._get(organization_id=organization_id, id=id, scope="ENGINEERING")

        return EngineeringItem(**record)

    async def get_all(
        self,
        *,
        organization_id: str,
        item_type: Optional[EngineeringItemType] = None,
        sort: Optional[WorkItemSortableField] = None,
        limit: Optional[int] = 1000,
        cursor: Optional[str] = None,
    ) -> Tuple[List[EngineeringItem], str | None]:
        if sort and sort not in WorkItemSortableField:
            raise Exception("Invalid sort parameter")

        records, cursor = await super()._get_all(
            organization_id=organization_id,
            sort=sort.value if sort else WorkItemSortableField.ID.value,
            item_type=item_type,
            limit=limit,
            cursor=cursor,
            scope="ENGINEERING",
        )

        return [EngineeringItem(**record) for record in records], cursor

    async def update(
        self,
        *,
        organization_id: str,
        id: int,
        updated_item: EngineeringItem,
        current_user: str,
    ) -> EngineeringItem:
        old_engineering_item = await self.get(organization_id=organization_id, id=id)

        new_item_json = updated_item.model_dump(exclude_unset=True)
        old_item_json = old_engineering_item.model_dump()

        old_item_json.update(**new_item_json)

        record = await data_db.get().fetchrow(
            QUERIES["UPDATE_ENGINEERING_ITEM"],
            organization_id,
            id,
            old_item_json["title"],
            old_item_json["description"],
            old_item_json["status"],
            old_item_json["priority"],
            old_item_json["estimated_completion_date"],
            old_item_json["starred"],
            old_item_json["item_type"],
            old_item_json["item_sub_type"],
            old_item_json["estimate"],
            old_item_json["iteration_id"],
            old_item_json["team_id"],
            old_item_json["due_date"],
            old_item_json["acceptance_criteria"],
            old_item_json["created_by_id"],
            current_user,
            old_item_json["archived_at"],
            old_item_json["archived_by_id"],
            old_item_json["deleted_at"],
            old_item_json["deleted_by_id"],
            old_item_json["completed_at"],
            old_item_json["completed_by_id"],
        )

        await self.history_controller.create(
            organization_id,
            BaseHistory(item_id=record["id"], item_type="engineering", action="update", metadata=new_item_json),
            current_user,
        )

        return EngineeringItem(**record)
