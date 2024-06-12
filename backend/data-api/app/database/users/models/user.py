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


class User(Model, BaseUser):
    permissions: Optional[UserPermission] = None
