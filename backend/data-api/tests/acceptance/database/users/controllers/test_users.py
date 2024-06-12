import pytest

from app.database.users.models.user import BaseUser, User

pytestmark = pytest.mark.asyncio


async def create_user(data_app) -> User:
    base_user = BaseUser(email="test@test.com", first_name="Test", last_name="Tester")

    user = await data_app.user_controller.create(user=base_user)

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
