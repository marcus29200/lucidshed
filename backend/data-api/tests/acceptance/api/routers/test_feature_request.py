from typing import Any, Dict, Optional
from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient

from tests.acceptance.api.utils import add_organization, authenticate

pytestmark = pytest.mark.asyncio


async def add_feature_request(
    data_api: TestClient,
    org_id: str,
    overrides: Optional[Dict[str, Any]] = {},
    expected_status_code: Optional[int] = 201,
    headers: Optional[Dict[str, Any]] = {},
):
    data = {
        "title": "test feature",
        "description": "test feature description",
        "submitted_by_id": "user_id",
        "submitted_date": datetime(
            2023, 10, 1, 0, 0, tzinfo=timezone.utc
        ).isoformat(),  # Ensure timezone-aware datetime
    }
    data.update(**overrides)

    response = await data_api.post(f"{org_id}/feature_requests", json=data, headers=headers)

    assert response.status_code == expected_status_code

    return response.json()


async def test_should_add_feature_request(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    org = await add_organization(data_api, headers=headers)
    feature_request = await add_feature_request(data_api, org["id"], headers=headers)

    assert feature_request["id"] > 0
    assert feature_request["title"] == "test feature"
    assert feature_request["description"] == "test feature description"

    assert feature_request["created_at"]
    assert feature_request["created_by_id"]
    assert feature_request["modified_at"]
    assert feature_request["modified_by_id"]


async def test_should_get_feature_requests(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    org = await add_organization(data_api, headers=headers)
    await add_feature_request(data_api, org["id"], headers=headers)

    response = await data_api.get(f"{org['id']}/feature_requests", headers=headers)
    assert response.status_code == 200
    feature_requests = response.json()
    assert len(feature_requests) > 0


async def test_should_get_feature_request_by_id(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    org = await add_organization(data_api, headers=headers)
    feature_request = await add_feature_request(data_api, org["id"], headers=headers)

    response = await data_api.get(f"{org['id']}/feature_requests/{feature_request['id']}", headers=headers)
    assert response.status_code == 200
    fetched_feature_request = response.json()
    assert fetched_feature_request["id"] == feature_request["id"]


async def test_should_update_feature_request(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    org = await add_organization(data_api, headers=headers)
    feature_request = await add_feature_request(data_api, org["id"], headers=headers)

    update_data = {"title": "updated title", "description": "updated description"}
    response = await data_api.patch(
        f"{org['id']}/feature_requests/{feature_request['id']}", json=update_data, headers=headers
    )
    assert response.status_code == 200
    updated_feature_request = response.json()
    assert updated_feature_request["title"] == "updated title"
    assert updated_feature_request["description"] == "updated description"


async def test_should_delete_feature_request(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    org = await add_organization(data_api, headers=headers)
    feature_request = await add_feature_request(data_api, org["id"], headers=headers)

    response = await data_api.delete(f"{org['id']}/feature_requests/{feature_request['id']}", headers=headers)
    assert response.status_code == 200

    response = await data_api.get(f"{org['id']}/feature_requests/{feature_request['id']}", headers=headers)
    assert response.status_code == 404


async def test_should_get_comments_for_feature_request(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    feature_request = await add_feature_request(data_api, org["id"], headers=headers)

    response = await data_api.post(
        f"{org['id']}/feature_requests/{feature_request['id']}/comments",
        json={"description": "Test Comment"},
        headers=headers,
    )
    assert response.status_code == 201

    response = await data_api.post(
        f"{org['id']}/feature_requests/{feature_request['id']}/comments",
        json={"description": "Test Comment 2"},
        headers=headers,
    )
    assert response.status_code == 201

    response = await data_api.get(f"{org['id']}/feature_requests/{feature_request['id']}/comments", headers=headers)
    assert response.status_code == 200

    comments = response.json()

    assert comments["cursor"] is None  # TODO implement pagination

    assert len(comments["items"]) == 2
    assert comments["items"][0]["description"] == "Test Comment"
    assert comments["items"][1]["description"] == "Test Comment 2"


async def test_should_get_comment_for_feature_request(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    feature_request = await add_feature_request(data_api, org["id"], headers=headers)

    response = await data_api.post(
        f"{org['id']}/feature_requests/{feature_request['id']}/comments",
        json={"description": "Test Comment"},
        headers=headers,
    )
    assert response.status_code == 201
    comments = response.json()

    response = await data_api.get(
        f"{org['id']}/feature_requests/{feature_request['id']}/comments/{comments['id']}",
        headers=headers
    )
    assert response.status_code == 200
    comment = response.json()
    assert comment["description"] == "Test Comment"


async def test_should_delete_comment_for_feature_request(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    feature_request = await add_feature_request(data_api, org["id"], headers=headers)

    response = await data_api.post(
        f"{org['id']}/feature_requests/{feature_request['id']}/comments",
        json={"description": "Test Comment"},
        headers=headers,
    )
    assert response.status_code == 201
    comment = response.json()

    response = await data_api.delete(
        f"{org['id']}/feature_requests/{feature_request['id']}/comments/{comment['id']}", headers=headers
    )
    assert response.status_code == 200

    response = await data_api.get(
        f"{org['id']}/feature_requests/{feature_request['id']}/comments/{comment['id']}", headers=headers
    )
    assert response.status_code == 404


async def test_should_link_feature_request_to_feature(data_api: TestClient):
    from tests.acceptance.api.routers.test_features import add_feature

    org, _, headers = await authenticate(data_api)

    feature_request = await add_feature_request(data_api, org["id"], headers=headers)
    feature = await add_feature(data_api, org["id"], headers=headers)

    response = await data_api.post(
        f"{org['id']}/feature_requests/{feature_request['id']}/links",
        json={"feature_id": feature["id"]},
        headers=headers,
    )
    assert response.status_code == 201
