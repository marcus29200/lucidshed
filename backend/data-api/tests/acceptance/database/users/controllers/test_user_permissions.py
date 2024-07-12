import pytest

from app.database.users.models.user_permission import BaseUserPermission, UserPermission, UserRoleType
from app.exceptions.common import ObjectNotFoundException
from tests.acceptance.database.organizations.controllers.test_organizations import create_organization
from tests.acceptance.database.users.controllers.test_users import create_user

pytestmark = pytest.mark.asyncio


async def create_user_permission(data_app, user_id: str) -> UserPermission:
    org = await create_organization(data_app)

    base_user_permission = BaseUserPermission(user_id=user_id, role=UserRoleType.ADMIN)

    user_permission = await data_app.user_permission_controller.create(
        organization_id=org.id,
        user_permission=base_user_permission,
        current_user=user_id,
    )

    assert user_permission.id

    return user_permission


async def test_add_user_permission(data_app):
    user = await create_user(data_app)
    user_permission = await create_user_permission(data_app, user_id=user.id)

    assert isinstance(user_permission, UserPermission)

    assert user_permission.organization_id == "test"
    assert user_permission.user_id == user.id
    assert user_permission.role == UserRoleType.ADMIN


async def test_get_user_permission(data_app):
    user = await create_user(data_app)
    await create_user_permission(data_app, user_id=user.id)

    user_permission = await data_app.user_permission_controller.get(id=user.id, organization_id=org.id)

    assert user_permission.id


async def test_get_user_permission_return_not_found(data_app):
    user = await create_user(data_app)
    # await create_user_permission(data_app, user_id=user.id)

    with pytest.raises(ObjectNotFoundException):
        await data_app.user_permission_controller.get(id=user.id, organization_id=org.id)


async def test_update_user_permission(data_app):
    user = await create_user(data_app)
    user_permission = await create_user_permission(data_app, user_id=user.id)

    user_permission.role = None
    user_permission = await data_app.user_permission_controller.update(
        id=user.id, organization_id=org.id, updated_user_permission=user_permission, current_user=user.id
    )

    assert user_permission.role is None


async def test_delete_user_permission(data_app):
    user = await create_user(data_app)
    await create_user_permission(data_app, user_id=user.id)

    result = await data_app.user_permission_controller.delete(
        id=user.id, organization_id=org.id, current_user="test@test.com"
    )

    assert result
