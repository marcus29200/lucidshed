from app.database.users.models.user import BaseUser, User
from app.database.common.queries import QUERIES
from app.database.database import DatabaseController


class UserController:
    def __init__(self, db: DatabaseController):
        self.db: DatabaseController = db

    async def create(self, *, user: BaseUser):
        # Create db record
        record = await self.db.fetchrow(
            QUERIES["CREATE_USER"],
            "test",  # TODO Org id, needs to come from the jwt token, and also, might need to control the db we access
            user.email,
            user.first_name,
            user.last_name,
            user.disabled,
            user.email,
            user.email,
        )

        # TODO Create history entry

        return User(**record)

    async def get(self, *, organization_id: str, id: int):
        record = await super().get(organization_id=organization_id, id=id)

        return User(**record)

    async def update(
        self,
        *,
        organization_id: str,
        id: str,
        updated_user: User,
        current_user: str,
    ):
        old_user = await self.get(organization_id=organization_id, id=id)

        new_item_json = updated_user.model_dump(exclude_unset=True)
        old_item_json = old_user.model_dump()

        old_item_json.update(**new_item_json)

        record = await self.db.fetchrow(
            QUERIES["UPDATE_USER"],
            organization_id,  # TODO Org id, come from the jwt token, and might need to control the db we access
            id,
            old_item_json["first_name"],
            old_item_json["last_name"],
            old_item_json["disabled"],
            old_item_json["created_by_id"],
            current_user,
            old_item_json["deleted_at"],
            old_item_json["deleted_by_id"],
        )

        # TODO Create history entry on new user changes

        return User(**record)
