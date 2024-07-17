import pytest

from app.database.users.models.user_session import BaseUserSession, UserSession
from app.exceptions.common import ObjectNotFoundException
from tests.acceptance.database.users.controllers.test_users import create_user

pytestmark = pytest.mark.asyncio


async def create_user_session(data_app, user_id: str) -> UserSession:
    base_user_session = BaseUserSession(user_id=user_id, token="test")

    user_session = await data_app.user_session_controller.create(user_session=base_user_session)

    assert user_session.id

    return user_session


async def test_add_user_session(data_app):
    user = await create_user(data_app)
    user_session = await create_user_session(data_app, user_id=user.id)

    assert isinstance(user_session, UserSession)

    assert user_session.user_id == user.id
    assert user_session.token == "test"
    assert user_session.created_at
    assert user_session.expires_at > user_session.created_at


async def test_get_user_session(data_app):
    user = await create_user(data_app)
    user_session = await create_user_session(data_app, user_id=user.id)

    user_session = await data_app.user_session_controller.get(token=user_session.token)

    assert user_session.id


async def test_get_user_session_return_not_found(data_app):
    await create_user(data_app)
    # await create_user_session(data_app, user_id=user.id)

    with pytest.raises(ObjectNotFoundException):
        await data_app.user_session_controller.get(token="not_found")


async def test_delete_user_session_by_token(data_app):
    user = await create_user(data_app)
    user_session = await create_user_session(data_app, user_id=user.id)

    result = await data_app.user_session_controller.delete(identifier=user_session.token)

    assert result


async def test_delete_user_session_by_user_id(data_app):
    user = await create_user(data_app)
    user_session = await create_user_session(data_app, user_id=user.id)

    result = await data_app.user_session_controller.delete(identifier=user_session.user_id)

    assert result
