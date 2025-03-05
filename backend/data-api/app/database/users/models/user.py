import json
from enum import StrEnum
from typing import Any, Dict, Optional, Set

from pydantic import EmailStr, Field

from app.database.common.models import MAX_IMAGE_SIZE, BaseModel, Model
from app.database.users.models.user_permission import BaseUserPermission, UserPermission


class UserSortableField(StrEnum):
    ID = "id"
    CREATED_AT = "created_at"
    EMAIL = "email"
    FIRST_NAME = "first_name"
    LAST_NAME = "last_name"


class BaseUser(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    disabled: Optional[bool] = False
    permissions: Optional[BaseUserPermission] = None
    title: Optional[str] = None
    team: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    timezone: Optional[str] = None
    bio: Optional[str] = None
    picture: Optional[bytes] = Field(None, max_length=MAX_IMAGE_SIZE)
    settings: Optional[Dict[str, Any]] = {}
    password: Optional[str] = Field(None, exclude=True)
    super_admin: bool = False
    reset_code: Optional[str] = Field(None, exclude=True)
    created_org_limit: int = Field(1, exclude=True)
    created_org_count: int = Field(0, exclude=True)
    permissions: Dict[str, UserPermission] = {}  # type: ignore
    # TODO:
    # passwordManagement: (is this 2FA settings/SSO?)
    # skills: (list of strings?)

    def __init__(self, **data):
        if isinstance(data.get("permissions"), str):
            data["permissions"] = json.loads(data.get("permissions"))
        elif not data.get("permissions"):
            data["permissions"] = {}

        if isinstance(data.get("settings"), str):
            data["settings"] = json.loads(data.get("settings"))

        super().__init__(**data)

    @property
    def verified(self) -> bool:
        # Other things might be able to determine if a user is verified or not
        return self.password_set

    @property
    def password_set(self) -> bool:
        return self.password is not None and len(self.password) > 3


class User(Model, BaseUser):
    email: EmailStr


class SlimUser(Model):
    id: str
    email: str
    first_name: str
    last_name: str
    picture: Optional[bytes] = Field(None, max_length=MAX_IMAGE_SIZE)
    title: Optional[str] = None
