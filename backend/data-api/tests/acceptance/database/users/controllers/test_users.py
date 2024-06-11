from typing import Optional

import pytest

from app.database.users.controllers.user import UserController
from app.database.users.models.user import BaseUser, User
from app.exceptions.common import ObjectNotFoundException

pytestmark = pytest.mark.asyncio


async def create_user(
    user_controller: UserController,
) -> User:
    base_user = BaseUser(email="test@test.com", first_name="Test", last_name="Tester")

    user = await user_controller.create(user=base_user)

    assert user.id

    return user


async def test_add_user(user_controller):
    user = await create_user(user_controller)

    assert isinstance(user, User)

    assert user.id
    assert user.email == "test@test.com"
    assert user.first_name == "Test"
    assert user.last_name == "Tester"
    assert user.created_at
    assert user.modified_at
