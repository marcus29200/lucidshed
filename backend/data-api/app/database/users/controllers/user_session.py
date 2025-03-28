from app.api.settings import user_db
from app.database.common.controllers import BaseController
from app.database.common.queries import QUERIES
from app.database.users.models.user_session import UserSession
from app.exceptions.common import ObjectNotFoundException


class UserSessionController(BaseController):
    _type = "USER_SESSION"
    _create_history = False
    _database_context = user_db
    RETURN_MODEL = UserSession

    async def get_all(self, *, user_id: str):
        records = await user_db.get().fetch(QUERIES["GET_USER_SESSIONS"], user_id)

        return [UserSession(**record) for record in records]

    async def delete(self, *, id: str, current_user: str, **extra_params) -> bool:
        result = await user_db.get().execute(QUERIES["DELETE_USER_SESSION"], id)

        delete_count = int(result.split("DELETE ")[-1])
        if delete_count < 1:
            raise ObjectNotFoundException(object_id=id[:5])

        return True
