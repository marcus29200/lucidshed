from datetime import datetime
from typing import Any, Dict, List

from jwt import decode, encode
from jwt.exceptions import ExpiredSignatureError
from fastapi import HTTPException, Request
from fastapi.security import SecurityScopes
from passlib.exc import InvalidTokenError
from pydantic import ValidationError

from app.api.models.users import TokenData
from app.database.users.models.user_permission import UserPermissionType
from app.exceptions.common import ObjectNotFoundException
from app.api.settings import ACCESS_TOKEN_EXPIRE_MINUTES, ALGORITHM, SECRET_KEY

from app.database.users.models.user import User


async def authenticate_user(request, email: str, password: str) -> User:
    user = await request.app.user_controller.get(id=None, email=email)

    if not user.password_matches(password):
        return False

    return user


def create_access_token(data: Dict[str, Any]):
    to_encode = data.copy()

    to_encode.update({"exp": datetime.now().timestamp() + ACCESS_TOKEN_EXPIRE_MINUTES})
    encoded_jwt = encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt


async def get_current_user(request: Request, security_scopes: SecurityScopes):
    credentials_exception = HTTPException(status_code=401, detail="Invalid Token")

    token = request.headers.get("authorization")
    if not token or not isinstance(token, str):
        raise credentials_exception

    try:
        payload = decode(token.split("Bearer ")[-1], SECRET_KEY, algorithms=[ALGORITHM])

        username: str = payload.get("subject")
        if username is None:
            raise credentials_exception

        token_scopes = payload.get("scopes", [])
        token_data = TokenData(scopes=token_scopes, username=username)
    except (InvalidTokenError, ValidationError, ExpiredSignatureError):
        raise credentials_exception

    if "organization" in security_scopes.scopes:
        try:
            # Make sure user still has access to org
            org_id = request.path_params.get("organization_id")
            if not org_id:
                raise credentials_exception

            user: User = await request.app.user_controller.get(
                id=None, email=token_data.username, organization_id=org_id
            )
        except ObjectNotFoundException:
            raise credentials_exception

        # Check product area permissions
        if "engineering" in security_scopes.scopes:
            if not has_permission_for_endpoint(user.permissions.engineering_permission_level, security_scopes.scopes):
                raise HTTPException(status_code=401, detail="Not enough permissions")
    else:
        try:
            user: User = await request.app.user_controller.get(id=None, email=token_data.username)
        except ObjectNotFoundException:
            raise credentials_exception

    request.state.user = user
    return user


def has_permission_for_endpoint(permission_level: UserPermissionType, scopes: List[str]) -> bool:
    if permission_level == UserPermissionType.ADMIN:
        return True
    elif "member" in scopes and permission_level == UserPermissionType.MEMBER:
        return True
    elif "guest" in scopes and (
        permission_level == UserPermissionType.MEMBER or permission_level == UserPermissionType.GUEST
    ):
        return True

    return False
