from typing import Any, Dict, Optional

from fastapi.testclient import TestClient

from app.api.dependencies.database import get_pool
from app.settings import data_db

expired_headers = {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWJqZWN0IjoidGVzdEB0ZXN0LmNvbSIsInNjb3BlcyI6W10sImV4cCI6MTcxOTU4ODc5Mi4zNjUxN30.15fa1fwuhx-FQLHPzbxOmZ35afvyxzJYFs6c-cIt_o4"  # noqa
}

DEFAULT_PASSWORD = "WeL!keStr0ngpasswordsHere"


async def add_organization(
    data_api: TestClient,
    headers: Optional[Dict[str, str]] = {},
    overrides: Optional[Dict[str, Any]] = {},
    expected_status_code: Optional[int] = 201,
):
    data = {"id": data_api.test_org_id, "title": "Test"}
    data.update(**overrides)

    response = await data_api.post("", json=data, headers=headers)

    if response.status_code != expected_status_code:
        raise AssertionError(f"{response.status_code} != {expected_status_code}")

    if response.status_code == 201:
        pool = await get_pool(db_name=data_api.test_org_id)
        data_db.set(pool)

    return response.json()


async def add_organization_user(
    data_api: TestClient,
    organization_id: str,
    overrides: Optional[Dict[str, Any]] = {},
    headers: Optional[Dict[str, str]] = {},
):
    data = {
        "first_name": "Test",
        "last_name": "Tester",
        "email": "test@test.com",
        "password": "test",
        "permissions": {"role": "admin"},
    }
    data.update(**overrides)

    response = await data_api.post(f"{organization_id}/users", json=data, headers=headers)

    if response.status_code != 200:
        raise AssertionError(f"{response.status_code} != {200}")

    return response.json()


async def add_engineering_item(
    data_api: TestClient,
    org_id: str,
    overrides: Optional[Dict[str, Any]] = {},
    expected_status_code: Optional[int] = 201,
    headers: Optional[Dict[str, Any]] = {},
):
    data = {
        "title": "test",
        "description": "test description",
        "status": "done",
        "priority": "high",
        "item_type": "story",
    }
    data.update(**overrides)

    response = await data_api.post(f"{org_id}/engineering", json=data, headers=headers)

    assert response.status_code == expected_status_code

    return response.json()


async def authenticate(data_api, user_email: Optional[str] = "test@test.com", create_org: bool = True):
    await add_user(data_api, {"email": user_email})

    response = await data_api.post(
        "users/login", json={"username": user_email, "password": DEFAULT_PASSWORD, "scopes": []}
    )
    assert response.status_code == 200

    data = response.json()
    headers = {"Authorization": f"Bearer {data['token']['access_token']}"}

    org = None
    if create_org:
        org = await add_organization(data_api, headers=headers)

    return org, data["user"], headers


async def add_user(
    data_api: TestClient,
    overrides: Optional[Dict[str, Any]] = {},
    expected_status_code: Optional[int] = 200,
    headers: Optional[Dict[str, Any]] = {},
):
    user_data = {
        "first_name": "Test",
        "last_name": "Tester",
        "email": "test@test.com",
        "title": "Engineer",
        "team": "Operations",
        "phone": "123-456-7890",
        "location": "USA",
        "timezone": "EST",
        "bio": "I am an engineer",
        "picture": "SGVsbG8sIHdvcmxkIQ==",
        "password": "test",
    }
    user_data.update(**overrides)

    response = await data_api.post("users/register", json=user_data)
    if response.status_code != expected_status_code:
        raise AssertionError(f"{response.status_code} != {expected_status_code}")

    if response.status_code != 200:
        return None

    user = response.json()
    assert user["reset_code"]

    response = await data_api.post(
        "users/reset-password", json={"reset_code": user["reset_code"], "password": DEFAULT_PASSWORD}
    )
    if response.status_code != expected_status_code:
        raise AssertionError(f"{response.status_code} != {expected_status_code}")

    return user_data


async def page_results(
    data_api,
    endpoint,
    item_type: Optional[str] = None,
    iteration_id: Optional[int] = None,
    assigned_to_id: Optional[int] = None,
    sort: Optional[str] = None,
    limit: Optional[int] = 1000,
    headers: Optional[Dict[str, Any]] = {},
    expected_status_code: Optional[int] = 200,
):
    page_limit = 100
    pages = 0
    items = []
    cursor = None

    while True:
        query_params = {
            "item_type": item_type if item_type else "",
            "iteration_id": iteration_id if iteration_id is not None else None,
            "assigned_to_id": assigned_to_id if assigned_to_id is not None else None,
            "sort": sort if sort else "id",
            "limit": limit,
            "cursor": cursor if cursor else "",
        }
        response = await data_api.get(
            endpoint, headers=headers, params={k: v for k, v in query_params.items() if v is not None}
        )

        if response.status_code != expected_status_code:
            raise AssertionError(f"{response.status_code} != {expected_status_code}", response.text)

        if response.status_code != 200:
            return items

        data = response.json()

        assert len(data["items"]) <= limit
        items.extend(data.get("items") or [])

        cursor = data.get("cursor")

        if not cursor and len(data["items"]) >= limit:
            raise Exception("Expected cursor when length of items is greater/equal to limit")

        if pages > page_limit:
            raise Exception("Too many pages, possible issue with cursor/paging")

        if not cursor:
            break

    return items


async def add_iteration(
    data_api,
    organization_id: str,
    overrides: Optional[Dict[str, Any]] = {},
    expected_status_code: Optional[int] = 201,
    headers: Optional[Dict[str, Any]] = {},
):
    data = {
        "title": "Test",
    }
    data.update(**overrides)

    response = await data_api.post(f"{organization_id}/iterations", json=data, headers=headers)

    if response.status_code != expected_status_code:
        raise AssertionError(f"{response.status_code} != {expected_status_code}", response.text)

    return response.json()


async def add_team(
    data_api,
    organization_id: str,
    overrides: Optional[Dict[str, Any]] = {},
    expected_status_code: Optional[int] = 201,
    headers: Optional[Dict[str, Any]] = {},
):
    data = {
        "title": "Test",
    }
    data.update(**overrides)

    response = await data_api.post(f"{organization_id}/teams", json=data, headers=headers)

    if response.status_code != expected_status_code:
        raise AssertionError(f"{response.status_code} != {expected_status_code}", response.text)

    return response.json()


async def add_company(
    data_api: TestClient,
    organization_id: str,
    overrides: Optional[Dict[str, Any]] = {},
    headers: Optional[Dict[str, Any]] = {},
    expected_status_code: Optional[int] = 201,
):
    data = {"name": "company name", "created_by_id": "user_id", "modified_by_id": "user_id"}
    data.update(**overrides)
    response = await data_api.post(f"/{organization_id}/companies", json=data, headers=headers)
    if response.status_code != expected_status_code:
        raise AssertionError(f"{response.status_code} != {expected_status_code}", response.text)

    return response.json()


async def add_feature_list(
    data_api: TestClient,
    organization_id: str,
    overrides: Optional[Dict[str, Any]] = {},
    headers: Optional[Dict[str, Any]] = {},
    expected_status_code: Optional[int] = 201,
):
    data = {
        "title": f"{organization_id}-Feature-List",
        "description": "description",
        "features": [],
    }
    data.update(**overrides)

    response = await data_api.post(f"{organization_id}/feature_lists", json=data, headers=headers)
    if response.status_code != expected_status_code:
        raise AssertionError(f"{response.status_code} != {expected_status_code}", response.text)

    return response.json()
