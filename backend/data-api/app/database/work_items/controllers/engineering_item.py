from typing import List, Optional, Tuple

from app.api.settings import data_db
from app.api.utils import generate_cursor, parse_cursor
from app.database.common.queries import QUERIES
from app.database.history.models.history import BaseHistory
from app.database.users.controllers.user import UserController
from app.database.work_items.controllers.work_item import WorkItemController
from app.database.work_items.models.engineering_item import (
    BaseEngineeringItem,
    EngineeringItem,
    EngineeringItemType,
    EngineeringLinkType,
)
from app.database.work_items.models.work_item import WorkItemSortableField


class EngineeringController(WorkItemController):
    async def create(
        self, *, organization_id: str, new_item: BaseEngineeringItem, current_user: str
    ) -> EngineeringItem:
        if new_item.item_type is None:
            new_item.item_type = EngineeringItemType.STORY

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
            new_item.assigned_to_id,
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

        user = None
        if new_item.assigned_to_id:
            user = await UserController().get_slim_user(id=new_item.assigned_to_id)

        return EngineeringItem(**record, assigned_to=user)

    async def get(self, *, organization_id: str, id: int) -> EngineeringItem:
        record, user = await super()._get(organization_id=organization_id, id=id, scope="ENGINEERING")

        return EngineeringItem(**record, assigned_to=user)

    async def get_all(
        self,
        *,
        organization_id: str,
        item_type: Optional[EngineeringItemType] = None,
        iteration_id: Optional[int] = None,
        related_item_id: Optional[int] = None,
        assigned_to_id: Optional[str] = None,
        sort: Optional[WorkItemSortableField] = None,
        limit: Optional[int] = 1000,
        cursor: Optional[str] = None,
    ) -> Tuple[List[EngineeringItem], str | None]:
        if sort and sort not in WorkItemSortableField:
            raise Exception("Invalid sort parameter")

        filter_conditions = determine_get_all_filter_conditions(
            item_type=item_type,
            iteration_id=iteration_id,
            related_item_id=related_item_id,
            assigned_to_id=assigned_to_id,
        )

        query: str = QUERIES["GET_ALL_ENGINEERING_ITEM"]
        query = query.replace("$FILTER_CONDITIONS", " AND " + " AND ".join(filter_conditions))

        offset = 0
        if cursor:
            sort, offset, extra = parse_cursor(cursor)

            item_type = extra.get("item_type") or item_type

        records = await data_db.get().fetch(
            query,
            organization_id,
            sort if sort else WorkItemSortableField.ID.value,
            limit,
            offset,
        )

        cursor = None
        if len(records) == limit:
            cursor = generate_cursor(sort, offset + limit, {"item_type": item_type})

        return [EngineeringItem(**record) for record in records], cursor

    async def get_ask_lucid_info(self, organization_id: str) -> List[EngineeringItem]:
        records = await data_db.get().fetch(QUERIES["GET_ASK_LUCID_ENGINEERING_ITEM"], organization_id)

        return [EngineeringItem(**record) for record in records]

    async def get_batch_by_id(self, *, organization_id: str, ids: List[int]) -> List[EngineeringItem]:
        records = await data_db.get().fetch(QUERIES["GET_ENGINEERING_ITEMS_BY_IDS"], organization_id, ids)

        return [EngineeringItem(**record) for record in records]

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
            old_item_json["assigned_to_id"],
        )

        await self.history_controller.create(
            organization_id,
            BaseHistory(item_id=record["id"], item_type="engineering", action="update", metadata=new_item_json),
            current_user,
        )

        return EngineeringItem(**record)

    async def link(
        self, *, organization_id: str, item_1: int, item_2: int, link_type: EngineeringLinkType, current_user: str
    ) -> bool:
        result = await data_db.get().execute(
            QUERIES["LINK_ENGINEERING_ITEMS"], organization_id, item_1, item_2, link_type, current_user
        )

        return result == "INSERT 0 1"

    async def unlink(self, *, organization_id: str, item_1: int, item_2: int, current_user: str) -> bool:
        result = await data_db.get().execute(
            QUERIES["UNLINK_ENGINEERING_ITEMS"], organization_id, item_1, item_2, current_user
        )

        return result == "DELETE 1"


def determine_get_all_filter_conditions(
    item_type: Optional[EngineeringItemType] = None,
    iteration_id: Optional[int] = None,
    related_item_id: Optional[int] = None,
    assigned_to_id: Optional[str] = None,
) -> List[str]:
    filter_conditions = []

    if item_type is not None:
        filter_conditions.append(f"engineering_items.item_type = '{item_type.value}'")

    if iteration_id is not None:
        if iteration_id == -1:
            filter_conditions.append("engineering_items.iteration_id IS NULL")
        else:
            filter_conditions.append(f"engineering_items.iteration_id = {iteration_id}")

    if related_item_id is not None:
        filter_conditions.append(
            f"(work_item_relationships.item_1 = {related_item_id} OR work_item_relationships.item_2 = {related_item_id})"  # noqa
        )
        filter_conditions.append(f"engineering_items.id != {related_item_id}")

    if assigned_to_id is not None:
        if assigned_to_id == -1:
            filter_conditions.append("engineering_items.assigned_to_id IS NULL")
        else:
            filter_conditions.append(f"engineering_items.assigned_to_id = '{assigned_to_id}'")

    return filter_conditions
