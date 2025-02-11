import pytest
from fastapi.testclient import TestClient

from tests.acceptance.api.utils import add_company, add_organization, authenticate, expired_headers

pytestmark = pytest.mark.asyncio


async def test_should_add_company(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)
    company = await add_company(data_api, organization["id"], headers=headers)

    assert company["name"] == "company name"


async def test_should_not_add_company_with_expired_headers(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)
    await add_company(data_api, organization["id"], headers=expired_headers, expected_status_code=401)


async def test_should_get_company_by_id(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)
    company = await add_company(data_api, organization["id"], headers=headers)

    response = await data_api.get(f"/{organization['id']}/companies/{company['id']}", headers=headers)
    assert response.status_code == 200

    fetched_company = response.json()
    assert fetched_company["name"] == "company name"


async def test_should_get_company_by_id_not_found(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)

    response = await data_api.get(f"/{organization['id']}/companies/999999", headers=headers)
    assert response.status_code == 404


async def test_should_get_all_companies(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)
    await add_company(data_api, organization["id"], headers=headers)

    response = await data_api.get(f"/{organization['id']}/companies", headers=headers)
    assert response.status_code == 200

    companies = response.json()
    assert len(companies) >= 1


async def test_should_get_company_by_name(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)
    company = await add_company(data_api, organization["id"], headers=headers)

    response = await data_api.get(f"/{organization['id']}/companies/name/{company['name']}", headers=headers)
    assert response.status_code == 200

    fetched_company = response.json()
    assert fetched_company["name"] == "company name"


async def test_should_get_one_company_by_name(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)
    company = await add_company(data_api, organization["id"], headers=headers)

    company = await add_company(data_api, organization["id"], {"name": organization["id"]+"1"}, headers=headers)

    response = await data_api.get(f"/{organization['id']}/companies/name/{company['name']}", headers=headers)
    assert response.status_code == 200

    fetched_company = response.json()
    assert fetched_company["name"] == organization["id"]+"1"


async def test_should_update_company(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)
    company = await add_company(data_api, organization["id"], headers=headers)

    update_data = {"name": "Updated Company"}
    response = await data_api.patch(
        f"/{organization['id']}/companies/{company['id']}", json=update_data, headers=headers
    )
    assert response.status_code == 200

    updated_company = response.json()
    assert updated_company["name"] == "Updated Company"


async def test_should_delete_company(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)
    company = await add_company(data_api, organization["id"], headers=headers)

    response = await data_api.delete(f"/{organization['id']}/companies/{company['id']}", headers=headers)
    assert response.status_code == 200

    response = await data_api.get(f"/{organization['id']}/companies/{company['id']}", headers=headers)
    assert response.status_code == 404


async def test_should_not_get_company_with_expired_token(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)
    company = await add_company(data_api, organization["id"], headers=headers)

    response = await data_api.get(f"/{organization['id']}/companies/{company['id']}", headers=expired_headers)
    assert response.status_code == 401
