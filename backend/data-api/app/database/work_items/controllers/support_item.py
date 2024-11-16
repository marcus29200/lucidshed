from typing import List, Optional, Tuple

from app.api.settings import data_db
from app.api.utils import generate_cursor, parse_cursor
from app.database.common.queries import QUERIES
from app.database.history.models.history import BaseHistory
from app.database.work_items.controllers.work_item import WorkItemController
from app.database.work_items.models.support_item import BaseSupportItem, SupportItem
from app.database.work_items.models.work_item import WorkItemSortableField


class SupportController(WorkItemController):
    async def create(self, *, new_item: BaseSupportItem, current_user: str) -> SupportItem:

        # How do we handle if completed is set right away?
        record = await data_db.get().fetchrow(
            QUERIES["CREATE_SUPPORT_ITEM"],
            new_item.title,
            new_item.description,
            new_item.status,
            new_item.priority,
            new_item.estimated_completion_date,
            new_item.starred,
            new_item.owner,
            new_item.customer,
            new_item.primary_contact,
            new_item.secondary_contact,
            new_item.next_response_due,
            new_item.created_by_id or current_user,
            current_user,
        )

        await self.history_controller.create(
            BaseHistory(
                item_id=record["id"],
                item_type="support",
                action="create",
                metadata=new_item.model_dump(exclude_unset=True),
            ),
            current_user,
        )

        return SupportItem(**record)

    async def get(self, *, id: int) -> SupportItem:
        record, user = await super()._get(id=id, scope="SUPPORT")

        return SupportItem(**record, assigned_to=user)

    async def get_all(
        self,
        *,
        item_type: Optional[str] = None,
        iteration_id: Optional[int] = None,
        sort: Optional[WorkItemSortableField] = None,
        limit: Optional[int] = 1000,
        cursor: Optional[str] = None,
    ) -> Tuple[List[SupportItem], str | None]:
        if sort and sort not in WorkItemSortableField:
            raise Exception("Invalid sort parameter")

        if cursor:
            sort, offset, extra = parse_cursor(cursor)

            item_type = extra.get("item_type") or item_type

        records = await data_db.get().fetch(QUERIES["GET_ALL_SUPPORT_ITEM"], sort, limit, offset)

        cursor = None
        if len(records) == limit:
            cursor = generate_cursor(sort, offset + limit, {"item_type": item_type})

        return [SupportItem(**record) for record in records], cursor

    async def update(
        self,
        *,
        id: int,
        updated_item: SupportItem,
        current_user: str,
    ) -> SupportItem:
        old_support_item = await self.get(id=id)

        new_item_json = updated_item.model_dump(exclude_unset=True)
        old_item_json = old_support_item.model_dump()

        old_item_json.update(**new_item_json)

        record = await data_db.get().fetchrow(
            QUERIES["UPDATE_SUPPORT_ITEM"],
            id,
            old_item_json["title"],
            old_item_json["description"],
            old_item_json["status"],
            old_item_json["priority"],
            old_item_json["estimated_completion_date"],
            old_item_json["starred"],
            old_item_json["owner"],
            old_item_json["customer"],
            old_item_json["primary_contact"],
            old_item_json["secondary_contact"],
            old_item_json["next_response_due"],
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
            BaseHistory(item_id=record["id"], item_type="support", action="update", metadata=new_item_json),
            current_user,
        )

        return SupportItem(**record)

    async def delete(self, *, id: int, current_user: str, scope: str) -> bool:
        return await super().delete(id=id, current_user=current_user, scope=scope)
