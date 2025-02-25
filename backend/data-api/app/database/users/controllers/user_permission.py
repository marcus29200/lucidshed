from typing import List

from app.api.settings import user_db
from app.database.common.queries import QUERIES
from app.database.users.models.user_permission import UserPermission
from app.database.common.controllers import BaseController


class UserPermissionController(BaseController):
    _type = "USER_PERMISSION"
    _create_history = True
    RETURN_MODEL = UserPermission

    async def get_user_organizations(self, *, user_id: str) -> List[str]:
        records = await user_db.get().fetch(QUERIES["GET_USER_ORGANIZATIONS"], user_id)

        return records
