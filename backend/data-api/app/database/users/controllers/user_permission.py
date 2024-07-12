from typing import List
from uuid import uuid4

from app.api.settings import user_db
from app.database.common.queries import QUERIES
from app.database.users.models.user_permission import BaseUserPermission, UserPermission
from app.exceptions.common import ObjectNotFoundException


class UserPermissionController:
    async def create(self, *, organization_id: str, user_permission: BaseUserPermission, current_user: str):
        # Create db record
        record = await user_db.get().fetchrow(
            QUERIES["CREATE_USER_PERMISSION"],
            organization_id,
            uuid4().hex,
            user_permission.user_id,
            user_permission.disabled,
            user_permission.role,
            current_user,
            current_user,
        )

        # TODO Create history entry

        return UserPermission(**record)

    async def get(self, *, organization_id: str, id: int):
        # Get item record here
        record = await user_db.get().fetchrow(QUERIES["GET_USER_PERMISSION"], organization_id, id)

        if not record:
            raise ObjectNotFoundException(organization_id=organization_id, object_id=id)

        # TODO Create history

        return UserPermission(**record)

    async def get_user_organizations(self, *, user_id: int) -> List[str]:
        records = await user_db.get().fetch(QUERIES["GET_USER_ORGANIZATIONS"], user_id)

        return records

    async def update(
        self,
        *,
        organization_id: str,
        id: str,
        updated_user_permission: BaseUserPermission,
        current_user: str,
    ):
        old_user_permission = await self.get(organization_id=organization_id, id=id)

        new_item_json = updated_user_permission.model_dump(exclude_unset=True)
        old_item_json = old_user_permission.model_dump()

        old_item_json.update(**new_item_json)

        record = await user_db.get().fetchrow(
            QUERIES["UPDATE_USER_PERMISSION"],
            organization_id,
            id,
            old_item_json["disabled"],
            old_item_json["role"],
            current_user,
            old_item_json["deleted_at"],
            old_item_json["deleted_by_id"],
        )

        # TODO Create history entry on new user changes

        return UserPermission(**record)

    async def delete(self, *, id: int, current_user: str, organization_id: str) -> bool:
        result = await user_db.get().execute(
            QUERIES["DELETE_USER_PERMISSION"],
            organization_id,
            id,
            current_user,
        )

        # TODO Create history entry

        if result != "UPDATE 1":
            raise ObjectNotFoundException(organization_id=organization_id, object_id=id)

        return True
