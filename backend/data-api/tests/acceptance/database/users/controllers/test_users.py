from typing import Dict

import pytest

from app.api.dependencies.database import get_pool
from app.api.settings import settings, user_db
from app.database.users.models.user import BaseUser, User
from app.exceptions.common import ObjectNotFoundException
from tests.acceptance.database.utils import page_results

pytestmark = pytest.mark.asyncio


async def create_user(data_app, overrides: Dict[str, str] = {}) -> User:
    pool = await get_pool(settings.user_db_name)
    user_db.set(pool)

    user_obj = {"email": "test@test.com", "first_name": "Test", "last_name": "Tester", "password": "test"}
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
    assert user.reset_code


async def test_create_user_with_settings(data_app):
    user = await create_user(data_app, overrides={"settings": {"test": "value"}})

    assert user.settings == {"test": "value"}


async def test_create_user_excludes_fields_when_dumped(data_app):
    user = await create_user(data_app)

    assert isinstance(user, User)

    assert user.reset_code

    user = user.model_dump()
    for key in ["reset_code", "password"]:
        assert key not in user


async def test_get_user(data_app):
    user = await create_user(data_app)

    user = await data_app.user_controller.get(id=user.id)

    assert user.id


async def test_get_user_by_email(data_app):
    user = await create_user(data_app)

    user = await data_app.user_controller.get(id=None, email="test@test.com")

    assert user.id


async def test_get_user_fails_if_no_id_or_email_provide(data_app):
    await create_user(data_app)

    with pytest.raises(ObjectNotFoundException):
        await data_app.user_controller.get(id=None)


async def test_get_all_users(data_app):
    await create_user(data_app, overrides={"email": "test1@test.com"})
    await create_user(data_app, overrides={"email": "test2@test.com"})

    items = await page_results(data_app.user_controller)

    assert len(items) == 2
    assert isinstance(items[0], User)
    assert isinstance(items[1], User)


async def test_get_all_user_paging(data_app):
    await create_user(data_app, overrides={"email": "test1@test.com"})
    await create_user(data_app, overrides={"email": "test2@test.com"})

    items = await page_results(data_app.user_controller, limit=1)

    assert len(items) == 2
    assert items[0].id != items[1].id


# TODO Doesn't pass because of the sort property being included as a string in the query
async def _test_get_all_user_paging_sorting(data_app):
    await create_user(data_app, overrides={"email": "test2@test.com"})
    await create_user(data_app, overrides={"email": "test1@test.com"})

    items = await page_results(data_app.user_controller, limit=1)

    assert len(items) == 2
    assert items[0].email == "test1@test.com"
    assert items[1].email == "test2@test.com"


async def test_update_user(data_app):
    user = await create_user(data_app)

    user.first_name = "Test Updated"
    user = await data_app.user_controller.update(id=user.id, updated_user=user, current_user=user.id)

    assert user.id
    assert user.first_name == "Test Updated"


async def test_update_user_settings(data_app):
    user = await create_user(data_app)

    user.settings = {"test": "value"}
    user = await data_app.user_controller.update(id=user.id, updated_user=user, current_user=user.id)

    assert user.settings == {"test": "value"}


async def test_update_user_password(data_app):
    user = await create_user(data_app)
    old_password = user.password

    user = await data_app.user_controller.update(id=user.id, updated_user=user, current_user=user.id, password="Test2")

    assert user.password != old_password


async def test_update_user_to_super_admin(data_app):
    user = await create_user(data_app)

    assert user.super_admin is False

    user = await data_app.user_controller.update(id=user.id, updated_user=user, current_user=user.id, super_admin=True)

    assert user.super_admin is True

    # TODO need to create script to set user to super admin


async def test_delete_user(data_app):
    user = await create_user(data_app)

    result = await data_app.user_controller.delete(id=user.id, current_user=user.id)

    assert result
