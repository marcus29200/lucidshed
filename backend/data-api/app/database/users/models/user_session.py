from datetime import UTC, datetime
from typing import Optional

from pydantic import BaseModel


class BaseUserSession(BaseModel):
    user_id: str
    token: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class UserSession(BaseUserSession):
    id: str
    created_at: datetime
    expires_at: datetime

    @property
    def expired(self):
        return datetime.now(UTC) >= self.expires_at
