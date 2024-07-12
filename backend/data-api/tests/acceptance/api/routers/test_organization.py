import pytest
from fastapi.testclient import TestClient

from tests.fixtures import org_id
from tests.acceptance.api.routers.test_user import add_user
from tests.acceptance.api.utils import (
    add_organization,
    add_organization_user,
    authenticate,
    expired_headers,
    page_results,
)

pytestmark = pytest.mark.asyncio

# TODO add unauthed tests for orgs


async def authenticate_as_member(data_api, org_id: str, headers):
    response = await data_api.post(
        f"{org_id}/users",
        json={"first_name": "Test", "email": "test2@test.com", "password": "test", "permissions": {"role": "member"}},
        headers=headers,
    )
    assert response.status_code == 200

    response = await data_api.post("auth/login", json={"username": "test2@test.com", "password": "test", "scopes": []})
    member_headers = {"Authorization": f"Bearer {response.json()['access_token']}"}

    return member_headers


async def test_should_add_organization(data_api: TestClient):
    _, user, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)

    assert organization["id"] == data_api.test_org_id
    assert organization["title"] == "Test"
    assert organization["created_at"]
    assert organization["created_by_id"] == user["id"]
    assert organization["modified_at"]
    assert organization["modified_by_id"] == user["id"]

    # Check to make sure current user was granted access
    response = await data_api.get(f"{organization['id']}/users/{user['id']}", headers=headers)
    assert response.status_code == 200

    user = response.json()
    assert user["id"]


async def test_should_not_add_organization_with_expired_token(data_api: TestClient):
    _, _, _ = await authenticate(data_api, create_org=False)

    await add_organization(data_api, headers=expired_headers, expected_status_code=401)


async def test_should_not_add_organization_without_token(data_api: TestClient):
    await add_organization(data_api, headers={}, expected_status_code=401)


async def test_should_get_organization(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    item = await add_organization(data_api, headers=headers)
    assert item["id"] == data_api.test_org_id

    response = await data_api.get(f"{item['id']}", headers=headers)
    assert response.status_code == 200

    organization = response.json()
    assert organization["id"] == item["id"]


async def test_should_not_get_organization(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)

    response = await data_api.get("test", headers=headers)
    assert response.status_code == 401


async def test_should_not_get_organization_with_expired_token(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    item = await add_organization(data_api, headers=headers)
    assert item["id"] == data_api.test_org_id

    response = await data_api.get(f"{item['id']}", headers=expired_headers)
    assert response.status_code == 401


async def test_should_update_organization(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    item = await add_organization(data_api, headers=headers)
    assert item["title"] == "Test"

    response = await data_api.patch(f"{item['id']}", json={"title": "Test Updated"}, headers=headers)
    assert response.status_code == 200

    response = await data_api.get(item["id"], headers=headers)
    organization = response.json()
    assert organization["title"] == "Test Updated"


async def test_should_not_update_organization_with_expired_token(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    item = await add_organization(data_api, headers=headers)
    assert item["title"] == "Test"

    response = await data_api.patch(f"{item['id']}", json={"title": "Test Updated"}, headers=expired_headers)
    assert response.status_code == 401

    response = await data_api.get(item["id"], headers=headers)
    organization = response.json()
    assert organization["title"] == "Test"


async def test_member_should_not_update_organization(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    item = await add_organization(data_api, headers=headers)
    assert item["title"] == "Test"

    member_headers = await authenticate_as_member(data_api, item["id"], headers)

    response = await data_api.patch(f"{item['id']}", json={"title": "Test Updated"}, headers=member_headers)
    assert response.status_code == 401

    response = await data_api.get(item["id"], headers=headers)
    organization = response.json()
    assert organization["title"] == "Test"


async def test_should_delete_organization(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    item = await add_organization(data_api, headers=headers)

    response = await data_api.delete(f"{item['id']}", headers=headers)
    assert response.status_code == 200

    response = await data_api.get(f"{item['id']}", headers=headers)
    assert response.status_code == 404


async def test_should_not_delete_organization_with_expired_token(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    item = await add_organization(data_api, headers=headers)

    response = await data_api.delete(f"{item['id']}", headers=expired_headers)
    assert response.status_code == 401

    response = await data_api.get(f"{item['id']}", headers=headers)
    assert response.status_code == 200


async def test_member_should_not_delete_organization(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    item = await add_organization(data_api, headers=headers)

    member_headers = await authenticate_as_member(data_api, item["id"], headers)

    response = await data_api.delete(f"{item['id']}", headers=member_headers)
    assert response.status_code == 401

    response = await data_api.get(f"{item['id']}", headers=headers)
    assert response.status_code == 200


async def test_add_organization_user(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    item = await add_organization(data_api, headers=headers)

    response = await data_api.post(
        f"{item['id']}/users",
        json={"first_name": "Test", "permissions": {"role": "admin"}},
        headers=headers,
    )
    assert response.status_code == 200

    user = response.json()

    assert user["id"]
    assert user["permissions"]["user_id"] == user["id"]
    assert user["permissions"]["organization_id"] == item["id"]
    assert user["permissions"]["role"] == "admin"


async def test_add_organization_user_with_expired_token_fails(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    item = await add_organization(data_api, headers=headers)

    response = await data_api.post(
        f"{item['id']}/users",
        json={"first_name": "Test", "permissions": {"role": "admin"}},
        headers=expired_headers,
    )
    assert response.status_code == 401


async def test_member_add_organization_user_fails(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    item = await add_organization(data_api, headers=headers)

    member_headers = await authenticate_as_member(data_api, item["id"], headers)

    response = await data_api.post(
        f"{item['id']}/users",
        json={"first_name": "Test", "permissions": {"role": "admin"}},
        headers=member_headers,
    )
    assert response.status_code == 401


async def test_get_organization_user(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    item = await add_organization(data_api, headers=headers)

    user = await add_organization_user(data_api, item["id"], overrides={"email": "test2@test.com"}, headers=headers)

    response = await data_api.get(f"{item['id']}/users/{user['id']}", headers=headers)
    assert response.status_code == 200

    user = response.json()
    assert user["id"]
    assert user["permissions"]["user_id"] == user["id"]
    assert user["permissions"]["organization_id"] == item["id"]
    assert user["permissions"]["role"] == "admin"


async def test_get_organization_user_fails_with_expired_token(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    item = await add_organization(data_api, headers=headers)

    user = await add_organization_user(data_api, item["id"], overrides={"email": "test2@test.com"}, headers=headers)

    response = await data_api.get(f"{item['id']}/users/{user['id']}", headers=expired_headers)
    assert response.status_code == 401


async def test_member_should_not_get_organization_user(data_api: TestClient):
    _, user, headers = await authenticate(data_api, create_org=False)
    item = await add_organization(data_api, headers=headers)

    member_headers = await authenticate_as_member(data_api, item["id"], headers)

    response = await data_api.get(f"{item['id']}/users/{user['id']}", headers=member_headers)
    assert response.status_code == 401


async def test_get_organization_users(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    item = await add_organization(data_api, headers=headers)

    await add_organization_user(data_api, item["id"], overrides={"email": "test2@test.com"}, headers=headers)
    await add_user(data_api, overrides={"email": "test3@test.com"}, headers=headers)

    users = await page_results(data_api, f"{data_api.test_org_id}/users", headers=headers)

    assert len(users) == 2

    for user in users:
        assert user["id"]
        assert user["permissions"]


async def test_should_not_get_organization_users_with_expired_token(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    await add_organization(data_api, headers=headers)

    await page_results(data_api, f"{data_api.test_org_id}/users", headers=expired_headers, expected_status_code=401)


async def test_get_organization_users_with_limit(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    item = await add_organization(data_api, headers=headers)

    await add_organization_user(data_api, item["id"], overrides={"email": "test2@test.com"}, headers=headers)

    users = await page_results(data_api, f"{data_api.test_org_id}/users", limit=1, headers=headers)

    assert len(users) == 2


async def test_get_organization_users_with_limit_and_offset(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    item = await add_organization(data_api, headers=headers)

    await add_organization_user(data_api, item["id"], overrides={"email": "test2@test.com"}, headers=headers)

    users = await page_results(data_api, f"{data_api.test_org_id}/users", limit=1, headers=headers)

    assert len(users) == 2
    assert users[0]["id"] != users[1]["id"]


async def test_update_organization_users_permission(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    item = await add_organization(data_api, headers=headers)

    user = await add_organization_user(data_api, item["id"], overrides={"email": "test2@test.com"}, headers=headers)

    response = await data_api.patch(
        f"{item['id']}/users/{user['id']}/permissions", json={"role": "member"}, headers=headers
    )
    assert response.status_code == 200

    user_permissions = response.json()
    assert user_permissions["role"] == "member"


async def test_should_not_update_organization_users_permission_with_expired_token(data_api: TestClient):
    _, user, headers = await authenticate(data_api, create_org=False)
    item = await add_organization(data_api, headers=headers)

    response = await data_api.patch(
        f"{item['id']}/users/{user['id']}/permissions", json={"role": "member"}, headers=expired_headers
    )
    assert response.status_code == 401


async def test_member_should_not_update_organization_users_permission(data_api: TestClient):
    _, user, headers = await authenticate(data_api, create_org=False)
    item = await add_organization(data_api, headers=headers)

    member_headers = await authenticate_as_member(data_api, item["id"], headers=headers)

    response = await data_api.patch(
        f"{item['id']}/users/{user['id']}/permissions", json={"role": "member"}, headers=member_headers
    )
    assert response.status_code == 401


async def test_delete_organization_user(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    item = await add_organization(data_api, headers=headers)

    user = await add_organization_user(data_api, item["id"], overrides={"email": "test2@test.com"}, headers=headers)

    response = await data_api.delete(f"{item['id']}/users/{user['id']}", headers=headers)
    assert response.status_code == 200

    response = await data_api.get(f"{item['id']}/users/{user['id']}", headers=headers)
    assert response.status_code == 404


async def test_should_not_delete_organization_user_permission_with_expired_token(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    item = await add_organization(data_api, headers=headers)

    user = await add_organization_user(data_api, item["id"], overrides={"email": "test2@test.com"}, headers=headers)

    response = await data_api.delete(f"{item['id']}/users/{user['id']}", headers=expired_headers)
    assert response.status_code == 401

    response = await data_api.get(f"{item['id']}/users/{user['id']}", headers=headers)
    assert response.status_code == 200


async def test_member_should_not_delete_organization_user_permission(data_api: TestClient):
    _, user, headers = await authenticate(data_api, create_org=False)
    item = await add_organization(data_api, headers=headers)

    member_headers = await authenticate_as_member(data_api, item["id"], headers=headers)

    response = await data_api.delete(f"{item['id']}/users/{user['id']}", headers=member_headers)
    assert response.status_code == 401

    response = await data_api.get(f"{item['id']}/users/{user['id']}", headers=headers)
    assert response.status_code == 200


async def test_delete_organization_user_doesnt_delete_user_entirely(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    item = await add_organization(data_api, headers=headers)

    user = await add_organization_user(data_api, item["id"], overrides={"email": "test2@test.com"}, headers=headers)

    response = await data_api.delete(f"{item['id']}/users/{user['id']}", headers=headers)
    assert response.status_code == 200

    response = await data_api.get(f"{item['id']}/users/{user['id']}", headers=headers)
    assert response.status_code == 404

    response = await data_api.get(f"users/{user['id']}", headers=headers)
    assert response.status_code == 200
