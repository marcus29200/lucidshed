from typing import List, Optional, Tuple
from uuid import uuid4

from app.api.utils import generate_cursor, parse_cursor
from app.database.common.queries import QUERIES
from app.database.database import DatabaseController
from app.database.users.models.user import BaseUser, User, UserSortableField
from app.exceptions.common import ObjectNotFoundException



class UserController:
    def __init__(self, db: DatabaseController):
        self.db: DatabaseController = db

    async def create(self, *, user: BaseUser, current_user: str):

        # Create db record
        record = await self.db.fetchrow(
            QUERIES["CREATE_USER"],
            uuid4().hex,
            user.email,
            user.first_name,
            user.last_name,
            user.disabled,
            current_user,
            current_user,
            user.title,
            user.team,
            user.phone,
            user.location,
            user.timezone,
            user.bio,
            user.picture
        )

        # TODO Create history entry

        return User(**record)

    async def get(self, *, id: int, organization_id: Optional[str] = None):
        # Get item record here
        if organization_id:
            record = await self.db.fetchrow(QUERIES["GET_ORGANIZATION_USER"], organization_id, id)
        else:
            record = await self.db.fetchrow(QUERIES["GET_USER"], id)

        if not record:
            raise ObjectNotFoundException(organization_id=organization_id, object_id=id)

        # TODO Create history

        return User(**record)

    async def get_all(
        self,
        *,
        organization_id: Optional[str] = None,
        sort: Optional[UserSortableField] = None,
        limit: Optional[int] = 1000,
        cursor: Optional[str] = None,
    ) -> Tuple[List[User], str]:
        offset = 0
        if cursor:
            sort, offset = parse_cursor(cursor)

        if not sort:
            sort = UserSortableField.EMAIL

        # Get item record here
        if organization_id:
            records = await self.db.fetch(QUERIES["GET_ORGANIZATION_USERS"], organization_id, sort, limit, offset)
        else:
            records = await self.db.fetch(QUERIES["GET_USERS"], sort, limit, offset)

        cursor = None
        if len(records) == limit:
            cursor = generate_cursor(sort, offset + limit)

        # TODO Create history

        return [User(**record) for record in records], cursor

    async def update(
        self,
        *,
        id: str,
        updated_user: User,
        current_user: str,
    ):
        old_user = await self.get(id=id)

        new_item_json = updated_user.model_dump(exclude_unset=True)
        old_item_json = old_user.model_dump()

        old_item_json.update(**new_item_json)

        record = await self.db.fetchrow(
            QUERIES["UPDATE_USER"],
            id,
            old_item_json["first_name"],
            old_item_json["last_name"],
            old_item_json["disabled"],
            old_item_json["created_by_id"],
            current_user,
            old_item_json["deleted_at"],
            old_item_json["deleted_by_id"],
            old_item_json["title"],
            old_item_json["team"],
            old_item_json["phone"],
            old_item_json["location"],
            old_item_json["timezone"],
            old_item_json["bio"],
            old_item_json["picture"]
        )

        # TODO Create history entry

        return User(**record)

    async def delete(self, *, id: int, current_user: str, organization_id: Optional[str] = None) -> bool:
        if organization_id:
            # TODO Need to delete user permissions, maybe delete full user if no permissions are left? Later problem
            pass
        else:
            result = await self.db.execute(
                QUERIES["DELETE_USER"],
                id,
                current_user,
            )

        # TODO Create history entry

        if result != "UPDATE 1":
            raise ObjectNotFoundException(organization_id=organization_id, object_id=id)

        return True
