import logging
from os.path import join
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Request, Security
from fastapi.responses import JSONResponse

from app.api.dependencies.authorization import authenticate_user, create_access_token, get_current_user
from app.api.dependencies.database import user_db_conn
from app.api.models.users import LoginRequest, LoginResponse, ResetPassword, ResetPasswordRequest, Token
from app.api.settings import settings
from app.api.utils import send_mail
from app.database.users.models.user import BaseUser, User
from app.database.users.models.user_session import BaseUserSession
from app.exceptions.common import ObjectNotFoundException

user_router = APIRouter

logger = logging.getLogger(__name__)


router = APIRouter(prefix="", tags=["user"], dependencies=[Depends(user_db_conn)])


class RegisterUserPayload(BaseUser):
    email: str

    def __init__(self, **data):
        if not data.get("email"):
            raise ValueError("Email is required")

        super().__init__(**data)


@router.post("/register", status_code=200)
async def register(request: Request, body: RegisterUserPayload) -> JSONResponse:
    user: User = await request.app.user_controller.create(user=body, current_user="system")

    # Send email with verification code
    if settings.testing:
        return JSONResponse({"id": user.id, "reset_code": user.reset_code})

    if not user.reset_code:
        raise HTTPException(status_code=412, detail="Unable to create reset code")

    # TODO Add tests
    send_mail(
        user.email,
        "Verify your email",
        f"Here is your verification link: {join(settings.frontend_url, 'reset-password?code=', user.reset_code)}",
    )

    return JSONResponse({"detail": "Reset code emailed to registered email"})


@router.post("/reset-password", status_code=200)
async def reset(request: Request, body: ResetPassword) -> JSONResponse:
    try:
        user = await request.app.user_controller.set_user_password(
            reset_code=body.reset_code, new_password=body.password
        )
    except Exception:
        logger.exception("Unable to verify reset code")

        raise HTTPException(status_code=401, detail="Invalid reset code")

    send_mail(user.email, "Your password has been reset", "Your password has been reset")

    return JSONResponse({"detail": "Password reset, proceed to login"})


@router.post("/reset-request", status_code=200)
async def reset_request(request: Request, body: ResetPasswordRequest) -> JSONResponse:
    user = await request.app.user_controller.update(
        id=None, updated_user=BaseUser(), email=body.email, reset_code=uuid4().hex, current_user="system"
    )

    if not user.reset_code:
        raise HTTPException(status_code=412, detail="Unable to create reset code")

    send_mail(
        user.email,
        "Reset your password",
        f"Here is your reset link: {join(settings.frontend_url, 'reset-password?code=', user.reset_code)}",
    )

    if settings.testing:
        return JSONResponse({"id": user.id, "reset_code": user.reset_code})

    return JSONResponse({"detail": "Reset code emailed to registered email"})


@router.post("/login", response_model=LoginResponse)
async def login(request: Request, body: LoginRequest) -> LoginResponse:
    try:
        user: User = await authenticate_user(request, body.username, body.password)
    except ObjectNotFoundException:
        logger.warning(f"User [{body.username}] not found")

        raise HTTPException(status_code=401, detail="Incorrect username or password")

    if not user.verified:
        raise HTTPException(status_code=401, detail="User is not verified")
    elif user.disabled:
        raise HTTPException(status_code=401, detail="User is not disabled")

    access_token = create_access_token(data={"subject": user.email})

    await request.app.user_session_controller.create(user_session=BaseUserSession(user_id=user.id, token=access_token))

    return LoginResponse(user=user, token=Token(access_token=access_token, token_type="bearer"))


@router.post("/logout", response_model=None, dependencies=[Security(get_current_user, scopes=["authenticated"])])
async def logout(request: Request) -> None:
    token = None
    try:
        token = request.headers.get("authorization", "").split("Bearer ")[-1]
        await request.app.user_session_controller.delete(identifier=token)
    except ObjectNotFoundException:
        logger.info(f"Could not invalidate not found user token {token[:5] if token else ''}")

        return


@router.get(
    "/me", status_code=200, response_model=User, dependencies=[Security(get_current_user, scopes=["current_user"])]
)
async def me(request: Request) -> User:
    return request.state.user


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
