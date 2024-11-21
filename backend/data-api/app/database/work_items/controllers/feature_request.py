from typing import List, Optional, Tuple

from app.api.settings import data_db
from app.api.utils import generate_cursor, parse_cursor
from app.database.common.queries import QUERIES
from app.database.history.models.history import BaseHistory
from app.database.work_items.controllers.work_item import WorkItemController
from app.database.work_items.models.feature_request import BaseFeatureRequest, FeatureRequest
from app.database.work_items.models.work_item import WorkItemSortableField


class FeatureRequestController(WorkItemController):
    async def create(self, *, new_item: BaseFeatureRequest, current_user: str) -> FeatureRequest:

        record = await data_db.get().fetchrow(
            QUERIES["CREATE_FEATURE_REQUEST"],
            new_item.title,
            new_item.company,
            new_item.submitted_by_id,
            new_item.assigned_to_id,
            new_item.description,
            new_item.created_by_id or current_user,
            current_user,
        )
        await self.history_controller.create(
            BaseHistory(
                item_id=record["id"],
                item_type="feature_request",
                action="create",
                metadata=new_item.model_dump(exclude_unset=True),
            ),
            current_user,
        )

        return FeatureRequest(**record)

    async def get(self, *, id: int) -> FeatureRequest:
        record, user = await self._get(id=id, scope="FEATURE_REQUEST")

        return FeatureRequest(**record, submitted_by=user)

    async def get_all(
        self,
        *,
        sort: Optional[WorkItemSortableField] = WorkItemSortableField.ID,
        limit: Optional[int] = 1000,
        cursor: Optional[str] = None,
    ) -> Tuple[List[FeatureRequest], str | None]:
        if (
            sort and sort not in WorkItemSortableField
        ):  # TODO: add fields to WorkItemSortableField or make a new one for FeatureRequest
            raise Exception(f"Invalid sort field: {sort}")

        # TODO: implement determine_get_all_filter_conditions for FeatureRequest
        # filter_conditions = determine_get_all_filter_conditions(company_id=company_id)
        filter_conditions = None
        query: str = QUERIES["GET_ALL_FEATURE_REQUESTS"]
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

        return [FeatureRequest(**record) for record in records], cursor

    async def update(self, *, id: int, updated_item: BaseFeatureRequest, current_user: str) -> FeatureRequest:
        old_feature_request_item = await self.get(id=id)

        new_item_json = updated_item.model_dump(exclude_unset=True)
        old_item_json = old_feature_request_item.model_dump()

        old_item_json.update(**new_item_json)

        record = await data_db.get().fetchrow(
            QUERIES["UPDATE_FEATURE_REQUEST"],
            id,
            old_item_json["title"],
            old_item_json["company"],
            old_item_json["submitted_by_id"],
            old_item_json["assigned_to_id"],
            old_item_json["description"],
            old_item_json["created_by_id"],
            current_user,
            old_item_json["deleted_at"],
            old_item_json["deleted_by_id"],
        )

        await self.history_controller.create(
            BaseHistory(
                item_id=record["id"],
                item_type="feature_request",
                action="update",
                metadata=new_item_json,
            ),
            current_user,
        )

        return FeatureRequest(**record)

        # TODO: Implement link for FeatureRequests, should link to an EngineeringItem
        # async def link(
        #     self, *, company_id: str, item_1: int, item_2: int, link_type: FeatureRequestLinkType, current_user: str
        # ) -> bool:
        #     result = await data_db.get().execute(
        #         QUERIES["LINK_FEATURE_REQUEST_ITEMS"], company_id, item_1, item_2, link_type, current_user
        #     )

        #     return result == "INSERT 0 1"

        # async def unlink(self, *, company_id: str, item_1: int, item_2: int, current_user: str) -> bool:
        #     result = await data_db.get().execute(
        #         QUERIES["UNLINK_FEATURE_REQUEST_ITEMS"], company_id, item_1, item_2, current_user
        #     )

        #     return result == "DELETE 1"


# TODO: Implement determine_get_all_filter_conditions for FeatureRequest
# def determine_get_all_filter_conditions(
#     item_type: Optional[FeatureRequest] = None,
# ) -> List[str]:
#     filter_conditions = []

#     if item_type is not None:
#         filter_conditions.append(f"engineering_items.item_type = '{item_type.value}'")

#     if iteration_id is not None:
#         if iteration_id == -1:
#             filter_conditions.append("engineering_items.iteration_id IS NULL")
#         else:
#             filter_conditions.append(f"engineering_items.iteration_id = {iteration_id}")

#     if related_item_id is not None:
#         filter_conditions.append(
#             f"(work_item_relationships.item_1 = {related_item_id} OR work_item_relationships.item_2 = {related_item_id})"  # noqa
#         )
#         filter_conditions.append(f"engineering_items.id != {related_item_id}")

#     if assigned_to_id is not None:
#         if assigned_to_id == -1:
#             filter_conditions.append("engineering_items.assigned_to_id IS NULL")
#         else:
#             filter_conditions.append(f"engineering_items.assigned_to_id = '{assigned_to_id}'")

#     return filter_conditions
