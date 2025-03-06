import json
from typing import Any, Dict, Optional

from app.database.common.models import Model, BaseModel


class BaseOrganization(BaseModel):
    title: Optional[str] = None
    disabled: Optional[bool] = False
    settings: Optional[Dict[str, Any]] = {}


class Organization(Model, BaseOrganization):
    def __init__(self, **data):
        if isinstance(data.get("settings"), str):
            data["settings"] = json.loads(data.get("settings"))

        super().__init__(**data)
