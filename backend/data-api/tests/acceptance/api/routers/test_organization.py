from typing import Any, Dict, Optional

import pytest
from fastapi.testclient import TestClient

pytestmark = pytest.mark.asyncio


async def add_organization(
    data_api: TestClient,
    overrides: Optional[Dict[str, Any]] = {},
    expected_status_code: Optional[int] = 201,
):
    data = {
        "id": "test",
        "title": "Test",
    }
    data.update(**overrides)

    response = await data_api.post("", json=data)

    assert response.status_code == expected_status_code

    return response.json()


async def add_organization_user(data_api: TestClient, organization_id: str):
    response = await data_api.post(
        f"{organization_id}/users",
        json={"first_name": "Test", "permissions": {"engineering_permission_level": "admin"}},
    )
    assert response.status_code == 200

    return response.json()


async def test_should_add_organization(data_api: TestClient):
    organization = await add_organization(data_api)

    assert organization["id"] == "test"
    assert organization["title"] == "Test"
    assert organization["created_at"]
    assert organization["created_by_id"] == "test@test.com"
    assert organization["modified_at"]
    assert organization["modified_by_id"] == "test@test.com"


async def test_should_get_organization(data_api: TestClient):
    item = await add_organization(data_api)
    assert item["id"] == "test"

    response = await data_api.get(f"{item['id']}")
    assert response.status_code == 200

    organization = response.json()
    assert organization["id"] == item["id"]


async def test_should_not_get_organization(data_api: TestClient):
    response = await data_api.get("test")
    assert response.status_code == 404


async def test_should_update_organization(data_api: TestClient):
    item = await add_organization(data_api)
    assert item["title"] == "Test"

    response = await data_api.patch(f"{item['id']}", json={"title": "Test Updated"})
    assert response.status_code == 200

    response = await data_api.get(item["id"])
    organization = response.json()
    assert organization["title"] == "Test Updated"


async def test_should_delete_organization(data_api: TestClient):
    item = await add_organization(data_api)

    response = await data_api.delete(f"{item['id']}")
    assert response.status_code == 200

    response = await data_api.get(f"{item['id']}")
    assert response.status_code == 404


async def test_add_organization_user(data_api: TestClient):
    item = await add_organization(data_api)

    response = await data_api.post(
        f"{item['id']}/users", json={"first_name": "Test", "permissions": {"engineering_permission_level": "admin"}}
    )
    assert response.status_code == 200

    user = response.json()

    assert user["id"]
    assert user["permissions"]["user_id"] == user["id"]
    assert user["permissions"]["organization_id"] == item["id"]
    assert user["permissions"]["engineering_permission_level"] == "admin"


async def test_get_organization_user(data_api: TestClient):
    item = await add_organization(data_api)

    user = await add_organization_user(data_api, item["id"])

    response = await data_api.get(f"{item['id']}/users/{user['id']}")
    assert response.status_code == 200

    user = response.json()
    assert user["id"]
    assert user["permissions"]["user_id"] == user["id"]
    assert user["permissions"]["organization_id"] == item["id"]
    assert user["permissions"]["engineering_permission_level"] == "admin"


async def test_get_organization_users(data_api: TestClient):
    item = await add_organization(data_api)

    await add_organization_user(data_api, item["id"])
    await add_organization_user(data_api, item["id"])

    response = await data_api.get(f"{item['id']}/users")
    assert response.status_code == 200

    users = response.json()
    assert len(users) == 2

    for user in users:
        assert user["id"]
        assert user["permissions"]


async def test_update_organization_users_permission(data_api: TestClient):
    item = await add_organization(data_api)

    user = await add_organization_user(data_api, item["id"])

    response = await data_api.patch(
        f"{item['id']}/users/{user['id']}/permissions", json={"engineering_permission_level": "member"}
    )
    assert response.status_code == 200

    user_permissions = response.json()
    assert user_permissions["engineering_permission_level"] == "member"


async def test_delete_organization_user(data_api: TestClient):
    item = await add_organization(data_api)

    user = await add_organization_user(data_api, item["id"])

    response = await data_api.delete(f"{item['id']}/users/{user['id']}")
    assert response.status_code == 200

    response = await data_api.get(f"{item['id']}/users/{user['id']}")
    assert response.status_code == 404


async def test_delete_organization_user_doesnt_delete_user_entirely(data_api: TestClient):
    item = await add_organization(data_api)

    user = await add_organization_user(data_api, item["id"])

    response = await data_api.delete(f"{item['id']}/users/{user['id']}")
    assert response.status_code == 200

    response = await data_api.get(f"{item['id']}/users/{user['id']}")
    assert response.status_code == 404

    response = await data_api.get(f"users/{user['id']}")
    assert response.status_code == 200
