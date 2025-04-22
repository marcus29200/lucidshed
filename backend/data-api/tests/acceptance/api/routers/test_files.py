from os.path import join

import pytest
from fastapi.testclient import TestClient

from app.settings import settings
from tests.acceptance.api.utils import add_organization, authenticate, expired_headers, page_results

pytestmark = pytest.mark.asyncio


async def test_should_add_file(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)

    print(settings.google_client_id)

    response = await data_api.post(f"{organization['id']}/files", json={"file_name": "test"}, headers=headers)
    assert response.status_code == 201

    file = response.json()
    assert file["file_name"] == "test"
    assert file["signed_url"] == "http://test.com/test"
    assert file["path"] == join(settings.gcs_path, organization["id"], file["id"])


async def test_should_not_add_file_with_expired_token(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)

    response = await data_api.post(f"{organization['id']}/files", json={"file_name": "test"}, headers=expired_headers)
    assert response.status_code == 401


async def test_should_get_file(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)

    response = await data_api.post(f"{organization['id']}/files", json={"file_name": "test"}, headers=headers)
    assert response.status_code == 201
    file = response.json()

    response = await data_api.get(f"{organization['id']}/files/{file['id']}", headers=headers)
    assert response.status_code == 200

    file = response.json()
    assert file["file_name"] == "test"
    assert file["signed_url"] == "http://test.com/test"


async def test_should_not_get_file_with_expired_token(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)

    response = await data_api.post(f"{organization['id']}/files", json={"file_name": "test"}, headers=headers)
    assert response.status_code == 201
    file = response.json()

    response = await data_api.get(f"{organization['id']}/files/{file['id']}", headers=expired_headers)
    assert response.status_code == 401


async def test_should_get_files(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)

    response = await data_api.post(f"{organization['id']}/files", json={"file_name": "test"}, headers=headers)
    assert response.status_code == 201

    response = await data_api.post(f"{organization['id']}/files", json={"file_name": "test2"}, headers=headers)
    assert response.status_code == 201

    files = await page_results(data_api, f"{organization['id']}/files", headers=headers)

    assert len(files) == 2
    assert files[0]["id"] != files[1]["id"]


async def test_should_not_get_iterations_with_expired_token(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)

    await page_results(data_api, f"{organization['id']}/files", headers=expired_headers, expected_status_code=401)


async def test_should_delete_file(data_api: TestClient, mock_gcs):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)

    response = await data_api.post(f"{organization['id']}/files", json={"file_name": "test"}, headers=headers)
    assert response.status_code == 201
    file = response.json()

    response = await data_api.delete(f"{organization['id']}/files/{file['id']}", headers=headers)
    assert response.status_code == 200

    response = await data_api.get(f"{organization['id']}/files/{file['id']}", headers=headers)
    assert response.status_code == 404


async def test_should_not_delete_file_with_expired_headers(data_api: TestClient, mock_gcs):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)

    response = await data_api.post(f"{organization['id']}/files", json={"file_name": "test"}, headers=headers)
    assert response.status_code == 201
    file = response.json()

    response = await data_api.delete(f"{organization['id']}/files/{file['id']}", headers=expired_headers)
    assert response.status_code == 401

    response = await data_api.get(f"{organization['id']}/files/{file['id']}", headers=headers)
    assert response.status_code == 200
