import json
from enum import StrEnum
from typing import Dict, Optional

from pydantic import BaseModel, Field

from app.database.common.models import MAX_IMAGE_SIZE, Model
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
    title: Optional[str] = None
    team: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    timezone: Optional[str] = None
    bio: Optional[str] = None
    picture: Optional[bytes] = Field(None, max_length=MAX_IMAGE_SIZE)
    # TODO:
    # preferences: (list of booleans indicating which options are enabled/disabled?)
    # passwordManagement: (is this 2FA settings/SSO?)
    # integrationPreferences: (how does this differ from preferences)
    # skills: (list of strings?)


class User(Model, BaseUser):
    permissions: Dict[str, UserPermission] = {}  # type: ignore
    password: Optional[str] = Field(None, exclude=True)
    super_admin: bool = False
    reset_code: Optional[str] = Field(None, exclude=True)
    created_org_limit: int = Field(1, exclude=True)
    created_org_count: int = Field(0, exclude=True)

    def __init__(self, **data):
        if isinstance(data.get("permissions"), str):
            data["permissions"] = json.loads(data.get("permissions"))
        elif not data.get("permissions"):
            data["permissions"] = {}

        super().__init__(**data)

    @property
    def verified(self):
        # Other things might be able to determine if a user is verified or not
        return self.password_set

    @property
    def password_set(self):
        return self.password and len(self.password) > 3
