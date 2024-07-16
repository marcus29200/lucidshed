import pytest
from fastapi.testclient import TestClient

from tests.acceptance.api.utils import DEFAULT_PASSWORD, add_user, authenticate

pytestmark = pytest.mark.asyncio


async def test_should_not_add_super_admin(data_api: TestClient):
    _, user, headers = await authenticate(data_api)

    response = await data_api.get(f"users/{user['id']}", headers=headers)
    assert response.status_code == 200

    user = response.json()

    assert user["super_admin"] is False


# TODO Add registration tests
async def test_should_register_user(data_api: TestClient):
    user = await add_user(data_api)

    assert user["email"]


async def test_should_not_register_duplicate_user(data_api: TestClient):
    await add_user(data_api)
    await add_user(data_api, expected_status_code=412)


async def test_should_get_auth_token(data_api: TestClient):
    user = await add_user(data_api)

    response = await data_api.post(
        "users/login", json={"username": user["email"], "password": DEFAULT_PASSWORD, "scopes": []}
    )

    assert response.status_code == 200

    data = response.json()
    assert data["token"]["access_token"]
    assert data["token"]["token_type"] == "bearer"

    assert data["user"]["id"]


async def test_should_not_get_auth_token_with_invalid_email(data_api: TestClient):
    response = await data_api.post("users/login", json={"username": "imfake", "password": "test-invalid", "scopes": []})

    assert response.status_code == 401


async def test_should_not_get_auth_token_with_invalid_password(data_api: TestClient):
    user = await add_user(data_api)

    response = await data_api.post(
        "users/login", json={"username": user["email"], "password": "test-invalid", "scopes": []}
    )

    assert response.status_code == 401


async def _test_should_logout(data_api: TestClient):
    user = await add_user(data_api)

    response = await data_api.post(
        "users/login", json={"username": user["email"], "password": DEFAULT_PASSWORD, "scopes": []}
    )

    assert response.status_code == 200

    pytest.fail()


# TODO Tests for password checks


async def test_should_get_user(data_api: TestClient):
    _, user, headers = await authenticate(data_api)

    response = await data_api.get(f"users/{user['id']}", headers=headers)
    assert response.status_code == 200

    user = response.json()
    assert user["id"] == user["id"]


async def test_should_not_get_other_user(data_api: TestClient):
    _, _, headers = await authenticate(data_api)
    _, user, _ = await authenticate(data_api, user_email="test2@test.com", create_org=False)

    response = await data_api.get(f"users/{user['id']}", headers=headers)
    assert response.status_code == 401


async def test_should_not_get_missing_user(data_api: TestClient):
    _, _, headers = await authenticate(data_api)

    response = await data_api.get("users/0", headers=headers)
    assert response.status_code == 404


async def test_should_update_user(data_api: TestClient):
    _, user, headers = await authenticate(data_api)

    response = await data_api.patch(f"users/{user['id']}", json={"first_name": "Test Updated"}, headers=headers)
    assert response.status_code == 200

    item = response.json()
    assert item["first_name"] == "Test Updated"


async def test_should_not_update_user_to_super_admin(data_api: TestClient):
    _, user, headers = await authenticate(data_api)

    response = await data_api.patch(f"users/{user['id']}", json={"super_admin": True}, headers=headers)
    assert response.status_code == 200

    item = response.json()
    assert item["super_admin"] is False


async def test_reset_user_password(data_api: TestClient):
    _, user, _ = await authenticate(data_api)

    response = await data_api.post("users/reset-request", json={"email": user["email"]})
    assert response.status_code == 200

    data = response.json()
    assert data["reset_code"]

    response = await data_api.post(
        "users/reset-password", json={"reset_code": data["reset_code"], "password": "S0meotherStr0ngPassword!"}
    )
    assert response.status_code == 200

    # Try new password
    response = await data_api.post(
        "users/login", json={"username": user["email"], "password": "S0meotherStr0ngPassword!", "scopes": []}
    )
    assert response.status_code == 200

    # Make sure old password doesn't work
    response = await data_api.post(
        "users/login", json={"username": user["email"], "password": DEFAULT_PASSWORD, "scopes": []}
    )
    assert response.status_code == 401


async def test_should_not_update_user_picture(data_api: TestClient):
    _, user, headers = await authenticate(data_api)

    test_too_long = "a" * 5000002

    response = await data_api.patch(f"users/{user['id']}", json={"picture": f"{test_too_long}"}, headers=headers)
    assert response.status_code == 422


async def test_should_delete_user(data_api: TestClient):
    _, user, headers = await authenticate(data_api)

    response = await data_api.delete(f"users/{user['id']}", headers=headers)
    assert response.status_code == 200
