import json
from typing import List, Optional, Tuple
from uuid import uuid4

from app.api.settings import user_db
from app.api.utils import generate_cursor, parse_cursor
from app.database.common.queries import QUERIES
from app.database.users.models.user import BaseUser, User, UserSortableField, SlimUser
from app.database.users.utils import get_hashed_password
from app.exceptions.common import ObjectNotFoundException


class UserController:
    async def create(self, *, user: BaseUser, current_user: str):
        if not user.email:
            raise ValueError("User email is required")

        # Create db record
        record = await user_db.get().fetchrow(
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
            user.picture,
            uuid4().hex,
            0,  # Org count
            1,  # Org limit
            json.dumps(user.settings),
        )

        # TODO Create history entry

        return User(**record)

    async def get(self, *, id: Optional[str], organization_id: Optional[str] = None, email: Optional[str] = None):
        identifier = email or id or "none"

        # Get item record here
        if organization_id:
            record = await user_db.get().fetchrow(QUERIES["GET_ORGANIZATION_USER"], organization_id, identifier)
        else:
            record = await user_db.get().fetchrow(QUERIES["GET_USER"], identifier)

        if not record:
            raise ObjectNotFoundException(organization_id=organization_id, object_id=id)

        # TODO Create history

        return User(**record)

    # TODO Need to cache this
    async def get_slim_user(self, *, id: str) -> SlimUser:
        record = await user_db.get().fetchrow(QUERIES["GET_USER"], id)

        if not record:
            raise ObjectNotFoundException(object_id=id)

        return SlimUser(**record)

    async def get_all(
        self,
        *,
        organization_id: Optional[str] = None,
        sort: Optional[UserSortableField] = UserSortableField.EMAIL,
        limit: Optional[int] = 1000,
        cursor: Optional[str] = None,
    ) -> Tuple[List[User], str | None]:
        offset = 0
        if cursor:
            sort, offset, _ = parse_cursor(cursor)

        if not sort:
            sort = UserSortableField.EMAIL

        # Get item record here
        if organization_id:
            records = await user_db.get().fetch(QUERIES["GET_ORGANIZATION_USERS"], organization_id, sort, limit, offset)
        else:
            records = await user_db.get().fetch(QUERIES["GET_USERS"], sort, limit, offset)

        cursor = None
        if len(records) == limit:
            cursor = generate_cursor(sort, offset + limit)

        # TODO Create history

        return [User(**record) for record in records], cursor

    async def update(
        self,
        *,
        id: str,
        updated_user: BaseUser,
        current_user: str,
        email: Optional[str] = None,
        password: Optional[str] = None,
        reset_code: Optional[str] = None,
        super_admin: Optional[bool] = None,
    ):
        old_user = await self.get(id=id, email=email)

        new_item_json = updated_user.model_dump(exclude_unset=True)
        old_item_json = old_user.model_dump()

        old_item_json.update(**new_item_json)

        record = await user_db.get().fetchrow(
            QUERIES["UPDATE_USER"],
            old_user.id,
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
            old_item_json["picture"],
            super_admin if super_admin is not None else old_user.super_admin,
            get_hashed_password(password) if password else old_user.password,
            reset_code if reset_code else old_user.reset_code,
            json.dumps(old_item_json["settings"]),
        )

        # TODO Create history entry

        return User(**record)

    async def set_user_password(self, *, reset_code: str, new_password: str) -> User:
        record = await user_db.get().fetchrow(
            QUERIES["SET_USER_PASSWORD"],
            reset_code,
            get_hashed_password(new_password),
        )

        if not record:
            raise ObjectNotFoundException(object_id=f"Reset Code: {reset_code}")

        # TODO Create history entry

        return User(**record)

    async def delete(self, *, id: int, current_user: str, organization_id: Optional[str] = None) -> bool:
        if organization_id:
            # TODO Need to delete user permissions, maybe delete full user if no permissions are left? Later problem
            pass
        else:
            result = await user_db.get().execute(
                QUERIES["DELETE_USER"],
                id,
                current_user,
            )

        # TODO Create history entry

        if result != "UPDATE 1":
            raise ObjectNotFoundException(organization_id=organization_id, object_id=id)

        return True
