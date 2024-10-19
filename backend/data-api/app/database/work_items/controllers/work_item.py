from typing import Any, Dict, List, Optional, Tuple
from uuid import uuid4

from app.api.settings import data_db
from app.api.utils import generate_cursor, parse_cursor
from app.database.common.queries import QUERIES
from app.database.history.controllers.history import HistoryController
from app.database.history.models.history import BaseHistory
from app.database.work_items.models.comment import BaseWorkItemComment, WorkItemComment
from app.exceptions.common import ObjectNotFoundException
from app.database.users.models.user import SlimUser
from app.database.users.controllers.user import UserController


class WorkItemController:
    def __init__(self):
        self.history_controller = HistoryController()

    async def create(self, *, organization_id: str, new_item: Any, current_user: str) -> Any:
        raise NotImplementedError()

    async def get(self, *, organization_id: str, id: int) -> Any:
        raise NotImplementedError()

    async def _get(self, *, organization_id: str, id: int, scope: str) -> Tuple[Dict[str, Any], Optional[SlimUser]]:
        # Get item record here
        record = await data_db.get().fetchrow(QUERIES[f"GET_{scope}_ITEM"], organization_id, id)

        if not record:
            raise ObjectNotFoundException(organization_id=organization_id, object_id=id)

        user = None
        if record.get("assigned_to_id"):
            user = await UserController().get_slim_user(id=record["assigned_to_id"])

        return record, user

    async def get_all(
        self,
        *,
        organization_id: str,
        sort: Optional[Any] = "id",
        item_type: Optional[Any] = None,
        limit: Optional[int] = 1000,
        cursor: Optional[str] = None,
    ) -> Tuple[List[Any], str | None]:
        raise NotImplementedError()

    # TODO this probably doesn't belong as a shared function
    async def _get_all(
        self,
        *,
        organization_id: str,
        scope: str,
        sort: Optional[str] = "id",
        item_type: Optional[str] = None,
        iteration_id: Optional[str] = None,
        related_item_id: Optional[int] = None,
        assigned_to_id: Optional[str] = None,
        limit: Optional[int] = 1000,
        cursor: Optional[str] = None,
    ) -> Tuple[List[Dict[str, Any]], str | None]:
        offset = 0
        if cursor:
            sort, offset, extra = parse_cursor(cursor)

            item_type = extra.get("item_type") or item_type

        records = await data_db.get().fetch(
            QUERIES[f"GET_ALL_{scope}_ITEM"],
            organization_id,
            item_type,
            iteration_id,
            related_item_id,
            assigned_to_id,
            sort,
            limit,
            offset,
        )

        cursor = None
        if len(records) == limit:
            cursor = generate_cursor(sort, offset + limit, {"item_type": item_type})

        return records, cursor

    async def update(self, *, organization_id: str, id: int, updated_item: Any, current_user: str) -> Any:
        raise NotImplementedError()

    async def delete(self, *, organization_id: str, id: int, current_user: str, scope: str) -> bool:
        result = await data_db.get().execute(
            QUERIES[f"DELETE_{scope}_ITEM"],
            organization_id,
            id,
            current_user,
        )

        if result != "UPDATE 1":
            raise ObjectNotFoundException(organization_id=organization_id, object_id=id)

        await self.history_controller.create(
            organization_id,
            BaseHistory(item_id=str(id), item_type=scope.lower(), action="delete"),
            current_user,
        )

        return True

    async def create_comment(
        self,
        *,
        organization_id: str,
        work_item_id: int,
        new_comment: BaseWorkItemComment,
        current_user: str,
    ) -> WorkItemComment:
        record = await data_db.get().fetchrow(
            QUERIES["CREATE_WORK_ITEM_COMMENT"],
            uuid4().hex,
            organization_id,
            work_item_id,
            new_comment.description,
            current_user,
            current_user,
        )

        # TODO Create history entry

        return WorkItemComment(**record)

    async def get_comment(self, *, organization_id: str, work_item_id: int, id: str) -> WorkItemComment:
        record = await data_db.get().fetchrow(QUERIES["GET_WORK_ITEM_COMMENT"], organization_id, work_item_id, id)

        if not record:
            # TODO, will need to do better here, could be confusing
            raise ObjectNotFoundException(organization_id=organization_id, object_id=id)

        # TODO Create history entry

        return WorkItemComment(**record)

    async def get_comments(self, *, organization_id: str, id: int) -> List[WorkItemComment]:
        records = await data_db.get().fetch(QUERIES["GET_WORK_ITEM_COMMENTS"], organization_id, id)

        # TODO Create history entry

        return [WorkItemComment(**record) for record in records], None

    async def update_comment(
        self,
        *,
        organization_id: str,
        work_item_id: int,
        id: str,
        updated_comment: BaseWorkItemComment,
        current_user: str,
    ) -> WorkItemComment:
        old_comment = await self.get_comment(organization_id=organization_id, work_item_id=work_item_id, id=id)

        new_item_json = updated_comment.model_dump(exclude_unset=True)
        old_item_json = old_comment.model_dump()

        old_item_json.update(**new_item_json)

        record = await data_db.get().fetchrow(
            QUERIES["UPDATE_WORK_ITEM_COMMENT"],
            organization_id,
            work_item_id,
            id,
            old_item_json["description"],
            current_user,
            old_item_json["deleted_at"],
            old_item_json["deleted_by_id"],
        )

        if not record:
            # TODO, will need to do better here, could be confusing
            raise ObjectNotFoundException(organization_id=organization_id, object_id=id)

        # TODO Create history entry

        return WorkItemComment(**record)

    async def delete_comment(self, *, organization_id: str, work_item_id: int, id: str, current_user: str) -> bool:
        result = await data_db.get().execute(
            QUERIES["DELETE_WORK_ITEM_COMMENT"],
            organization_id,
            work_item_id,
            id,
            current_user,
        )

        if result != "UPDATE 1":
            raise ObjectNotFoundException(organization_id=organization_id, object_id=id)

        return True

    async def delete_comments(self, *, organization_id: str, work_item_id: int, current_user: str) -> int:
        result = await data_db.get().execute(
            QUERIES["DELETE_WORK_ITEM_COMMENTS"],
            organization_id,
            work_item_id,
            current_user,
        )

        return result.split("UPDATE ")[-1]
