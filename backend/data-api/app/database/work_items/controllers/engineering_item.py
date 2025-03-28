from typing import List, Optional, Tuple

from app.api.settings import data_db, user_db
from app.api.utils import generate_cursor, parse_cursor
from app.database.common.queries import QUERIES
from app.database.users.controllers.user import UserController
from app.database.work_items.controllers.work_item import WorkItemController
from app.database.work_items.models.engineering_item import (
    BaseEngineeringItem,
    EngineeringItem,
    EngineeringItemType,
    EngineeringLinkType,
)
from app.database.work_items.models.work_item import WorkItemSortableField


# TODO Need to figure out a good way to load all user info for an item so it can be indexed.
# Then we need to have a good way to reindex out of date user info
class EngineeringController(WorkItemController):
    _type = "ENGINEERING_ITEM"
    _create_history = True
    RETURN_MODEL = EngineeringItem

    async def create(self, *, new_item, current_user: str) -> EngineeringItem:
        engineering_item: EngineeringItem = await super().create(new_item=new_item, current_user=current_user)

        if engineering_item.assigned_to_id:
            engineering_item.assigned_to = await UserController().get_slim_user(id=new_item.assigned_to_id)

        return engineering_item

    async def load_additional_properties(self, *, record):
        return {
            "iteration": await self.load_property(data_db, QUERIES["GET_ITERATION"], record.get("iteration_id")),
            "team": await self.load_property(data_db, QUERIES["GET_TEAM"], record.get("team_id")),
            "assigned_to": await self.load_property(user_db, QUERIES["GET_USER"], record.get("assigned_to_id")),
        }

    async def get_all(
        self,
        *,
        item_type: Optional[EngineeringItemType] = None,
        iteration_id: Optional[str] = None,
        related_item_id: Optional[str] = None,
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
        if filter_conditions:
            query = query.replace("$FILTER_CONDITIONS", " AND " + " AND ".join(filter_conditions))
        else:
            query = query.replace("$FILTER_CONDITIONS", "")

        offset = 0
        if cursor:
            sort, offset, extra = parse_cursor(cursor)

            item_type = extra.get("item_type") or item_type

        records = await data_db.get().fetch(
            query,
            sort if sort else WorkItemSortableField.ID.value,
            limit,
            offset,
        )

        cursor = None
        if len(records) == limit:
            cursor = generate_cursor(sort, offset + limit, {"item_type": item_type})

        return [EngineeringItem(**record) for record in records], cursor

    async def get_ask_lucid_info(self) -> List[EngineeringItem]:
        records = await data_db.get().fetch(QUERIES["GET_ASK_LUCID_ENGINEERING_ITEM"])

        return [EngineeringItem(**record) for record in records]

    async def get_batch_by_id(self, *, ids: List[int]) -> List[EngineeringItem]:
        records = await data_db.get().fetch(QUERIES["GET_ENGINEERING_ITEMS_BY_IDS"], ids)

        return [EngineeringItem(**record) for record in records]

    async def batch_update(self, *, updated_items: List[BaseEngineeringItem], current_user: str) -> bool:
        # Go through each update, and figure out which fields need to be updated
        sql = ""
        for updated_item in updated_items:
            sql += f"""
            UPDATE engineering_items SET {updated_item.dump_to_update_sql(current_user)} WHERE id = '{updated_item.id}';
            """

        return await data_db.get().execute(sql)

    async def link(self, *, item_1: int, item_2: int, link_type: EngineeringLinkType, current_user: str) -> bool:
        result = await data_db.get().execute(QUERIES["LINK_ENGINEERING_ITEMS"], item_1, item_2, link_type, current_user)

        return result == "INSERT 0 1"

    async def unlink(self, *, item_1: int, item_2: int, current_user: str) -> bool:
        result = await data_db.get().execute(QUERIES["UNLINK_ENGINEERING_ITEMS"], item_1, item_2, current_user)

        return result == "DELETE 1"


def determine_get_all_filter_conditions(
    item_type: Optional[EngineeringItemType] = None,
    iteration_id: Optional[str] = None,
    related_item_id: Optional[str] = None,
    assigned_to_id: Optional[str] = None,
) -> List[str]:
    filter_conditions = []

    if item_type is not None:
        filter_conditions.append(f"engineering_items.item_type = '{item_type.value}'")

    if iteration_id is not None:
        if iteration_id == "":
            filter_conditions.append("engineering_items.iteration_id = '' OR engineering_items.iteration_id IS NULL")
        else:
            filter_conditions.append(f"engineering_items.iteration_id = '{iteration_id}'")

    if related_item_id is not None:
        filter_conditions.append(
            f"(work_item_relationships.item_1 = '{related_item_id}' OR work_item_relationships.item_2 = '{related_item_id}')"  # noqa
        )
        filter_conditions.append(f"engineering_items.id != '{related_item_id}'")

    if assigned_to_id is not None:
        if assigned_to_id == -1:
            filter_conditions.append("engineering_items.assigned_to_id IS NULL")
        else:
            filter_conditions.append(f"engineering_items.assigned_to_id = '{assigned_to_id}'")

    return filter_conditions
