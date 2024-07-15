import logging
from typing import Any, Dict
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Request, Security
from fastapi.responses import JSONResponse

from app.api.dependencies.authorization import authenticate_user, create_access_token, get_current_user
from app.api.models.users import LoginRequest, LoginResponse, ResetPassword, ResetPasswordRequest, Token
from app.database.users.models.user import BaseUser, User
from app.exceptions.common import ObjectNotFoundException

user_router = APIRouter

logger = logging.getLogger(__name__)


router = APIRouter(prefix="", tags=["user"])


@router.post("/register", status_code=200)
async def register(request: Request, body: BaseUser) -> Dict[str, Any]:
    user: User = await request.app.user_controller.create(user=body, current_user="system")

    # Send email with verification code
    if request.app.settings.testing:
        logger.warning(f"Reset code for user {user.email} {user.reset_code}")

        return JSONResponse({"id": user.id, "reset_code": user.reset_code})

    return JSONResponse({"detail": "Reset code emailed to registered email"})


@router.post("/reset-password", status_code=200)
async def reset(request: Request, body: ResetPassword):
    try:
        await request.app.user_controller.set_user_password(reset_code=body.reset_code, new_password=body.password)
    except Exception:
        logger.exception("Unable to verify reset code")

        raise HTTPException(status_code=401, detail="Invalid reset code")

    return JSONResponse({"detail": "Password reset, proceed to login"})


@router.post("/reset-request", status_code=200)
async def reset_request(request: Request, body: ResetPasswordRequest):
    user = await request.app.user_controller.update(
        id=None, updated_user=BaseUser(), email=body.email, reset_code=uuid4().hex, current_user="system"
    )

    # Send email with verification code
    if request.app.settings.testing:
        logger.warning(f"Reset code for user {user.email} {user.reset_code}")

        return JSONResponse({"id": user.id, "reset_code": user.reset_code})

    return JSONResponse({"detail": "Reset code emailed to registered email"})


@router.post("/login", response_model=LoginResponse)
async def login(request: Request, body: LoginRequest) -> LoginResponse:
    try:
        user: User = await authenticate_user(request, body.username, body.password)
    except ObjectNotFoundException:
        logger.warning(f"{body.username} not found")
        user = None

    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    elif not user.verified:
        raise HTTPException(status_code=401, detail="User is not verified")
    elif user.disabled:
        raise HTTPException(status_code=401, detail="User is not disabled")

    access_token = create_access_token(data={"subject": user.email})

    return LoginResponse(user=user, token=Token(access_token=access_token, token_type="bearer"))


@router.get(
    "/{id}", status_code=200, response_model=User, dependencies=[Security(get_current_user, scopes=["current_user"])]
)
async def get_user(request: Request, id: str) -> User:
    return await request.app.user_controller.get(id=id)


@router.patch(
    "/{id}", status_code=200, response_model=User, dependencies=[Security(get_current_user, scopes=["current_user"])]
)
async def update_user(request: Request, id: str, body: BaseUser) -> User:
    return await request.app.user_controller.update(id=id, updated_user=body, current_user=request.state.user.id)


@router.delete("/{id}", status_code=200, dependencies=[Security(get_current_user, scopes=["current_user"])])
async def delete_user(request: Request, id: str):
    return await request.app.user_controller.delete(id=id, current_user=request.state.user.id)
