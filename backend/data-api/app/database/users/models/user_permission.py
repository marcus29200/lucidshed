from enum import StrEnum
from typing import Optional

from pydantic import BaseModel

from app.database.common.models import Model


class UserPermissionType(StrEnum):
    ADMIN: str = "admin"
    MEMBER: str = "member"
    GUEST: str = "guest"


class BaseUserPermission(BaseModel):
    organization_id: Optional[str] = None
    user_id: Optional[str] = None
    disabled: Optional[bool] = False
    engineering_permission_level: Optional[UserPermissionType] = None
    support_permission_level: Optional[UserPermissionType] = None


class UserPermission(Model, BaseUserPermission):
    organization_id: str
