import logging
from datetime import UTC, datetime
from typing import Any, Dict

from fastapi import HTTPException, Request
from fastapi.security import SecurityScopes
from jwt import decode, encode

from app.api.models.users import TokenData
from app.api.settings import ACCESS_TOKEN_EXPIRE_MINUTES, ALGORITHM, SECRET_KEY
from app.database.users.models.user import User
from app.database.users.models.user_permission import UserRoleType
from app.database.users.models.user_session import UserSession
from app.database.users.utils import password_matches
from app.exceptions.common import ObjectNotFoundException

logger = logging.getLogger(__name__)


PERMISSION_LEVELS = {
    UserRoleType.ADMIN: 3,
    UserRoleType.MEMBER: 2,
    UserRoleType.GUEST: 1,
}


async def authenticate_user(request, email: str, password: str) -> User:
    user = await request.app.user_controller.get(id=None, email=email)

    if not user or not password_matches(user.password, password):
        return None

    return user


def create_access_token(data: Dict[str, Any]):
    to_encode = data.copy()

    to_encode.update({"exp": datetime.now(UTC).timestamp() + ACCESS_TOKEN_EXPIRE_MINUTES})
    encoded_jwt = encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt


async def get_current_user(request: Request, security_scopes: SecurityScopes):
    credentials_exception = HTTPException(status_code=401, detail="Invalid Token")

    token = request.headers.get("authorization")
    if not token or not isinstance(token, str):
        raise HTTPException(status_code=401, detail="Missing Token")

    try:
        token = token.split("Bearer ")[-1]
        payload = decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        username: str = payload.get("subject")
        if username is None:
            raise credentials_exception

        token_scopes = payload.get("scopes", [])
        token_data = TokenData(scopes=token_scopes, username=username)

        session: UserSession = await request.app.user_session_controller.get(token=token)
        if session.expired:
            raise credentials_exception
    except Exception:
        logger.exception("Unable to verify access token")

        raise credentials_exception

    try:
        user: User = await request.app.user_controller.get(
            id=None, email=token_data.username, organization_id=request.path_params.get("organization_id")
        )
    except ObjectNotFoundException:
        raise credentials_exception

    # If the user is a super admin or we just care if the user is authenticated
    if user.super_admin or security_scopes.scopes[0] == "authenticated":
        request.state.user = user
        return user

    if security_scopes.scopes[0] == "current_user" and "/users" in request.url.path:
        if "/users/me" in request.url.path:
            request.state.user = user
            return user
        elif user.id == request.path_params["id"]:
            request.state.user = user
            return user
        else:
            raise credentials_exception

    org_id = request.path_params.get("organization_id")
    if org_id:
        permission = user.permissions.get(org_id)
        if permission and PERMISSION_LEVELS.get(permission.role, -1) >= PERMISSION_LEVELS.get(
            security_scopes.scopes[0], 100
        ):
            request.state.user = user
            return user

        raise credentials_exception

    request.state.user = user
    return user
