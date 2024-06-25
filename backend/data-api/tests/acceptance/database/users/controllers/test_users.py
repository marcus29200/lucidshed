from typing import Dict

import pytest

from app.database.users.models.user import BaseUser, User, UserSortableField

pytestmark = pytest.mark.asyncio


async def create_user(data_app, overrides: Dict[str, str] = {}) -> User:
    user_obj = {"email": "test@test.com", "first_name": "Test", "last_name": "Tester"}
    user_obj.update(**overrides)

    base_user = BaseUser(**user_obj)

    user = await data_app.user_controller.create(user=base_user, current_user="test@test.com")

    assert user.id

    return user


async def test_create_user(data_app):
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


async def test_get_all_users(data_app):
    await create_user(data_app, overrides={"email": "test1@test.com"})
    await create_user(data_app, overrides={"email": "test2@test.com"})

    users = await data_app.user_controller.get_all()

    assert len(users) == 2
    assert isinstance(users[0], User)
    assert isinstance(users[1], User)


async def test_get_all_user_paging(data_app):
    await create_user(data_app, overrides={"email": "test1@test.com"})
    await create_user(data_app, overrides={"email": "test2@test.com"})

    user_items = await data_app.user_controller.get_all(limit=1, offset=0)

    assert len(user_items) == 1
    assert isinstance(user_items[0], User)
    first_id = user_items[0].id

    user_items = await data_app.user_controller.get_all(limit=1, offset=1)

    assert len(user_items) == 1
    assert isinstance(user_items[0], User)
    assert user_items[0].id != first_id


# TODO Doesn't pass because of the sort property being included as a string in the query
async def test_get_all_user_work_item_paging_sorting(data_app):
    await create_user(data_app, overrides={"email": "test2@test.com"})
    await create_user(data_app, overrides={"email": "test1@test.com"})

    user_items = await data_app.user_controller.get_all(sort=UserSortableField.EMAIL, limit=1, offset=0)

    assert len(user_items) == 1
    assert user_items[0].email == "test1@test.com"

    user_items = await data_app.user_controller.get_all(sort=UserSortableField.EMAIL, limit=1, offset=1)

    assert len(user_items) == 1
    assert user_items[0].email == "test2@test.com"


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
