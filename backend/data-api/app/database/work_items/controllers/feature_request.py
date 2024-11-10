from typing import List, Optional, Tuple

from app.api.settings import data_db
from app.api.utils import generate_cursor, parse_cursor
from app.database.common.queries import QUERIES
from app.database.history.models.history import BaseHistory
from app.database.work_items.controllers.work_item import WorkItemController
from app.database.work_items.models.feature_request import FeatureRequest
from app.database.work_items.models.work_item import WorkItemSortableField


class FeatureRequestController(WorkItemController):
    async def create(
            self, *, company_id: str, new_item: FeatureRequest, current_user: str
    ) -> FeatureRequest:

        record = await data_db.get().fetchrow(
            QUERIES["CREATE_FEATURE_REQUEST"],
            company_id,
            new_item.title,
            new_item.description,
            new_item.submitted_by_id,
            new_item.submitted_date,
            new_item.feature_assigned,
            new_item.comments,
            current_user,
        )
        await self.history_controller.create(
            company_id,
            BaseHistory(
                item_id=record["id"],
                item_type="feature_request",
                action="create",
                metadata=new_item.model_dump(exclude_unset=True),
            ),
            current_user,
        )

        return FeatureRequest(**record)

    async def get(self, *, company_id: str, id: int) -> FeatureRequest:
        record, user = await self._get(company_id=company_id, id=id, scope="FEATURE_REQUEST")

        return FeatureRequest(**record, submitted_by=user)
    
    async def get_all(
            self,
            *,
            company_id: str,
            sort: Optional[WorkItemSortableField] = WorkItemSortableField.ID,
            limit: Optional[int] = 1000,
            cursor: Optional[str] = None,
    ) -> Tuple[List[FeatureRequest], str | None]:
        if sort and sort not in WorkItemSortableField:  # TODO: add fields to WorkItemSortableField or make a new one for FeatureRequest
            raise Exception(f"Invalid sort field: {sort}")

        # TODO: implement determine_get_all_filter_conditions for FeatureRequest
        # filter_conditions = determine_get_all_filter_conditions(company_id=company_id)
        filter_conditions = None
        query: str = QUERIES["GET_ALL_FEATURE_REQUESTS"]
        query = query.replace("$FILTER_CONDITIONS", " AND " + " AND ".join(filter_conditions))

        offset = 0
        if cursor:
            sort, offset, extra = parse_cursor(cursor)

            # item_type = extra.get("item_type") or item_type

        records = await data_db.get().fetch(
            query,
            company_id,
            sort if sort else WorkItemSortableField.ID.value,
            limit,
            offset,
        )

        cursor = None
        if len(records) == limit:
            # cursor = generate_cursor(sort, offset + limit, {"item_type": item_type})
            cursor = generate_cursor(sort, offset + limit)

        return [FeatureRequest(**record) for record in records], cursor
    
    async def update(
            self, *, company_id: str, id: int, updated_item: FeatureRequest, current_user: str
    ) -> FeatureRequest:
        record = await data_db.get().fetchrow(
            QUERIES["UPDATE_FEATURE_REQUEST"],
            company_id,
            id,
            updated_item.title,
            updated_item.description,
            updated_item.submitted_by_id,
            updated_item.submitted_date,
            updated_item.feature_assigned,
            updated_item.comments,
            current_user,
        )

        await self.history_controller.create(
            company_id,
            BaseHistory(
                item_id=id,
                item_type="feature_request",
                action="update",
                metadata=updated_item.model_dump(exclude_unset=True),
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
