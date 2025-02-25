from enum import StrEnum
from typing import Optional

from pydantic import BaseModel

from app.database.common.models import Model


class UserRoleType(StrEnum):
    ADMIN = "admin"
    MEMBER = "member"
    GUEST = "guest"


class BaseUserPermission(BaseModel):
    organization_id: Optional[str] = None
    user_id: Optional[str] = None
    disabled: Optional[bool] = False
    role: Optional[UserRoleType] = None


class UserPermission(Model, BaseUserPermission):
    organization_id: str
    user_id: str
    disabled: bool
    role: UserRoleType
