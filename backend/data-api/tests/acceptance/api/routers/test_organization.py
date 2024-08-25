from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from app.api.settings import settings
from tests.acceptance.api.utils import (
    DEFAULT_PASSWORD,
    add_organization,
    add_organization_user,
    add_user,
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

    user = response.json()
    assert user["reset_code"]

    response = await data_api.post(
        "users/reset-password", json={"reset_code": user["reset_code"], "password": DEFAULT_PASSWORD}
    )
    assert response.status_code == 200

    response = await data_api.post(
        "users/login", json={"username": "test2@test.com", "password": DEFAULT_PASSWORD, "scopes": []}
    )
    assert response.status_code == 200

    data = response.json()
    member_headers = {"Authorization": f"Bearer {data['token']['access_token']}"}

    return member_headers


async def test_should_add_organization(data_api: TestClient):
    _, user, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)

    assert organization["id"] == data_api.test_org_id
    assert organization["title"] == "Test"
    assert organization["created_at"]
    assert organization["created_by_id"]
    assert organization["modified_at"]
    assert organization["modified_by_id"]

    # Check to make sure current user was granted access
    response = await data_api.get(f"{organization['id']}/users", headers=headers)
    assert response.status_code == 200

    users = response.json()
    assert users["items"][0]["email"] == user["email"]


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
    org, _, headers = await authenticate(data_api)

    member_headers = await authenticate_as_member(data_api, org["id"], headers)

    response = await data_api.delete(f"{org['id']}", headers=member_headers)
    assert response.status_code == 401

    response = await data_api.get(f"{org['id']}", headers=headers)
    assert response.status_code == 200


async def test_add_organization_user(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    response = await data_api.post(
        f"{org['id']}/users",
        json={"first_name": "Test", "email": "test2@test.com", "permissions": {"role": "admin"}},
        headers=headers,
    )
    assert response.status_code == 200
    user = response.json()

    assert user["id"]
    assert user["reset_code"]

    response = await data_api.get(
        f"{org['id']}/users/{user['id']}",
        headers=headers,
    )
    assert response.status_code == 200

    user = response.json()

    assert user["id"]
    assert user["permissions"][org["id"]]["user_id"] == user["id"]
    assert user["permissions"][org["id"]]["organization_id"] == org["id"]
    assert user["permissions"][org["id"]]["role"] == "admin"


@patch("app.api.utils.SendGridAPIClient.send")
async def test_add_organization_user_sends_email_to_new_user(mock_send, data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    settings.sendgrid_api_key = "test"

    response = await data_api.post(
        f"{org['id']}/users",
        json={"first_name": "Test", "email": "test2@test.com", "permissions": {"role": "admin"}},
        headers=headers,
    )
    assert response.status_code == 200

    assert mock_send.call_count == 1
    assert "verification" in mock_send.call_args[0][0].contents[0].content


@patch("app.api.utils.SendGridAPIClient.send")
async def test_add_organization_user_sends_email_to_existing_user(mock_send, data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    # Create user ahead of time, but don't use it to do requests
    await authenticate(data_api, user_email="test2@test.com", create_org=False)

    settings.sendgrid_api_key = "test"

    response = await data_api.post(
        f"{org['id']}/users",
        json={"first_name": "Test", "email": "test2@test.com", "permissions": {"role": "admin"}},
        headers=headers,
    )
    assert response.status_code == 200

    assert mock_send.call_count == 1
    assert "verification" not in mock_send.call_args[0][0].contents[0].content


async def test_add_duplicate_organization_user_fails(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    response = await data_api.post(
        f"{org['id']}/users",
        json={"email": "test@test.com", "permissions": {"role": "admin"}},
        headers=headers,
    )
    assert response.status_code == 412


async def test_add_existing_user_to_organization(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    await add_user(data_api, overrides={"email": "test2@test.com"})

    response = await data_api.post(
        f"{org['id']}/users",
        json={"email": "test2@test.com", "permissions": {"role": "admin"}},
        headers=headers,
    )
    assert response.status_code == 200


async def test_add_organization_user_with_expired_token_fails(data_api: TestClient):
    org, _, _ = await authenticate(data_api)

    response = await data_api.post(
        f"{org['id']}/users",
        json={"email": "test@test.com", "permissions": {"role": "admin"}},
        headers=expired_headers,
    )
    assert response.status_code == 401


async def test_member_add_organization_user_fails(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    member_headers = await authenticate_as_member(data_api, org["id"], headers)

    response = await data_api.post(
        f"{org['id']}/users",
        json={"email": "test@test.com", "permissions": {"role": "admin"}},
        headers=member_headers,
    )
    assert response.status_code == 401


async def test_get_organization_user(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    user = await add_organization_user(data_api, org["id"], overrides={"email": "test2@test.com"}, headers=headers)

    response = await data_api.get(f"{org['id']}/users/{user['id']}", headers=headers)
    assert response.status_code == 200

    user = response.json()
    assert user["id"]
    assert len(user["permissions"]) == 1
    assert user["permissions"][org["id"]]["user_id"] == user["id"]
    assert user["permissions"][org["id"]]["organization_id"] == org["id"]
    assert user["permissions"][org["id"]]["role"] == "admin"


async def test_get_organization_user_fails_with_expired_token(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    user = await add_organization_user(data_api, org["id"], overrides={"email": "test2@test.com"}, headers=headers)

    response = await data_api.get(f"{org['id']}/users/{user['id']}", headers=expired_headers)
    assert response.status_code == 401


async def test_member_should_not_get_organization_user(data_api: TestClient):
    org, user, headers = await authenticate(data_api)

    member_headers = await authenticate_as_member(data_api, org["id"], headers)

    response = await data_api.get(f"{org['id']}/users/{user['id']}", headers=member_headers)
    assert response.status_code == 401


async def test_get_organization_users(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    await add_organization_user(data_api, org["id"], overrides={"email": "test2@test.com"}, headers=headers)
    await add_user(data_api, overrides={"email": "test3@test.com"}, headers=headers)

    users = await page_results(data_api, f"{data_api.test_org_id}/users", headers=headers)

    assert len(users) == 2

    for user in users:
        assert user["id"]
        assert user["permissions"]


async def test_should_not_get_organization_users_with_expired_token(data_api: TestClient):
    await authenticate(data_api)

    await page_results(data_api, f"{data_api.test_org_id}/users", headers=expired_headers, expected_status_code=401)


async def test_get_organization_users_with_limit(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    await add_organization_user(data_api, org["id"], overrides={"email": "test2@test.com"}, headers=headers)

    users = await page_results(data_api, f"{data_api.test_org_id}/users", limit=1, headers=headers)

    assert len(users) == 2


async def test_get_organization_users_with_limit_and_offset(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    await add_organization_user(data_api, org["id"], overrides={"email": "test2@test.com"}, headers=headers)

    users = await page_results(data_api, f"{data_api.test_org_id}/users", limit=1, headers=headers)

    assert len(users) == 2
    assert users[0]["id"] != users[1]["id"]


async def test_update_organization_users_permission(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    user = await add_organization_user(data_api, org["id"], overrides={"email": "test2@test.com"}, headers=headers)

    response = await data_api.patch(
        f"{org['id']}/users/{user['id']}/permissions", json={"role": "member"}, headers=headers
    )
    assert response.status_code == 200

    user_permissions = response.json()
    assert user_permissions["role"] == "member"


async def test_should_not_update_organization_users_permission_with_expired_token(data_api: TestClient):
    org, user, headers = await authenticate(data_api)

    response = await data_api.patch(
        f"{org['id']}/users/{user['id']}/permissions", json={"role": "member"}, headers=expired_headers
    )
    assert response.status_code == 401


async def test_member_should_not_update_organization_users_permission(data_api: TestClient):
    org, user, headers = await authenticate(data_api)

    member_headers = await authenticate_as_member(data_api, org["id"], headers=headers)

    response = await data_api.patch(
        f"{org['id']}/users/{user['id']}/permissions", json={"role": "member"}, headers=member_headers
    )
    assert response.status_code == 401


async def test_delete_organization_user(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    user = await add_organization_user(data_api, org["id"], overrides={"email": "test2@test.com"}, headers=headers)

    response = await data_api.delete(f"{org['id']}/users/{user['id']}", headers=headers)
    assert response.status_code == 200

    response = await data_api.get(f"{org['id']}/users/{user['id']}", headers=headers)
    assert response.status_code == 404


async def test_should_not_delete_organization_user_permission_with_expired_token(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    user = await add_organization_user(data_api, org["id"], overrides={"email": "test2@test.com"}, headers=headers)

    response = await data_api.delete(f"{org['id']}/users/{user['id']}", headers=expired_headers)
    assert response.status_code == 401

    response = await data_api.get(f"{org['id']}/users/{user['id']}", headers=headers)
    assert response.status_code == 200


async def test_member_should_not_delete_organization_user_permission(data_api: TestClient):
    org, user, headers = await authenticate(data_api)

    member_headers = await authenticate_as_member(data_api, org["id"], headers=headers)

    response = await data_api.delete(f"{org['id']}/users/{user['id']}", headers=member_headers)
    assert response.status_code == 401

    response = await data_api.get(f"{org['id']}/users/{user['id']}", headers=headers)
    assert response.status_code == 200
