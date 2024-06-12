import pytest

from app.database.users.models.user_permission import BaseUserPermission, UserPermission, UserPermissionType
from tests.acceptance.database.users.controllers.test_users import create_user
from app.exceptions.common import ObjectNotFoundException

pytestmark = pytest.mark.asyncio


async def create_user_permission(data_app, user_id: str) -> UserPermission:
    base_user_permission = BaseUserPermission(user_id=user_id, engineering_permission_level=UserPermissionType.ADMIN)

    user_permission = await data_app.user_permission_controller.create(
        user_permission=base_user_permission, current_user=user_id
    )

    assert user_permission.id

    return user_permission


async def test_add_user_permission(data_app):
    user = await create_user(data_app)
    user_permission = await create_user_permission(data_app, user_id=user.id)

    assert isinstance(user_permission, UserPermission)

    assert user_permission.organization_id == "test"
    assert user_permission.user_id == user.id
    assert user_permission.engineering_permission_level == UserPermissionType.ADMIN


async def test_get_user_permission(data_app):
    user = await create_user(data_app)
    await create_user_permission(data_app, user_id=user.id)

    user_permission = await data_app.user_permission_controller.get(id=user.id, organization_id="test")

    assert user_permission.id


async def test_get_user_permission_return_not_found(data_app):
    user = await create_user(data_app)
    # await create_user_permission(data_app, user_id=user.id)

    with pytest.raises(ObjectNotFoundException):
        await data_app.user_permission_controller.get(id=user.id, organization_id="test")


async def test_update_user_permission(data_app):
    user = await create_user(data_app)
    user_permission = await create_user_permission(data_app, user_id=user.id)

    user_permission.engineering_permission_level = None
    user_permission = await data_app.user_permission_controller.update(
        id=user.id, organization_id="test", updated_user_permission=user_permission, current_user=user.id
    )

    assert user_permission.engineering_permission_level is None


async def test_delete_user_permission(data_app):
    user = await create_user(data_app)
    await create_user_permission(data_app, user_id=user.id)

    result = await data_app.user_permission_controller.delete(
        id=user.id, organization_id="test", current_user="test@test.com"
    )

    assert result
