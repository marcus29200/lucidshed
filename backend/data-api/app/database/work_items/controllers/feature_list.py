from typing import List, Optional, Tuple

from app.api.settings import data_db
from app.api.utils import generate_cursor, parse_cursor
from app.database.work_items.controllers.work_item import WorkItemController
from app.database.work_items.models.feature_list import BaseFeatureList, FeatureList
from app.database.work_items.models.work_item import WorkItemSortableField
from app.database.work_items.queries import FEATURE_LIST_QUERIES as QUERIES
from app.decorators import serialize_enum_values
from app.exceptions.common import ObjectNotFoundException


class FeatureListController(WorkItemController):
    @serialize_enum_values
    async def create(self, *, new_item: BaseFeatureList, current_user: str) -> FeatureList:
        record = await data_db.get().fetchrow(
            QUERIES["CREATE_FEATURE_LIST"],
            new_item.title,
            new_item.description,
            new_item.requests,
            new_item.reach,
            new_item.impact,
            new_item.confidence,
            new_item.effort,
            new_item.growth,
            current_user,
            current_user,
        )
        feature_list = FeatureList(**record)

        # Associate feature list with feature requests
        for feature_request_id in new_item.feature_requests:
            await data_db.get().execute(
                QUERIES["ASSOCIATE_FEATURE_LIST_WITH_FEATURE_REQUEST"], feature_list.id, feature_request_id
            )

        # Populate feature_list with associated feature requests
        feature_requests = await data_db.get().fetch(QUERIES["GET_FEATURE_REQUESTS_FOR_FEATURE_LIST"], feature_list.id)
        feature_list.feature_requests = [fr["feature_request_id"] for fr in feature_requests]

        return feature_list

    async def get_one(self) -> FeatureList:
        breakpoint()
        record = await data_db.get().fetchrow(QUERIES["GET_FEATURE_LIST"])

        if not record:
            raise ObjectNotFoundException()

        feature_list = FeatureList(**record)

        # Get associated feature requests
        feature_requests = await data_db.get().fetch(
            QUERIES["GET_FEATURE_REQUESTS_FOR_FEATURE_LIST"],
            feature_list["id"]
        )
        feature_list.feature_requests = [fr["feature_request_id"] for fr in feature_requests]

        return feature_list

    async def get(self, *, id: int) -> FeatureList:
        record = await data_db.get().fetchrow(
            QUERIES["GET_FEATURE_LIST_BY_ID"],
            id,
        )

        if not record:
            raise ObjectNotFoundException(object_id=id)

        feature_list = FeatureList(**record)

        # Get associated feature requests
        feature_requests = await data_db.get().fetch(QUERIES["GET_FEATURE_REQUESTS_FOR_FEATURE_LIST"], id)
        feature_list.feature_requests = [fr["feature_request_id"] for fr in feature_requests]

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

        # TODO: implement determine_get_all_filter_conditions for FeatureRequest
        # filter_conditions = determine_get_all_filter_conditions(company_id=company_id)
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
            feature_requests = await data_db.get().fetch(
                QUERIES["GET_FEATURE_REQUESTS_FOR_FEATURE_LIST"], feature_list.id
            )
            feature_list.feature_requests = [fr["feature_request_id"] for fr in feature_requests]

        return feature_lists, cursor

    @serialize_enum_values
    async def update(self, *, id: int, updated_item: BaseFeatureList, current_user: str) -> FeatureList:
        old_feature_list = await self.get(id=id)

        new_item_json = updated_item.model_dump(exclude_unset=True)
        old_item_json = old_feature_list.model_dump()

        old_item_json.update(**new_item_json)

        record = await data_db.get().fetchrow(
            QUERIES["UPDATE_FEATURE_LIST"],
            id,
            updated_item.title,
            updated_item.description,
            updated_item.requests,
            updated_item.reach,
            updated_item.impact,
            updated_item.confidence,
            updated_item.effort,
            updated_item.growth,
            current_user,
        )
        feature_list = FeatureList(**record)

        # Update associations with feature requests
        await data_db.get().execute(QUERIES["DELETE_FEATURE_LIST_ASSOCIATIONS"], id)
        for feature_request_id in updated_item.feature_requests:
            await data_db.get().execute(QUERIES["ASSOCIATE_FEATURE_LIST_WITH_FEATURE_REQUEST"], id, feature_request_id)

        return feature_list

    async def delete(self, *, id: int) -> None:
        await data_db.get().execute(
            QUERIES["DELETE_FEATURE_LIST"],
            id,
        )
