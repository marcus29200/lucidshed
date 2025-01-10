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

    assert feature_list["title"] == "Feature List"
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


async def test_should_get_feature_list(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)
    _ = await add_feature_request(data_api, organization["id"], headers=headers)
    feature_list = await add_feature_list(data_api, organization["id"], headers=headers)

    assert feature_list["requests"] == 1
    assert feature_list["reach"] == 4
    assert feature_list["impact"] == 3
    assert feature_list["confidence"] == 2
    assert feature_list["effort"] == 1
    assert feature_list["growth"] == 4


async def test_should_associate_feature_request_with_feature_list(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)
    feature_request = await add_feature_request(data_api, organization["id"], headers=headers)
    feature_list = await add_feature_list(
        data_api, organization["id"], headers=headers, overrides={"feature_requests": [feature_request["id"]]}
    )

    assert feature_request["id"] in feature_list["feature_requests"]
