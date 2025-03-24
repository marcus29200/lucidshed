from typing import List, Optional, Tuple

from app.api.settings import data_db
from app.api.utils import generate_cursor, parse_cursor
from app.database.common.queries import QUERIES
from app.database.work_items.controllers.work_item import WorkItemController
from app.database.work_items.models.support_item import SupportItem
from app.database.work_items.models.work_item import WorkItemSortableField


class SupportController(WorkItemController):
    _type = "SUPPORT_ITEM"
    _create_history = True
    RETURN_MODEL = SupportItem

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
