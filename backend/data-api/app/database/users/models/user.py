import json
from enum import StrEnum
from typing import Optional

from pydantic import BaseModel, Field

from app.database.common.models import Model, MAX_IMAGE_SIZE
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
    #TODO:
    #preferences: (list of booleans indicating which options are enabled/disabled?)
    #passwordManagement: (is this 2FA settings/SSO?)
    #integrationPreferences: (how does this differ from preferences)
    #skills: (list of strings?)


class User(Model, BaseUser):
    permissions: Optional[UserPermission] = None

    def __init__(self, **data):
        if isinstance(data.get("permissions"), str):
            data["permissions"] = json.loads(data.get("permissions"))

        super().__init__(**data)
