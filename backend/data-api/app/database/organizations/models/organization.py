from typing import Optional

from pydantic import BaseModel

from app.database.common.models import Model


class BaseOrganization(BaseModel):
    id: Optional[str] = None
    title: Optional[str] = None
    disabled: Optional[bool] = False


class Organization(Model, BaseOrganization):
    pass
