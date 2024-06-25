import json
from typing import Optional

from pydantic import BaseModel

from app.database.common.models import Model
from app.database.users.models.user_permission import BaseUserPermission, UserPermission


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
    picture: Optional[bytes] = None
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
