from datetime import UTC, datetime, timedelta
from uuid import uuid4

from app.api.settings import Settings, user_db
from app.database.common.queries import QUERIES
from app.database.users.models.user_session import BaseUserSession, UserSession
from app.exceptions.common import ObjectNotFoundException


class UserSessionController:
    async def create(self, *, user_session: BaseUserSession):
        settings = Settings()

        # Create db record
        record = await user_db.get().fetchrow(
            QUERIES["CREATE_USER_SESSION"],
            uuid4().hex,
            user_session.user_id,
            user_session.token,
            datetime.now(UTC) + timedelta(minutes=settings.access_token_expire_minutes),
        )

        # TODO Create history entry

        return UserSession(**record)

    async def get(self, *, token: str):
        # Get item record here
        record = await user_db.get().fetchrow(QUERIES["GET_USER_SESSION"], token)

        if not record:
            raise ObjectNotFoundException(object_id=token[:5])

        # TODO Create history

        return UserSession(**record)

    async def get_all(self, *, user_id: str):
        # Get item record here
        records = await user_db.get().fetch(QUERIES["GET_USER_SESSIONS"], user_id)

        # TODO Create history

        return [UserSession(**record) for record in records]

    async def delete(self, *, identifier: str) -> bool:
        result = await user_db.get().execute(QUERIES["DELETE_USER_SESSION"], identifier)

        # TODO Create history entry

        delete_count = int(result.split("DELETE ")[-1])
        if delete_count < 1:
            raise ObjectNotFoundException(object_id=identifier[:5])

        return True
