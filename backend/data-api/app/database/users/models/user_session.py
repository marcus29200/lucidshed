from datetime import UTC, datetime, timedelta
from typing import Optional

from app.database.common.models import BaseModel, Model
from app.settings import settings


class BaseUserSession(BaseModel):
    user_id: str
    token: str
    expires_at: Optional[datetime] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

    def __init__(self, **data):
        if not data.get("expires_at"):
            data["expires_at"] = datetime.now(UTC) + timedelta(minutes=settings.auth_token_expire_seconds)

        return super().__init__(**data)


class UserSession(Model, BaseUserSession):
    expires_at: datetime

    @property
    def expired(self):
        return datetime.now(UTC) >= self.expires_at
