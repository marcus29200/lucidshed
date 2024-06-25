import json
from enum import StrEnum
from typing import Optional

from pydantic import BaseModel

from app.database.common.models import Model
from app.database.users.models.user_permission import BaseUserPermission, UserPermission


class UserSortableField(StrEnum):
    ID: str = "id"
    CREATED_AT: str = "created_at"
    EMAIL: str = "email"
    FIRST_NAME: str = "first_name"
    LAST_NAME: str = "last_name"


class BaseUser(BaseModel):
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    disabled: Optional[bool] = False
    permissions: Optional[BaseUserPermission] = None


class User(Model, BaseUser):
    permissions: Optional[UserPermission] = None

    def __init__(self, **data):
        if isinstance(data.get("permissions"), str):
            data["permissions"] = json.loads(data.get("permissions"))

        super().__init__(**data)
