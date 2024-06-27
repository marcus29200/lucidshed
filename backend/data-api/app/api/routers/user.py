from typing import List, Optional

from fastapi import APIRouter, Request
from pydantic import BaseModel

from app.database.users.models.user import BaseUser, User, UserSortableField

user_router = APIRouter

router = APIRouter(
    prefix="",
    tags=["user"],
    dependencies=[],  # Depends(check_auth)]
)


class PagedResponse(BaseModel):
    items: List[User]
    cursor: Optional[str] = None


@router.post("", status_code=201, response_model=User)
async def add_user(request: Request, body: BaseUser) -> User:
    return await request.app.user_controller.create(user=body, current_user="test@test.com")


@router.get("/{id}", status_code=200, response_model=User)
async def get_user(request: Request, id: str) -> User:
    return await request.app.user_controller.get(id=id)


@router.get("", status_code=200, response_model=PagedResponse)
async def get_users(
    request: Request,
    sort: Optional[UserSortableField] = UserSortableField.EMAIL,
    limit: Optional[int] = 1000,
    cursor: Optional[str] = None,
) -> PagedResponse:
    users, cursor = await request.app.user_controller.get_all(sort=sort, limit=limit, cursor=cursor)

    return PagedResponse(items=users, cursor=cursor)


@router.patch("/{id}", status_code=200, response_model=User)
async def update_user(request: Request, id: str, body: BaseUser) -> User:
    return await request.app.user_controller.update(id=id, updated_user=body, current_user="test@test.com")


@router.delete("/{id}", status_code=200)
async def delete_user(request: Request, id: str):
    return await request.app.user_controller.delete(id=id, current_user="test@test.com")
