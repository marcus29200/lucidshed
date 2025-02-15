import pytest
from fastapi.testclient import TestClient

from tests.acceptance.api.routers.test_feature_request import add_feature_request
from tests.acceptance.api.utils import add_feature_list, add_organization, authenticate, expired_headers

pytestmark = pytest.mark.asyncio


async def test_should_create_or_update_feature_list(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)
    _ = await add_feature_request(data_api, organization["id"], headers=headers)
    feature_list = await add_feature_list(data_api, organization["id"], headers=headers)

    assert feature_list["title"] == f"{organization["id"]}-Feature-List"
    assert feature_list["description"] == "Feature List Description"
    assert feature_list["requests"] == 1
    assert feature_list["reach"] == 4
    assert feature_list["impact"] == 3
    assert feature_list["confidence"] == 2
    assert feature_list["effort"] == 1
    assert feature_list["growth"] == 4


async def test_should_not_create_or_update_feature_list_with_expired_headers(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)
    await add_feature_list(data_api, organization["id"], headers=expired_headers, expected_status_code=401)


async def test_should_get_one_feature_list(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)
    _ = await add_feature_request(data_api, organization["id"], headers=headers)
    feature_list = await add_feature_list(data_api, organization["id"], headers=headers)

    response = await data_api.get(f"{organization['id']}/feature_lists/{feature_list['id']}", headers=headers)
    assert response.status_code == 200

    fetched_feature_list = response.json()
    assert fetched_feature_list["requests"] == 1
    assert fetched_feature_list["reach"] == 4
    assert fetched_feature_list["impact"] == 3
    assert fetched_feature_list["confidence"] == 2
    assert fetched_feature_list["effort"] == 1
    assert fetched_feature_list["growth"] == 4


async def test_should_associate_feature_request_with_feature_list(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)
    feature_request = await add_feature_request(data_api, organization["id"], headers=headers)
    feature_request_2 = await add_feature_request(data_api, organization["id"], headers=headers)
    feature_list = await add_feature_list(
        data_api,
        organization["id"],
        headers=headers,
        overrides={"feature_requests": [feature_request["id"], feature_request_2["id"]]}
    )

    assert feature_request["id"] in feature_list["feature_requests"]
    assert feature_request_2["id"] in feature_list["feature_requests"]


async def test_should_get_all_feature_lists(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)
    _ = await add_feature_request(data_api, organization["id"], headers=headers)
    feature_list_1 = await add_feature_list(data_api, organization["id"], headers=headers)

    response = await data_api.get(f"{organization['id']}/feature_lists", headers=headers)
    assert response.status_code == 200

    fetched_feature_lists = response.json()
    assert len(fetched_feature_lists) >= 2  # Ensure at least two feature lists are returned

    feature_list_ids = [fl["id"] for fl in fetched_feature_lists["items"]]
    assert feature_list_1["id"] in feature_list_ids


async def test_should_get_one_feature_list_by_title(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)
    _ = await add_feature_request(data_api, organization["id"], headers=headers)
    feature_list = await add_feature_list(data_api, organization["id"], headers=headers)

    response = await data_api.get(f"{organization['id']}/feature_lists?title={feature_list['title']}", headers=headers)
    assert response.status_code == 200

    fetched_feature_list = response.json()
    for item in fetched_feature_list["items"]:
        assert item["title"] == f"{organization['id']}-Feature-List"
        assert item["requests"] == 1
        assert item["reach"] == 4
        assert item["impact"] == 3
        assert item["confidence"] == 2
        assert item["effort"] == 1
        assert item["growth"] == 4
        assert item["feature_requests"] == feature_list["feature_requests"]


async def test_should_associate_existing_feature_request_with_feature_list(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)
    feature_request = await add_feature_request(data_api, organization["id"], headers=headers)
    feature_list = await add_feature_list(data_api, organization["id"], headers=headers)

    # Associate the existing feature request with the feature list
    response = await data_api.patch(
        f"{organization['id']}/feature_requests/{feature_request['id']}",
        json={"feature_list_id": feature_list["id"]},
        headers=headers
    )
    assert response.status_code == 200

    # Verify the association
    response = await data_api.get(f"{organization['id']}/feature_lists/{feature_list['id']}", headers=headers)
    assert response.status_code == 200

    fetched_feature_list = response.json()
    assert feature_request["id"] in fetched_feature_list["feature_requests"]
