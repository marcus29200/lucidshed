from typing import Any, Dict, Optional

import pytest
from fastapi.testclient import TestClient

pytestmark = pytest.mark.asyncio


async def add_user(
    data_api: TestClient,
    overrides: Optional[Dict[str, Any]] = {},
    expected_status_code: Optional[int] = 201,
):
    data = {"first_name": "Test", "last_name": "Tester"}
    data.update(**overrides)

    response = await data_api.post("users", json=data)

    assert response.status_code == expected_status_code

    return response.json()


async def test_should_add_user(data_api: TestClient):
    user = await add_user(data_api)

    assert user["id"]
    assert user["first_name"] == "Test"
    assert user["last_name"] == "Tester"
    assert user["created_at"]
    assert user["created_by_id"] == "test@test.com"
    assert user["modified_at"]
    assert user["modified_by_id"] == "test@test.com"


async def test_should_get_user(data_api: TestClient):
    item = await add_user(data_api)

    response = await data_api.get(f"users/{item['id']}")
    assert response.status_code == 200

    user = response.json()
    assert user["id"] == item["id"]


async def test_should_not_get_user(data_api: TestClient):
    response = await data_api.get("users/0")
    assert response.status_code == 404


async def test_get_all_users(data_api):
    await add_user(data_api, overrides={"email": "test1@test.com"})
    await add_user(data_api, overrides={"email": "test2@test.com"})

    response = await data_api.get("users")
    assert response.status_code == 200

    users = response.json()
    assert len(users) == 2


async def test_get_all_user_paging(data_api):
    await add_user(data_api, overrides={"email": "test1@test.com"})
    await add_user(data_api, overrides={"email": "test2@test.com"})

    response = await data_api.get("users")
    assert response.status_code == 200

    users = response.json()
    assert len(users) == 2


async def test_get_all_user_paging_with_limit(data_api):
    await add_user(data_api, overrides={"email": "test2@test.com"})
    await add_user(data_api, overrides={"email": "test1@test.com"})

    response = await data_api.get(f"users?limit=1")
    assert response.status_code == 200

    users = response.json()
    assert len(users) == 1
    assert users[0]["email"] == "test2@test.com"


async def test_get_all_user_paging_with_limit_and_offset(data_api):
    await add_user(data_api, overrides={"email": "test2@test.com"})
    await add_user(data_api, overrides={"email": "test1@test.com"})

    response = await data_api.get(f"users?limit=1&offset=1")
    assert response.status_code == 200

    users = response.json()
    assert len(users) == 1
    assert users[0]["email"] == "test1@test.com"


async def test_should_update_user(data_api: TestClient):
    item = await add_user(data_api)

    response = await data_api.patch(f"users/{item['id']}", json={"first_name": "Test Updated"})
    assert response.status_code == 200

    item = response.json()
    assert item["first_name"] == "Test Updated"


async def test_should_delete_user(data_api: TestClient):
    item = await add_user(data_api)

    response = await data_api.delete(f"users/{item['id']}")
    assert response.status_code == 200

    response = await data_api.get(f"users/{item['id']}")
    assert response.status_code == 404
