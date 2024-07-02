import logging

from fastapi import APIRouter, HTTPException, Request

from app.api.dependencies.authorization import authenticate_user, create_access_token
from app.api.models.users import LoginRequest, Token
from app.database.users.models.user import User
from app.exceptions.common import ObjectNotFoundException

logger = logging.getLogger(__name__)


router = APIRouter(tags=["auth"], dependencies=[], responses={404: {"description": "Not found"}})


@router.post("/login", response_model=Token)
async def login_for_access_token(request: Request, body: LoginRequest) -> Token:
    try:
        user: User = await authenticate_user(request, body.username, body.password)
    except ObjectNotFoundException:
        logger.warning(f"{body.username} not found")
        user = None

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"subject": user.email})

    return Token(access_token=access_token, token_type="bearer")
