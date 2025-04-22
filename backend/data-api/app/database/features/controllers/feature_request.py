from logging import getLogger
from typing import List, Optional, Tuple
from uuid import uuid4

from app.api.utils import generate_cursor, parse_cursor
from app.database.features.models.feature_request import FeatureRequest
from app.database.features.queries import FEATURE_REQUEST_QUERIES as QUERIES
from app.database.work_items.controllers.work_item import WorkItemController
from app.database.work_items.models.comment import BaseFeatureRequestComment, FeatureRequestComment
from app.database.work_items.models.work_item import WorkItemSortableField
from app.exceptions.common import ObjectNotFoundException
from app.settings import data_db

logger = getLogger(__name__)


class FeatureRequestController(WorkItemController):
    _type = "FEATURE_REQUEST"
    _create_history = True
    RETURN_MODEL = FeatureRequest

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

    async def link(self, *, item_1: str, item_2: str, current_user: str) -> bool:
        result = await data_db.get().execute(QUERIES["LINK_FEATURE_REQUEST_FEATURE"], item_1, item_2, current_user)

        return result == "INSERT 0 1"

    async def unlink(self, *, item_1: str, item_2: str, current_user: str) -> bool:
        result = await data_db.get().execute(QUERIES["UNLINK_FEATURE_REQUEST_FEATURE"], item_1, item_2)

        return result == "DELETE 1"

    async def create_comment(
        self,
        *,
        feature_request_id: str,
        new_comment: BaseFeatureRequestComment,
        current_user: str,
    ) -> FeatureRequestComment:
        record = await data_db.get().fetchrow(
            QUERIES["CREATE_FEATURE_REQUEST_COMMENT"],
            uuid4().hex,
            feature_request_id,
            new_comment.description,
            current_user,
            current_user,
        )

        # TODO Create history entry

        return FeatureRequestComment(**record)

    async def get_comment(self, *, feature_request_id: str, id: str) -> FeatureRequestComment:
        record = await data_db.get().fetchrow(QUERIES["GET_FEATURE_REQUEST_COMMENT"], feature_request_id, id)

        if not record:
            # TODO, will need to do better here, could be confusing
            raise ObjectNotFoundException(object_id=id)

        # TODO Create history entry

        return FeatureRequestComment(**record)

    async def get_comments(self, *, id: str) -> Tuple[List[FeatureRequestComment], Optional[str]]:
        records = await data_db.get().fetch(QUERIES["GET_FEATURE_REQUEST_COMMENTS"], id)

        # TODO Create history entry

        return [FeatureRequestComment(**record) for record in records], None

    async def update_comment(
        self,
        *,
        feature_request_id: str,
        id: str,
        updated_comment: BaseFeatureRequestComment,
        current_user: str,
    ) -> FeatureRequestComment:
        old_comment = await self.get_comment(feature_request_id=feature_request_id, id=id)

        new_item_json = updated_comment.model_dump(exclude_unset=True)
        old_item_json = old_comment.model_dump()

        old_item_json.update(**new_item_json)

        record = await data_db.get().fetchrow(
            QUERIES["UPDATE_FEATURE_REQUEST_COMMENT"],
            feature_request_id,
            id,
            old_item_json["description"],
            current_user,
            old_item_json["deleted_at"],
            old_item_json["deleted_by_id"],
        )

        if not record:
            # TODO, will need to do better here, could be confusing
            raise ObjectNotFoundException(object_id=id)

        # TODO Create history entry

        return FeatureRequestComment(**record)

    async def delete_comment(self, *, feature_request_id: str, id: str, current_user: str) -> bool:
        result = await data_db.get().execute(
            QUERIES["DELETE_FEATURE_REQUEST_COMMENT"], feature_request_id, id, current_user
        )

        if result != "UPDATE 1":
            raise ObjectNotFoundException(object_id=id)

        return True

    async def delete_comments(self, *, feature_request_id: str, current_user: str) -> int:
        result = await data_db.get().execute(
            QUERIES["DELETE_FEATURE_REQUEST_COMMENTS"], feature_request_id, current_user
        )

        return result.split("UPDATE ")[-1]
