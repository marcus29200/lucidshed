import pytest

from app.database.users.models.user import BaseUser, User

pytestmark = pytest.mark.asyncio


async def create_user(data_app) -> User:
    base_user = BaseUser(email="test@test.com", first_name="Test", last_name="Tester")

    user = await data_app.user_controller.create(user=base_user, current_user="test@test.com")

    assert user.id

    return user


async def test_add_user(data_app):
    user = await create_user(data_app)

    assert isinstance(user, User)

    assert user.id
    assert user.email == "test@test.com"
    assert user.first_name == "Test"
    assert user.last_name == "Tester"
    assert user.created_at
    assert user.modified_at


async def test_get_user(data_app):
    user = await create_user(data_app)

    user = await data_app.user_controller.get(id=user.id)

    assert user.id


async def test_update_user(data_app):
    user = await create_user(data_app)

    user.first_name = "Test Updated"
    user = await data_app.user_controller.update(id=user.id, updated_user=user, current_user=user.id)

    assert user.id
    assert user.first_name == "Test Updated"


async def test_delete_user(data_app):
    user = await create_user(data_app)

    result = await data_app.user_controller.delete(id=user.id, current_user=user.id)

    assert result
