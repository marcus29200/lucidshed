from typing import Any, Dict, Optional
from fastapi.testclient import TestClient


expired_headers = {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWJqZWN0IjoidGVzdEB0ZXN0LmNvbSIsInNjb3BlcyI6W10sImV4cCI6MTcxOTU4ODc5Mi4zNjUxN30.15fa1fwuhx-FQLHPzbxOmZ35afvyxzJYFs6c-cIt_o4"  # noqa
}


async def add_organization(
    data_api: TestClient,
    headers: Optional[Dict[str, str]] = {},
    overrides: Optional[Dict[str, Any]] = {},
    expected_status_code: Optional[int] = 201,
):
    data = {"id": "test", "title": "Test"}
    data.update(**overrides)

    response = await data_api.post("", json=data, headers=headers)

    assert response.status_code == expected_status_code

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
    assert response.status_code == 200

    return response.json()


async def authenticate(data_api, user_email: Optional[str] = "test@test.com", create_org: bool = True):
    user = await add_user(data_api, {"email": user_email})

    response = await data_api.post("auth/login", json={"username": user_email, "password": "test", "scopes": []})
    headers = {"Authorization": f"Bearer {response.json()['access_token']}"}

    org = None
    if create_org:
        org = await add_organization(data_api, headers=headers)

    return org, user, headers


async def add_user(
    data_api: TestClient,
    overrides: Optional[Dict[str, Any]] = {},
    expected_status_code: Optional[int] = 201,
    headers: Optional[Dict[str, Any]] = {},
):
    data = {
        "first_name": "Test",
        "last_name": "Tester",
        "title": "Engineer",
        "team": "Operations",
        "phone": "123-456-7890",
        "location": "USA",
        "timezone": "EST",
        "bio": "I am an engineer",
        "picture": "SGVsbG8sIHdvcmxkIQ==",
        "password": "test",
    }
    data.update(**overrides)

    response = await data_api.post("users", json=data, headers=headers)

    assert response.status_code == expected_status_code

    return response.json()


async def page_results(
    data_api,
    endpoint,
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
        response = await data_api.get(
            f"{endpoint}?sort={sort if sort else 'id'}&limit={limit}&cursor={cursor if cursor else ''}", headers=headers
        )
        assert response.status_code == expected_status_code

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
