from datetime import datetime

from pydantic import BaseModel


class BaseUserSession(BaseModel):
    user_id: str
    token: str


class UserSession(BaseModel):
    id: str
    created_at: datetime
    expires_at: datetime

    @property
    def expired(self):
        return datetime.now() >= self.expires_at
