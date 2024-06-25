from typing import List, Optional

from fastapi import APIRouter, Request
from starlette.responses import JSONResponse

from app.database.organizations.models.organization import BaseOrganization, Organization
from app.database.users.models.user import BaseUser, User, UserSortableField
from app.database.users.models.user_permission import BaseUserPermission, UserPermission

engineering_item_router = APIRouter

router = APIRouter(
    prefix="",
    tags=["organization"],
    dependencies=[],  # Depends(check_auth)]
)


@router.post("/", status_code=201, response_model=Organization)
async def add_organization(request: Request, body: BaseOrganization) -> Organization:
    return await request.app.organization_controller.create(organization=body, current_user="test@test.com")


@router.get("/{id}", status_code=200, response_model=Organization)
async def get_organization(request: Request, id: str) -> Organization:
    return await request.app.organization_controller.get(id=id)


@router.patch("/{id}", status_code=200, response_model=Organization)
async def update_engineering_item(request: Request, id: str, body: BaseOrganization) -> Organization:
    return await request.app.organization_controller.update(
        id=id, updated_organization=body, current_user="test@onna.com"
    )


@router.delete("/{id}", status_code=200)
async def delete_engineering_item(request: Request, id: str):
    return await request.app.organization_controller.delete(id=id, current_user="test@test.com")


@router.post("/{id}/users", status_code=200, response_model=User)
async def add_organization_user(request: Request, id: str, body: BaseUser) -> User:
    if not body.permissions:
        # TODO Raise a useful exception here if no permissions were defined
        raise Exception()

    user = await request.app.user_controller.create(user=body, current_user="test@test.com")

    body.permissions.user_id = user.id
    user_permission = await request.app.user_permission_controller.create(
        organization_id=id, user_permission=body.permissions, current_user="test@test.com"
    )

    user.permissions = user_permission

    return user


@router.get("/{id}/users/{user_id}", status_code=200, response_model=User)
async def get_organization_user(request: Request, id: str, user_id: str) -> User:
    user = await request.app.user_controller.get(id=user_id, organization_id=id)

    return user


@router.get("/{id}/users", status_code=200, response_model=List[User])
async def get_all_organization_user(
    request: Request,
    id: str,
    sort: Optional[UserSortableField] = UserSortableField.EMAIL,
    limit: Optional[int] = 1000,
    offset: Optional[int] = 0,
) -> List[User]:
    users = await request.app.user_controller.get_all(organization_id=id, sort=sort, limit=limit, offset=offset)

    return users


@router.patch("/{id}/users/{user_id}/permissions", status_code=200, response_model=UserPermission)
async def update_organization_user_permissions(
    request: Request, id: str, user_id: str, body: BaseUserPermission
) -> User:
    return await request.app.user_permission_controller.update(
        id=user_id, organization_id=id, updated_user_permission=body, current_user="test@test.com"
    )


@router.delete("/{id}/users/{user_id}", status_code=200)
async def delete_organization_user(request: Request, id: str, user_id: str) -> None:
    result = await request.app.user_permission_controller.delete(
        id=user_id, organization_id=id, current_user="test@test.com"
    )

    if not result:
        return JSONResponse("Unable to delete user", status_code=412)
