from logging import getLogger
from typing import List, Optional, Tuple

from app.api.settings import data_db
from app.api.utils import generate_cursor, parse_cursor
from app.database.features.models.feature import BaseFeature, Feature
from app.database.features.queries import FEATURE_QUERIES as QUERIES
from app.database.work_items.controllers.work_item import WorkItemController
from app.database.work_items.models.work_item import WorkItemSortableField
from app.decorators import serialize_enum_values
from app.exceptions.common import ObjectNotFoundException
from app.database.history.models.history import BaseHistory

logger = getLogger(__name__)


class FeatureController(WorkItemController):
    _type = "FEATURE"
    _create_history = True
    RETURN_MODEL = Feature

    @serialize_enum_values
    async def create(self, *, new_item: BaseFeature, current_user: str) -> Feature:
        return await super().create(new_item=new_item, current_user=current_user)

    async def get_all(
        self,
        *,
        sort: Optional[WorkItemSortableField] = WorkItemSortableField.ID,
        limit: Optional[int] = 1000,
        cursor: Optional[str] = None,
    ) -> Tuple[List[Feature], str | None]:
        if sort and sort not in WorkItemSortableField:
            raise ObjectNotFoundException(f"Invalid sort field {sort}")

        # TODO: implement determine_get_all_filter_conditions for FeatureRequest
        filter_conditions = None
        query: str = QUERIES["GET_ALL_FEATURES"]
        if filter_conditions:
            query = query.replace("$FILTER_CONDITIONS", " AND " + " AND ".join(filter_conditions))
        else:
            query = query.replace("$FILTER_CONDITIONS", "")

        offset = 0
        if cursor:
            sort, offset, extra = parse_cursor(cursor)

            # item_type = extra.get("item_type") or item_type

        records = await data_db.get().fetch(
            query,
            sort if sort else WorkItemSortableField.ID.value,
            limit,
            offset,
        )

        cursor = None
        if len(records) == limit:
            # cursor = generate_cursor(sort, offset + limit, {"item_type": item_type})
            cursor = generate_cursor(sort, offset + limit)

        return [Feature(**record) for record in records], cursor

    @serialize_enum_values
    async def update(self, *, id: int, updated_item: BaseFeature, current_user: str) -> Feature:
        old_feature_item = await self.get(id=id)

        new_item_json = updated_item.model_dump(exclude_unset=True)
        old_item_json = old_feature_item.model_dump()

        old_item_json.update(**new_item_json)

        record = await data_db.get().fetchrow(
            QUERIES["UPDATE_FEATURE_ITEM"],
            id,
            old_item_json["title"],
            old_item_json["description"],
            old_item_json["requests"],
            old_item_json["reach"],
            old_item_json["impact"],
            old_item_json["confidence"],
            old_item_json["effort"],
            old_item_json["growth"],
            current_user,
        )

        await self.history_controller.create(
            history=BaseHistory(item_id=record["id"], item_type="feature", action="update", metadata=new_item_json),
            current_user=current_user,
        )

        return Feature(**record)

    async def delete(self, *, id: int, current_user: str) -> bool:
        result = await data_db.get().execute(
            QUERIES["DELETE_FEATURE_ITEM"],
            id,
            current_user,
        )
        if result != "UPDATE 1":
            raise ObjectNotFoundException(object_id=id)

        return True

    async def get_all_feature_requests_for_feature(self, *, id: int) -> List[dict]:
        """get all feature requests for a feature"""
        records = await data_db.get().fetch(
            QUERIES["GET_FEATURE_REQUESTS_FOR_FEATURE"],
            id,
        )
        if not records:
            raise ObjectNotFoundException(object_id=id)

        return [dict(record) for record in records]
    
    async def get_count_of_feature_requests_for_feature(self, *, id: int) -> int:
        """get count of all feature requests for a feature"""
        record = await data_db.get().fetchrow(
            QUERIES["GET_FEATURE_REQUESTS_COUNT_FOR_FEATURE"],
            id,
        )
        if not record:
            raise ObjectNotFoundException(object_id=id)

        return record["count"]
