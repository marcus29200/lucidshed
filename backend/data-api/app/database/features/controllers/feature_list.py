from typing import List, Optional, Tuple

from app.api.settings import data_db
from app.api.utils import generate_cursor, parse_cursor
from app.database.features.models.feature_list import BaseFeatureList, FeatureList
from app.database.features.queries import FEATURE_LIST_QUERIES as QUERIES
from app.database.features.queries import FEATURE_QUERIES
from app.database.history.models.history import BaseHistory
from app.database.work_items.controllers.work_item import WorkItemController
from app.database.work_items.models.work_item import WorkItemSortableField
from app.exceptions.common import ObjectNotFoundException


class FeatureListController(WorkItemController):
    async def create(self, *, new_item: BaseFeatureList, current_user: str) -> FeatureList:
        record = await data_db.get().fetchrow(
            QUERIES["CREATE_FEATURE_LIST"],
            new_item.title,
            new_item.description,
            current_user,
            current_user,
        )

        await self.history_controller.create(
            BaseHistory(
                item_id=record["id"],
                item_type="feature_list",
                action="create",
                metadata=new_item.model_dump(exclude_unset=True),
            ),
            current_user,
        )
        feature_list = FeatureList(**record)

        return feature_list

    async def get(self, *, id: str) -> FeatureList:
        record = await data_db.get().fetchrow(
            QUERIES["GET_FEATURE_LIST_BY_ID"],
            id,
        )

        if not record:
            raise ObjectNotFoundException(object_id=id)

        record_dict = dict(record)
        # get features associated with the feature list
        features = await data_db.get().fetch(QUERIES["GET_FEATURES_FOR_FEATURE_LIST"], id)
        # breakpoint()
        record_dict["features"] = [dict(feature)["item_2"] for feature in features]

        feature_list = FeatureList(**record_dict)

        return feature_list

    async def get_all(
        self,
        *,
        sort: Optional[WorkItemSortableField] = WorkItemSortableField.ID,
        limit: Optional[int] = 1000,
        cursor: Optional[str] = None,
        company_id: Optional[int] = None,
    ) -> Tuple[List[FeatureList], Optional[str]]:
        if sort and sort not in WorkItemSortableField:
            raise Exception(f"Invalid sort field: {sort}")

        # TODO: implement determine_get_all_filter_conditions for FeatureList1
        # filter_conditions = determine_get_all_filter_conditions()
        filter_conditions = None
        query: str = QUERIES["GET_ALL_FEATURE_LISTS"]
        if filter_conditions:
            query = query.replace("$FILTER_CONDITIONS", " AND " + " AND ".join(filter_conditions))
        else:
            query = query.replace("$FILTER_CONDITIONS", "")

        offset = 0
        if cursor:
            sort, offset, extra = parse_cursor(cursor)

        records = await data_db.get().fetch(
            query,
            sort.value if sort else WorkItemSortableField.ID.value,
            limit,
            offset,
        )

        cursor = None
        if len(records) == limit:
            cursor = generate_cursor(sort, offset + limit)

        feature_lists = [FeatureList(**record) for record in records]

        for feature_list in feature_lists:
            features = await data_db.get().fetch(QUERIES["GET_FEATURES_FOR_FEATURE_LIST"], feature_list.id)
            feature_list.features = [fr["feature_id"] for fr in features]

        return feature_lists, cursor

    async def update(self, *, id: str, updated_item: BaseFeatureList, current_user: str) -> FeatureList:
        old_feature_list = await self.get(id=id)

        new_item_json = updated_item.model_dump(exclude_unset=True)
        old_item_json = old_feature_list.model_dump()

        old_item_json.update(**new_item_json)

        record = await data_db.get().fetchrow(
            QUERIES["UPDATE_FEATURE_LIST"],
            id,
            old_item_json["title"],
            old_item_json["description"],
            current_user,
        )
        feature_list = FeatureList(**record)

        return feature_list

    async def delete(self, *, id: str) -> None:
        await data_db.get().execute(
            QUERIES["DELETE_FEATURE_LIST"],
            id,
        )

    async def link(self, *, item_1: str, item_2: str, current_user: str) -> bool:
        result = await data_db.get().execute(
            QUERIES["LINK_FEATURE_LIST_FEATURE"],
            item_1,
            item_2,
            current_user
        )
        return result == "INSERT 0 1"

    async def unlink(self, *, item_1: str, item_2: str, current_user: str) -> bool:
        result = await data_db.get().execute(
            QUERIES["UNLINK_FEATURE_LIST_FEATURE"],
            item_1,
            item_2,
            current_user
        )
        return result == "DELETE 1"

    async def get_unassigned_features(self, feature_list_id: str) -> List[dict]:
        records = await data_db.get().fetch(
            QUERIES["GET UNASSIGNED_FEATURES"], feature_list_id
        )

        return [dict(record) for record in records]

    async def get_feature(self, *, id: str) -> dict:
        feature = await data_db.get().fetchrow(
            FEATURE_QUERIES["GET_FEATURE_ITEM"],
            id,
        )
        if not feature:
            raise ObjectNotFoundException(object_id=id)
        return dict(feature)
