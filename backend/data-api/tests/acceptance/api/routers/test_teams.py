import pytest
from fastapi.testclient import TestClient

from tests.acceptance.api.utils import add_team, add_organization, authenticate, expired_headers

pytestmark = pytest.mark.asyncio


async def test_should_add_team(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)
    team = await add_team(data_api, organization_id=organization["id"], headers=headers)

    assert team["title"] == "Test"


async def test_should_not_add_team_with_expired_headers(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)
    await add_team(data_api, organization_id=organization["id"], headers=expired_headers, expected_status_code=401)


async def test_should_get_team(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)
    team = await add_team(data_api, organization_id=organization["id"], headers=headers)

    response = await data_api.get(f"{organization['id']}/teams/{team['id']}", headers=headers)
    assert response.status_code == 200

    team = response.json()
    assert team["title"] == "Test"


async def test_should_not_get_team_with_expired_token(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)
    team = await add_team(data_api, organization_id=organization["id"], headers=headers)

    response = await data_api.get(f"{organization['id']}/teams/{team['id']}", headers=expired_headers)
    assert response.status_code == 401


async def test_should_update_team(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)
    team = await add_team(data_api, organization_id=organization["id"], headers=headers)

    data = {"title": "Test Updated"}
    response = await data_api.patch(f"{organization['id']}/teams/{team['id']}", json=data, headers=headers)

    assert response.status_code == 200
    team = response.json()
    assert team["title"] == "Test Updated"


async def test_should_not_update_team_with_expired_headers(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)
    team = await add_team(data_api, organization_id=organization["id"], headers=headers)

    data = {"title": "Test Updated"}
    response = await data_api.patch(
        f"{organization['id']}/teams/{team['id']}", json=data, headers=expired_headers
    )

    assert response.status_code == 401


async def test_should_delete_team(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)
    team = await add_team(data_api, organization_id=organization["id"], headers=headers)

    response = await data_api.delete(f"{organization['id']}/teams/{team['id']}", headers=headers)
    assert response.status_code == 200

    response = await data_api.get(f"{organization['id']}/teams/{team['id']}", headers=headers)
    assert response.status_code == 404


async def test_should_not_delete_team_with_expired_headers(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)
    team = await add_team(data_api, organization_id=organization["id"], headers=headers)

    response = await data_api.delete(f"{organization['id']}/teams/{team['id']}", headers=expired_headers)
    assert response.status_code == 401

    response = await data_api.get(f"{organization['id']}/teams/{team['id']}", headers=headers)
    assert response.status_code == 200
