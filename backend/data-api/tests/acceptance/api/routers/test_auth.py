import pytest
from fastapi.testclient import TestClient

from tests.acceptance.api.routers.test_user import add_user

pytestmark = pytest.mark.asyncio


async def test_should_get_auth_token(data_api: TestClient):
    user = await add_user(data_api)

    response = await data_api.post("auth/login", json={"username": user["email"], "password": "test", "scopes": []})

    assert response.status_code == 200

    data = response.json()
    assert data["access_token"]
    assert data["token_type"] == "bearer"


async def test_should_not_get_auth_token_with_invalid_email(data_api: TestClient):
    response = await data_api.post("auth/login", json={"username": "imfake", "password": "test-invalid", "scopes": []})

    assert response.status_code == 401


async def test_should_not_get_auth_token_with_invalid_password(data_api: TestClient):
    user = await add_user(data_api)

    response = await data_api.post(
        "auth/login", json={"username": user["email"], "password": "test-invalid", "scopes": []}
    )

    assert response.status_code == 401


async def _test_should_logout(data_api: TestClient):
    user = await add_user(data_api)

    response = await data_api.post("auth/login", json={"username": user["email"], "password": "test", "scopes": []})

    assert response.status_code == 200

    pytest.fail()
