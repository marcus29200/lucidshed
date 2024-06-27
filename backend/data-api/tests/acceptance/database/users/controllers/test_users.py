from typing import Dict, Optional

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


async def page_results(data_app, sort: Optional[str] = UserSortableField.ID, limit: Optional[int] = 1000):
    page_limit = 100
    pages = 0
    users = []
    cursor = None

    while True:
        items, cursor = await data_app.user_controller.get_all(sort=sort, limit=limit, cursor=cursor)
        users.extend(items)

        if pages > page_limit:
            raise Exception("Too many pages, possible issue with cursor/paging")

        if not cursor:
            break

    return users


async def test_get_all_users(data_app):
    await create_user(data_app, overrides={"email": "test1@test.com"})
    await create_user(data_app, overrides={"email": "test2@test.com"})

    items = await page_results(data_app)

    assert len(items) == 2
    assert isinstance(items[0], User)
    assert isinstance(items[1], User)


async def test_get_all_user_paging(data_app):
    await create_user(data_app, overrides={"email": "test1@test.com"})
    await create_user(data_app, overrides={"email": "test2@test.com"})

    items = await page_results(data_app, limit=1)

    assert len(items) == 2
    assert items[0].id != items[1].id


# TODO Doesn't pass because of the sort property being included as a string in the query
async def test_get_all_user_work_item_paging_sorting(data_app):
    await create_user(data_app, overrides={"email": "test2@test.com"})
    await create_user(data_app, overrides={"email": "test1@test.com"})

    items = await page_results(data_app, limit=1)

    assert len(items) == 2
    assert items[0].email == "test1@test.com"
    assert items[1].email == "test2@test.com"


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
