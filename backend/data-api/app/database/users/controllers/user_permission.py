from app.database.common.queries import QUERIES
from app.database.users.models.user_permission import BaseUserPermission, UserPermission
from app.database.database import DatabaseController
from app.exceptions.common import ObjectNotFoundException
from uuid import uuid4


class UserPermissionController:
    def __init__(self, db: DatabaseController):
        self.db: DatabaseController = db

    async def create(self, *, organization_id: str, user_permission: BaseUserPermission, current_user: str):
        # Create db record
        record = await self.db.fetchrow(
            QUERIES["CREATE_USER_PERMISSION"],
            organization_id,
            uuid4().hex,
            user_permission.user_id,
            user_permission.disabled,
            user_permission.engineering_permission_level,
            user_permission.support_permission_level,
            current_user,
            current_user,
        )

        # TODO Create history entry

        return UserPermission(**record)

    async def get(self, *, organization_id: str, id: int):
        # Get item record here
        record = await self.db.fetchrow(QUERIES["GET_USER_PERMISSION"], organization_id, id)

        if not record:
            raise ObjectNotFoundException(organization_id=organization_id, object_id=id)

        # TODO Create history

        return UserPermission(**record)

    async def update(
        self,
        *,
        organization_id: str,
        id: str,
        updated_user_permission: BaseUserPermission,
        current_user: str,
    ):
        old_user = await self.get(organization_id=organization_id, id=id)

        new_item_json = updated_user_permission.model_dump(exclude_unset=True)
        old_item_json = old_user.model_dump()

        old_item_json.update(**new_item_json)

        record = await self.db.fetchrow(
            QUERIES["UPDATE_USER_PERMISSION"],
            organization_id,
            id,
            old_item_json["disabled"],
            old_item_json["engineering_permission_level"],
            old_item_json["support_permission_level"],
            current_user,
            old_item_json["deleted_at"],
            old_item_json["deleted_by_id"],
        )

        # TODO Create history entry on new user changes

        return UserPermission(**record)

    async def delete(self, *, id: int, current_user: str, organization_id: str) -> bool:
        result = await self.db.execute(
            QUERIES["DELETE_USER_PERMISSION"],
            organization_id,
            id,
            current_user,
        )

        # TODO Create history entry

        if result != "UPDATE 1":
            raise ObjectNotFoundException(organization_id=organization_id, object_id=id)

        return True
