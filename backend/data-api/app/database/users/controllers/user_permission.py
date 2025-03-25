from typing import List

from app.api.settings import user_db
from app.database.common.controllers import BaseController
from app.database.common.queries import QUERIES
from app.database.users.models.user_permission import BaseUserPermission, UserPermission


class UserPermissionController(BaseController):
    _type = "USER_PERMISSION"
    _create_history = False
    _database_context = user_db
    RETURN_MODEL = UserPermission

    async def create(self, *, organization_id: str, user_permission: BaseUserPermission, current_user: str):
        user_permission.organization_id = organization_id

        return await super().create(new_item=user_permission, current_user=current_user)

    async def get_user_organizations(self, *, user_id: str) -> List[str]:
        records = await user_db.get().fetch(QUERIES["GET_USER_ORGANIZATIONS"], user_id)

        return records
