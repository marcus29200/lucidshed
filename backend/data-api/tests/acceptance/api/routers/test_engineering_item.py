from typing import Any, Dict, Optional

import pytest
from fastapi.testclient import TestClient

from app.database.work_items.models.engineering_item import EngineeringItemType
from tests.acceptance.api.routers.test_organization import add_organization
from tests.acceptance.api.utils import authenticate, expired_headers, page_results

pytestmark = pytest.mark.asyncio


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
    }
    data.update(**overrides)

    response = await data_api.post(f"{org_id}/engineering", json=data, headers=headers)

    assert response.status_code == expected_status_code

    return response.json()


async def test_should_add_engineering_item(data_api: TestClient):
    org, user, headers = await authenticate(data_api)

    engineering_item = await add_engineering_item(data_api, org["id"], headers=headers)

    assert engineering_item["id"] > 0
    assert engineering_item["title"] == "test"
    assert engineering_item["description"] == "test description"
    assert engineering_item["status"] == "done"
    assert engineering_item["priority"] == "high"
    assert engineering_item["item_type"] == EngineeringItemType.STORY
    assert engineering_item["created_at"]
    assert engineering_item["created_by_id"] == user["id"]
    assert engineering_item["modified_at"]
    assert engineering_item["modified_by_id"] == user["id"]


async def test_should_add_engineering_item_epic_type(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    engineering_item = await add_engineering_item(
        data_api, org["id"], {"item_type": EngineeringItemType.EPIC}, headers=headers
    )

    assert engineering_item["id"] > 0
    assert engineering_item["item_type"] == EngineeringItemType.EPIC


async def test_should_fail_to_add_invalid_engineering_item_type(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    response = await add_engineering_item(
        data_api, org["id"], {"item_type": "Invalid"}, expected_status_code=422, headers=headers
    )

    assert response["detail"][0]["loc"] == ["body", "item_type"]
    assert response["detail"][0]["msg"] == "Input should be 'epic', 'story' or 'task'"


async def test_should_add_engineering_item_with_created_by_override(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    engineering_item = await add_engineering_item(
        data_api, org["id"], {"created_by_id": "test2@test.com"}, headers=headers
    )

    assert engineering_item["id"] > 0
    assert engineering_item["created_by_id"] == "test2@test.com"


async def test_should_not_add_engineering_item_with_expired_token(data_api: TestClient):
    org, _, _ = await authenticate(data_api)

    await add_engineering_item(
        data_api, org["id"], {"created_by_id": "test2@test.com"}, headers=expired_headers, expected_status_code=401
    )


async def test_should_not_add_engineering_item_without_token(data_api: TestClient):
    org, _, _ = await authenticate(data_api)

    await add_engineering_item(
        data_api, org["id"], {"created_by_id": "test2@test.com"}, headers={}, expected_status_code=401
    )


async def test_should_get_engineering_item(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    item = await add_engineering_item(data_api, org["id"], headers=headers)

    response = await data_api.get(f"test/engineering/{item['id']}", headers=headers)
    assert response.status_code == 200

    engineering_item = response.json()
    assert engineering_item["id"] == item["id"]


async def test_should_not_get_engineering_item(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    response = await data_api.get(f"{org['id']}/engineering/0", headers=headers)
    assert response.status_code == 404


async def test_should_not_get_engineering_item_with_expired_token(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    item = await add_engineering_item(data_api, org["id"], headers=headers)

    response = await data_api.get(f"test/engineering/{item['id']}", headers=expired_headers)
    assert response.status_code == 401


async def test_should_get_engineering_items(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    await add_engineering_item(data_api, org["id"], overrides={"title": "test1"}, headers=headers)
    await add_engineering_item(data_api, org["id"], overrides={"title": "test2"}, headers=headers)

    items = await page_results(data_api, "test/engineering", headers=headers)

    assert len(items) == 2


async def test_should_get_all_engineering_item_limit(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    await add_engineering_item(data_api, org["id"], overrides={"title": "test1"}, headers=headers)
    await add_engineering_item(data_api, org["id"], overrides={"title": "test2"}, headers=headers)

    items = await page_results(data_api, "test/engineering", limit=1, headers=headers)

    assert len(items) == 2


# TODO implement later when sorting is better
async def _test_should_get_all_engineering_item_with_sort(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    await add_engineering_item(data_api, org["id"], overrides={"title": "test2"}, headers=headers)
    await add_engineering_item(data_api, org["id"], overrides={"title": "test1"}, headers=headers)

    items = await page_results(data_api, limit=1, headers=headers)

    assert len(items) == 2
    assert items[0]["id"] == "test1"
    assert items[1]["id"] == "test2"


async def test_should_not_get_engineering_items_with_expired_token(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    await add_engineering_item(data_api, org["id"], overrides={"title": "test1"}, headers=headers)
    await add_engineering_item(data_api, org["id"], overrides={"title": "test2"}, headers=headers)

    items = await page_results(data_api, "test/engineering", headers=expired_headers, expected_status_code=401)

    assert len(items) == 0


async def test_should_update_engineering_item(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    item = await add_engineering_item(data_api, org["id"], headers=headers)

    response = await data_api.patch(f"test/engineering/{item['id']}", json={"title": "Test Updated"}, headers=headers)
    assert response.status_code == 200

    item = response.json()
    assert item["title"] == "Test Updated"


async def test_should_not_update_engineering_item_with_expired_token(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    item = await add_engineering_item(data_api, org["id"], headers=headers)

    response = await data_api.patch(
        f"test/engineering/{item['id']}", json={"title": "Test Updated"}, headers=expired_headers
    )
    assert response.status_code == 401

    response = await data_api.get(f"test/engineering/{item['id']}", headers=headers)
    item = response.json()
    assert item["title"] != "Test Updated"


async def test_should_delete_engineering_item(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    item = await add_engineering_item(data_api, org["id"], headers=headers)

    response = await data_api.delete(f"test/engineering/{item['id']}", headers=headers)
    assert response.status_code == 200

    response = await data_api.get(f"test/engineering/{item['id']}", headers=headers)
    assert response.status_code == 404


async def test_should_not_delete_engineering_item_with_expired_token(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    item = await add_engineering_item(data_api, org["id"], headers=headers)

    response = await data_api.delete(f"test/engineering/{item['id']}", headers=expired_headers)
    assert response.status_code == 401

    response = await data_api.get(f"test/engineering/{item['id']}", headers=headers)
    assert response.status_code == 200
