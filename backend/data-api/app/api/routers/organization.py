from typing import List, Optional

from asyncpg import InvalidCatalogNameError, create_pool
from fastapi import APIRouter, Depends, Request, Security
from pydantic import BaseModel
from starlette.responses import JSONResponse

from app.api.dependencies.authorization import get_current_user
from app.api.dependencies.database import data_db_conn
from app.api.settings import data_db
from app.database.common.queries import INIT_STATEMENTS
from app.database.organizations.models.organization import BaseOrganization, Organization
from app.database.users.models.user import BaseUser, User, UserSortableField
from app.database.users.models.user_permission import BaseUserPermission, UserPermission, UserRoleType
from app.database.utils import create_database, init_database_tables

engineering_item_router = APIRouter

router = APIRouter(prefix="", tags=["organization"])


class PagedResponse(BaseModel):
    items: List[User]
    cursor: Optional[str] = None


@router.post(
    "/",
    status_code=201,
    response_model=Organization,
    dependencies=[Security(get_current_user, scopes=["authenticated"])],
)
async def add_organization(
    request: Request,
    body: BaseOrganization,
) -> Organization:
    # await request.app.db.init_database_tables()

    async with create_pool(
        host="localhost", port="5432", user="postgres", password="password"
    ) as pool, pool.acquire() as conn:
        try:
            # Create database
            await create_database(conn, body.id)
        except InvalidCatalogNameError:
            raise Exception()  # TODO Fix

    async with create_pool(
        host="localhost", port="5432", user="postgres", password="password", database=body.id
    ) as pool, pool.acquire() as conn:
        data_db.set(conn)

        await init_database_tables(conn, INIT_STATEMENTS)

        # Initialize database tables
        async with conn.transaction():

            org = await request.app.organization_controller.create(
                organization=body, current_user=request.state.user.id
            )

            # Grant current user access to org
            await request.app.user_permission_controller.create(
                organization_id=org.id,
                user_permission=BaseUserPermission(
                    organization_id=org.id, user_id=request.state.user.id, role=UserRoleType.ADMIN
                ),
                current_user=request.state.user.id,
            )

    return org


@router.get(
    "/{organization_id}",
    status_code=200,
    response_model=Organization,
    dependencies=[Security(get_current_user, scopes=["member"]), Depends(data_db_conn)],
)
async def get_organization(request: Request, organization_id: str) -> Organization:
    return await request.app.organization_controller.get(id=organization_id)


@router.patch(
    "/{organization_id}",
    status_code=200,
    response_model=Organization,
    dependencies=[Security(get_current_user, scopes=["admin"]), Depends(data_db_conn)],
)
async def update_organization(request: Request, organization_id: str, body: BaseOrganization) -> Organization:
    return await request.app.organization_controller.update(
        id=organization_id, updated_organization=body, current_user=request.state.user.id
    )


@router.delete(
    "/{organization_id}",
    status_code=200,
    dependencies=[Security(get_current_user, scopes=["admin"]), Depends(data_db_conn)],
)
async def delete_organization(request: Request, organization_id: str):
    return await request.app.organization_controller.delete(id=organization_id, current_user=request.state.user.id)


@router.post(
    "/{organization_id}/users",
    status_code=200,
    response_model=User,
    dependencies=[Security(get_current_user, scopes=["admin"])],
)
async def add_organization_user(request: Request, organization_id: str, body: BaseUser) -> User:
    if not body.permissions:
        # TODO Raise a useful exception here if no permissions were defined
        raise Exception()

    user = await request.app.user_controller.create(user=body, current_user=request.state.user.id)

    body.permissions.user_id = user.id
    user_permission = await request.app.user_permission_controller.create(
        organization_id=organization_id, user_permission=body.permissions, current_user=request.state.user.id
    )

    user.permissions = user_permission

    return user


@router.get(
    "/{organization_id}/users/{user_id}",
    status_code=200,
    response_model=User,
    dependencies=[Security(get_current_user, scopes=["admin"])],
)
async def get_organization_user(request: Request, organization_id: str, user_id: str) -> User:
    user = await request.app.user_controller.get(id=user_id, organization_id=organization_id)

    return user


@router.get(
    "/{organization_id}/users",
    status_code=200,
    response_model=PagedResponse,
    dependencies=[Security(get_current_user, scopes=["admin"])],
)
async def get_organization_users(
    request: Request,
    organization_id: str,
    sort: Optional[UserSortableField] = UserSortableField.EMAIL,
    limit: Optional[int] = 1000,
    cursor: Optional[str] = None,
) -> PagedResponse:
    users, cursor = await request.app.user_controller.get_all(
        organization_id=organization_id, sort=sort, limit=limit, cursor=cursor
    )

    return PagedResponse(items=users, cursor=cursor)


@router.patch(
    "/{organization_id}/users/{user_id}/permissions",
    status_code=200,
    response_model=UserPermission,
    dependencies=[Security(get_current_user, scopes=["admin"])],
)
async def update_organization_user_permissions(
    request: Request, organization_id: str, user_id: str, body: BaseUserPermission
) -> User:
    return await request.app.user_permission_controller.update(
        id=user_id, organization_id=organization_id, updated_user_permission=body, current_user=request.state.user.id
    )


@router.delete(
    "/{organization_id}/users/{user_id}",
    status_code=200,
    dependencies=[Security(get_current_user, scopes=["admin"])],
)
async def delete_organization_user(request: Request, organization_id: str, user_id: str) -> None:
    result = await request.app.user_permission_controller.delete(
        id=user_id, organization_id=organization_id, current_user=request.state.user.id
    )

    if not result:
        return JSONResponse("Unable to delete user", status_code=412)
