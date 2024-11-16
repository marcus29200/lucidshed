from typing import Any, Dict, List, Optional, Tuple
from uuid import uuid4

from app.api.settings import data_db
from app.database.common.queries import QUERIES
from app.database.history.controllers.history import HistoryController
from app.database.history.models.history import BaseHistory
from app.database.users.controllers.user import UserController
from app.database.users.models.user import SlimUser
from app.database.work_items.models.comment import BaseWorkItemComment, WorkItemComment
from app.exceptions.common import ObjectNotFoundException


class WorkItemController:
    def __init__(self):
        self.history_controller = HistoryController()

    async def create(self, *, new_item: Any, current_user: str) -> Any:
        raise NotImplementedError()

    async def get(self, *, id: int) -> Any:
        raise NotImplementedError()

    async def _get(self, *, id: int, scope: str) -> Tuple[Dict[str, Any], Optional[SlimUser]]:
        # Get item record here
        record = await data_db.get().fetchrow(QUERIES[f"GET_{scope}_ITEM"], id)

        if not record:
            raise ObjectNotFoundException(object_id=id)

        user = None
        if record.get("assigned_to_id"):
            user = await UserController().get_slim_user(id=record["assigned_to_id"])

        return record, user

    async def get_all(
        self,
        *,
        sort: Optional[Any] = "id",
        item_type: Optional[Any] = None,
        limit: Optional[int] = 1000,
        cursor: Optional[str] = None,
    ) -> Tuple[List[Any], str | None]:
        raise NotImplementedError()

    async def _get_all(self, **kwargs) -> Tuple[List[Dict[str, Any]], str | None]:
        raise NotImplementedError()

    async def update(self, *, id: int, updated_item: Any, current_user: str) -> Any:
        raise NotImplementedError()

    async def delete(self, *, id: int, current_user: str, scope: str) -> bool:
        result = await data_db.get().execute(
            QUERIES[f"DELETE_{scope}_ITEM"],
            id,
            current_user,
        )

        if result != "UPDATE 1":
            raise ObjectNotFoundException(object_id=id)

        await self.history_controller.create(
            BaseHistory(item_id=str(id), item_type=scope.lower(), action="delete"),
            current_user,
        )

        return True

    async def create_comment(
        self,
        *,
        work_item_id: int,
        new_comment: BaseWorkItemComment,
        current_user: str,
    ) -> WorkItemComment:
        record = await data_db.get().fetchrow(
            QUERIES["CREATE_WORK_ITEM_COMMENT"],
            uuid4().hex,
            work_item_id,
            new_comment.description,
            current_user,
            current_user,
        )

        # TODO Create history entry

        return WorkItemComment(**record)

    async def get_comment(self, *, work_item_id: int, id: str) -> WorkItemComment:
        record = await data_db.get().fetchrow(QUERIES["GET_WORK_ITEM_COMMENT"], work_item_id, id)

        if not record:
            # TODO, will need to do better here, could be confusing
            raise ObjectNotFoundException(object_id=id)

        # TODO Create history entry

        return WorkItemComment(**record)

    async def get_comments(self, *, id: int) -> Tuple[List[WorkItemComment], Optional[str]]:
        records = await data_db.get().fetch(QUERIES["GET_WORK_ITEM_COMMENTS"], id)

        # TODO Create history entry

        return [WorkItemComment(**record) for record in records], None

    async def update_comment(
        self,
        *,
        work_item_id: int,
        id: str,
        updated_comment: BaseWorkItemComment,
        current_user: str,
    ) -> WorkItemComment:
        old_comment = await self.get_comment(work_item_id=work_item_id, id=id)

        new_item_json = updated_comment.model_dump(exclude_unset=True)
        old_item_json = old_comment.model_dump()

        old_item_json.update(**new_item_json)

        record = await data_db.get().fetchrow(
            QUERIES["UPDATE_WORK_ITEM_COMMENT"],
            work_item_id,
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

        return WorkItemComment(**record)

    async def delete_comment(self, *, work_item_id: int, id: str, current_user: str) -> bool:
        result = await data_db.get().execute(QUERIES["DELETE_WORK_ITEM_COMMENT"], work_item_id, id, current_user)

        if result != "UPDATE 1":
            raise ObjectNotFoundException(object_id=id)

        return True

    async def delete_comments(self, *, work_item_id: int, current_user: str) -> int:
        result = await data_db.get().execute(QUERIES["DELETE_WORK_ITEM_COMMENTS"], work_item_id, current_user)

        return result.split("UPDATE ")[-1]
