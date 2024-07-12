from typing import List, Optional, Tuple

from app.database.common.queries import QUERIES
from app.database.work_items.controllers.work_item import WorkItemController
from app.database.work_items.models.support_item import BaseSupportItem, SupportItem
from app.database.work_items.models.work_item import WorkItemSortableField
from app.api.settings import data_db


class SupportController(WorkItemController):
    async def create(
        self, *, organization_id: str, new_support_item:BaseSupportItem, current_user: str
    ) -> SupportItem:

        # How do we handle if completed is set right away?
        record = await data_db.get().fetchrow(
            QUERIES["CREATE_SUPPORT_ITEM"],
            organization_id,
            new_support_item.title,
            new_support_item.description,
            new_support_item.status,
            new_support_item.priority,
            new_support_item.estimated_completion_date,
            new_support_item.starred,
            new_support_item.owner,
            new_support_item.customer,
            new_support_item.primary_contact,
            new_support_item.secondary_contact,
            new_support_item.next_response_due,
            new_support_item.created_by_id or current_user,
            current_user,
        )

        # TODO Create history entry?

        return SupportItem(**record)

    async def get(self, *, organization_id: str, id: int) -> SupportItem:
        record = await super().get(organization_id=organization_id, id=id, scope="SUPPORT")

        return SupportItem(**record)

    async def get_all(
        self,
        *,
        organization_id: str,
        sort: Optional[WorkItemSortableField] = None,
        limit: Optional[int] = 1000,
        cursor: Optional[str] = None,
    ) -> Tuple[List[SupportItem], str]:
        if sort and sort not in WorkItemSortableField:
            raise Exception("Invalid sort parameter")

        records, cursor = await super().get_all(
            organization_id=organization_id,
            sort=sort.value if sort else WorkItemSortableField.ID.value,
            limit=limit,
            cursor=cursor,
            scope="SUPPORT"
        )

        return [SupportItem(**record) for record in records], cursor

    async def update(
        self,
        *,
        organization_id: str,
        id: str,
        updated_support_item: SupportItem,
        current_user: str,
    ) -> SupportItem:
        old_support_item = await self.get(organization_id=organization_id, id=id)

        new_item_json = updated_support_item.model_dump(exclude_unset=True)
        old_item_json = old_support_item.model_dump()

        old_item_json.update(**new_item_json)

        record = await data_db.get().fetchrow(
            QUERIES["UPDATE_SUPPORT_ITEM"],
            organization_id,
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

        # TODO Create history entry on new engineering item changes

        return SupportItem(**record)    
