import re
from typing import List

from pydantic import BaseModel, field_validator

from app.database.users.models.user import User


class LoginRequest(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str
    scopes: List[str] = []


class ResetPasswordRequest(BaseModel):
    email: str


class ResetPassword(BaseModel):
    reset_code: str
    password: str

    @field_validator("password")
    @classmethod
    def password_validator(cls, v):
        min_length = 8
        required_patterns = [
            r"[A-Z]",  # At least one uppercase letter
            r"[a-z]",  # At least one lowercase letter
            r"\d",  # At least one digit
            r"[\W_]",  # At least one special character
        ]

        # Check length
        if len(v) < min_length:
            raise ValueError(f"Password should be at least {min_length} characters long.")

        # Check for required patterns
        for pattern in required_patterns:
            if not re.search(pattern, v):
                raise ValueError(
                    "Password should contain at least one uppercase letter, "
                    + "one lowercase letter, one digit, and one special character."
                )

        return v


class LoginResponse(BaseModel):
    user: User
    token: Token
