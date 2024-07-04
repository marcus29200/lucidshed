import pytest
from fastapi.testclient import TestClient

from tests.acceptance.api.utils import add_organization, add_iteration, authenticate, expired_headers, page_results

pytestmark = pytest.mark.asyncio


async def test_should_add_iteration(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)
    iteration = await add_iteration(data_api, organization_id=organization["id"], headers=headers)

    assert iteration["title"] == "Test"


async def test_should_not_add_iteration_with_expired_headers(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)
    await add_iteration(data_api, organization_id=organization["id"], headers=expired_headers, expected_status_code=401)


async def test_should_get_iteration(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)
    iteration = await add_iteration(data_api, organization_id=organization["id"], headers=headers)

    response = await data_api.get(f"{organization['id']}/iterations/{iteration['id']}", headers=headers)
    assert response.status_code == 200

    iteration = response.json()
    assert iteration["title"] == "Test"


async def test_should_not_get_iteration_with_expired_token(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)
    iteration = await add_iteration(data_api, organization_id=organization["id"], headers=headers)

    response = await data_api.get(f"{organization['id']}/iterations/{iteration['id']}", headers=expired_headers)
    assert response.status_code == 401


async def test_should_update_iteration(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)
    iteration = await add_iteration(data_api, organization_id=organization["id"], headers=headers)

    data = {"title": "Test Updated"}
    response = await data_api.patch(f"{organization['id']}/iterations/{iteration['id']}", json=data, headers=headers)

    assert response.status_code == 200
    iteration = response.json()
    assert iteration["title"] == "Test Updated"


async def test_should_not_update_iteration_with_expired_headers(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)
    iteration = await add_iteration(data_api, organization_id=organization["id"], headers=headers)

    data = {"title": "Test Updated"}
    response = await data_api.patch(f"{organization['id']}/iterations/{iteration['id']}", json=data, headers=expired_headers)

    assert response.status_code == 401


async def test_should_delete_iteration(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)
    iteration = await add_iteration(data_api, organization_id=organization["id"], headers=headers)

    response = await data_api.delete(f"{organization['id']}/iterations/{iteration['id']}", headers=headers)
    assert response.status_code == 200

    response = await data_api.get(f"{organization['id']}/iterations/{iteration['id']}", headers=headers)
    assert response.status_code == 404


async def test_should_not_delete_iteration_with_expired_headers(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)
    iteration = await add_iteration(data_api, organization_id=organization["id"], headers=headers)

    response = await data_api.delete(f"{organization['id']}/iterations/{iteration['id']}", headers=expired_headers)
    assert response.status_code == 401

    response = await data_api.get(f"{organization['id']}/iterations/{iteration['id']}", headers=headers)
    assert response.status_code == 200