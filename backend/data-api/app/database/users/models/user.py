from typing import Optional
from pydantic import BaseModel
from app.database.common.models import Model


class BaseUser(BaseModel):
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    disabled: Optional[bool] = False


class User(Model, BaseUser):
    pass
