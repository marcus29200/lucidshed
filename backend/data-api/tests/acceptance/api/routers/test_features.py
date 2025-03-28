from datetime import datetime, timezone
from typing import Any, Dict, Optional

import pytest
from fastapi.testclient import TestClient

from tests.acceptance.api.utils import add_organization, authenticate

pytestmark = pytest.mark.asyncio


async def add_feature(
    data_api: TestClient,
    org_id: str,
    overrides: Optional[Dict[str, Any]] = {},
    expected_status_code: Optional[int] = 201,
    headers: Optional[Dict[str, Any]] = {},
):
    data = {
        "title": "test feature",
        "description": "test feature description",
        "created_by_id": "user_id",
        "created_at": datetime(2023, 10, 1, 0, 0, tzinfo=timezone.utc).isoformat(),  # Ensure timezone-aware datetime
    }
    data.update(**overrides)

    response = await data_api.post(f"{org_id}/features", json=data, headers=headers)

    assert response.status_code == expected_status_code

    return response.json()


async def test_should_create_feature(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    org = await add_organization(data_api, headers=headers)
    feature = await add_feature(data_api, org["id"], headers=headers)

    response = await data_api.get(f"{org['id']}/features/{feature['id']}", headers=headers)
    assert response.status_code == 200

    fetched_feature = response.json()
    assert fetched_feature["id"] == feature["id"]
    assert fetched_feature["title"] == feature["title"]
    assert fetched_feature["description"] == feature["description"]


async def test_should_get_feature_by_id(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    org = await add_organization(data_api, headers=headers)
    feature = await add_feature(data_api, org["id"], headers=headers)

    response = await data_api.get(f"{org['id']}/features/{feature['id']}", headers=headers)
    assert response.status_code == 200
    fetched_feature = response.json()
    assert fetched_feature["id"] == feature["id"]
    assert fetched_feature["title"] == feature["title"]
    assert fetched_feature["description"] == feature["description"]


async def test_should_update_feature(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    org = await add_organization(data_api, headers=headers)
    feature = await add_feature(data_api, org["id"], headers=headers)

    update_data = {"title": "updated title", "description": "updated description"}
    response = await data_api.patch(f"{org['id']}/features/{feature['id']}", json=update_data, headers=headers)
    assert response.status_code == 200
    updated_feature = response.json()
    assert updated_feature["title"] == "updated title"
    assert updated_feature["description"] == "updated description"


async def test_should_delete_feature(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    org = await add_organization(data_api, headers=headers)
    feature = await add_feature(data_api, org["id"], headers=headers)

    response = await data_api.delete(f"{org['id']}/features/{feature['id']}", headers=headers)
    assert response.status_code == 200

    response = await data_api.get(f"{org['id']}/features/{feature['id']}", headers=headers)
    assert response.status_code == 404


async def test_should_list_all_features(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    org = await add_organization(data_api, headers=headers)
    await add_feature(data_api, org["id"], headers=headers)
    await add_feature(data_api, org["id"], headers=headers, overrides={"title": "test feature 2"})

    response = await data_api.get(f"{org['id']}/features", headers=headers)
    assert response.status_code == 200
    features = response.json()
    assert len(features) >= 2  # Ensure at least two features are returned


async def test_should_list_all_linked_feature_requests(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    org = await add_organization(data_api, headers=headers)
    feature = await add_feature(data_api, org["id"], headers=headers)
    response = await data_api.get(f"{org['id']}/features/{feature['id']}", headers=headers)
    assert response.status_code == 200

    response = await data_api.get(f"{org['id']}/features/{feature['id']}/feature-requests", headers=headers)
    assert response.status_code == 404

    from tests.acceptance.api.routers.test_feature_request import add_feature_request

    feature_request = await add_feature_request(data_api, org["id"], headers=headers)

    response = await data_api.post(
        f"{org['id']}/feature_requests/{feature_request['id']}/links",
        json={"feature_id": feature["id"]},
        headers=headers,
    )
    assert response.status_code == 201

    response = await data_api.get(f"{org['id']}/features/{feature['id']}/assigned-requests", headers=headers)
    assert response.status_code == 200
    feature_requests = response.json()
    assert len(feature_requests["items"]) == 1  # Now there should be one linked feature request

    feature_request2 = await add_feature_request(
        data_api, org["id"], headers=headers, overrides={"title": "test feature request 2"}
    )
    response = await data_api.post(
        f"{org['id']}/feature_requests/{feature_request2['id']}/links",
        json={"feature_id": feature["id"]},
        headers=headers,
    )
    assert response.status_code == 201

    # add another feature, but don't link it
    _ = await add_feature_request(data_api, org["id"], headers=headers, overrides={"title": "test feature request 3"})

    response = await data_api.get(f"{org['id']}/features/{feature['id']}/assigned-requests", headers=headers)
    assert response.status_code == 200
    feature_requests = response.json()
    assert len(feature_requests["items"]) == 2  # Now there should be 2 linked feature request


async def test_should_get_feature_request_count(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    org = await add_organization(data_api, headers=headers)
    feature = await add_feature(data_api, org["id"], headers=headers)
    response = await data_api.get(f"{org['id']}/features/{feature['id']}/request-count", headers=headers)
    assert response.status_code == 200
    feature_request_count = response.json()
    assert feature_request_count["count"] == 0  # No linked feature requests yet
    from tests.acceptance.api.routers.test_feature_request import add_feature_request

    feature_request = await add_feature_request(data_api, org["id"], headers=headers)
    response = await data_api.post(
        f"{org['id']}/feature_requests/{feature_request['id']}/links",
        json={"feature_id": feature["id"]},
        headers=headers,
    )
    assert response.status_code == 201
    response = await data_api.get(f"{org['id']}/features/{feature['id']}/request-count", headers=headers)
    assert response.status_code == 200
    feature_request_count = response.json()
    assert feature_request_count["count"] == 1  # One linked feature request
    feature_request2 = await add_feature_request(
        data_api, org["id"], headers=headers, overrides={"title": "test feature request 2"}
    )
    response = await data_api.post(
        f"{org['id']}/feature_requests/{feature_request2['id']}/links",
        json={"feature_id": feature["id"]},
        headers=headers,
    )
    assert response.status_code == 201
    response = await data_api.get(f"{org['id']}/features/{feature['id']}/request-count", headers=headers)
    assert response.status_code == 200
    feature_request_count = response.json()
    assert feature_request_count["count"] == 2  # Now there should be 2 linked feature request
    # add another feature, but don't link it
    _ = await add_feature_request(data_api, org["id"], headers=headers, overrides={"title": "test feature request 3"})
    response = await data_api.get(f"{org['id']}/features/{feature['id']}/request-count", headers=headers)
    assert response.status_code == 200
    feature_request_count = response.json()
    assert feature_request_count["count"] == 2  # Still should be 2 linked feature request
