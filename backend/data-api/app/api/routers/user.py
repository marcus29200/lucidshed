from fastapi import APIRouter, Request

from app.database.users.models.user import BaseUser, User

user_router = APIRouter

router = APIRouter(
    prefix="",
    tags=["user"],
    dependencies=[],  # Depends(check_auth)]
)


@router.post("", status_code=201, response_model=User)
async def add_user(request: Request, body: BaseUser) -> User:
    return await request.app.user_controller.create(user=body, current_user="test@test.com")


@router.get("/{id}", status_code=200, response_model=User)
async def get_user(request: Request, id: str) -> User:
    return await request.app.user_controller.get(id=id)


@router.patch("/{id}", status_code=200, response_model=User)
async def update_user(request: Request, id: str, body: BaseUser) -> User:
    return await request.app.user_controller.update(id=id, updated_user=body, current_user="test@test.com")


@router.delete("/{id}", status_code=200)
async def delete_user(request: Request, id: str):
    return await request.app.user_controller.delete(id=id, current_user="test@test.com")
