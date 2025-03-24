from typing import Any, Dict, Optional

import pytest
from fastapi.testclient import TestClient

from app.database.work_items.models.support_item import SupportItemStatus
from tests.acceptance.api.routers.test_organization import add_organization
from tests.acceptance.api.utils import authenticate, page_results

pytestmark = pytest.mark.asyncio


async def add_support_item(
    data_api: TestClient,
    org_id: str,
    overrides: Optional[Dict[str, Any]] = {},
    expected_status_code: Optional[int] = 201,
    headers: Optional[Dict[str, Any]] = {},
):
    data = {
        "title": "test",
        "description": "test description",
        "priority": "high",
    }
    data.update(**overrides)

    response = await data_api.post(f"{org_id}/support", json=data, headers=headers)

    assert response.status_code == expected_status_code

    return response.json()


async def test_should_add_support_item(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    org = await add_organization(data_api, headers=headers)
    support_item = await add_support_item(data_api, org["id"], headers=headers)

    assert support_item["id"]
    assert support_item["title"] == "test"
    assert support_item["description"] == "test description"
    assert support_item["priority"] == "high"
    assert support_item["status"] == SupportItemStatus.NEW
    assert support_item["created_at"]
    assert support_item["created_by_id"]
    assert support_item["modified_at"]
    assert support_item["modified_by_id"]


async def test_should_add_support_item_pending_status(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    org = await add_organization(data_api, headers=headers)
    support_item = await add_support_item(data_api, org["id"], {"status": SupportItemStatus.PENDING}, headers=headers)

    assert support_item["id"]
    assert support_item["status"] == SupportItemStatus.PENDING


async def test_should_fail_to_add_invalid_support_item_status(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    org = await add_organization(data_api, headers=headers)
    response = await add_support_item(
        data_api, org["id"], {"status": "Invalid"}, expected_status_code=422, headers=headers
    )

    assert response["detail"][0]["loc"] == ["body", "status"]
    assert response["detail"][0]["msg"] == "Input should be 'new', 'open', 'pending' or 'on-hold'"


async def test_should_add_support_item_with_created_by_override(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    org = await add_organization(data_api, headers=headers)
    support_item = await add_support_item(data_api, org["id"], {"created_by_id": "test2@test.com"}, headers=headers)

    assert support_item["id"]
    assert support_item["created_by_id"] == "test2@test.com"


async def test_should_add_support_item_to_get_history(data_api: TestClient):
    org, user, headers = await authenticate(data_api)

    support_item = await add_support_item(data_api, org["id"], headers=headers)

    response = await data_api.get(f"{org['id']}/support/{support_item['id']}/history", headers=headers)
    assert response.status_code == 200

    history = response.json()
    assert len(history) == 1
    assert history[0]["item_id"] == str(support_item["id"])
    assert history[0]["created_by_id"] == user["id"]
    assert history[0]["created_at"]
    assert history[0]["modified_at"]
    assert history[0]["modified_by_id"] == user["id"]


async def test_should_get_support_item(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    org = await add_organization(data_api, headers=headers)
    item = await add_support_item(data_api, org["id"], headers=headers)

    response = await data_api.get(f"{data_api.test_org_id}/support/{item['id']}", headers=headers)
    assert response.status_code == 200

    support_item = response.json()
    assert support_item["id"] == item["id"]


async def _test_should_get_support_items(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    org = await add_organization(data_api, headers=headers)
    await add_support_item(data_api, org["id"], overrides={"title": "test1"}, headers=headers)
    await add_support_item(data_api, org["id"], overrides={"title": "test2"}, headers=headers)

    items = await page_results(data_api, f"{data_api.test_org_id}/support", headers=headers)

    assert len(items) == 2


async def _test_should_get_all_support_item_limit(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    org = await add_organization(data_api, headers=headers)
    await add_support_item(data_api, org["id"], overrides={"title": "test1"}, headers=headers)
    await add_support_item(data_api, org["id"], overrides={"title": "test2"}, headers=headers)

    items = await page_results(data_api, f"{data_api.test_org_id}/support", limit=1, headers=headers)

    assert len(items) == 2


# TODO implement later when sorting is better
async def _test_should_get_all_support_item_with_sort(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    org = await add_organization(data_api, headers=headers)
    await add_support_item(data_api, org["id"], overrides={"title": "test2"}, headers=headers)
    await add_support_item(data_api, org["id"], overrides={"title": "test1"}, headers=headers)

    items = await page_results(data_api, limit=1, headers=headers)

    assert len(items) == 2
    assert items[0]["id"] == "test1"
    assert items[1]["id"] == "test2"


async def test_should_not_get_support_item(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    org = await add_organization(data_api, headers=headers)

    response = await data_api.get(f"{org['id']}/support/0", headers=headers)
    assert response.status_code == 404


async def test_should_update_support_item(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    org = await add_organization(data_api, headers=headers)
    item = await add_support_item(data_api, org["id"], headers=headers)

    response = await data_api.patch(
        f"{data_api.test_org_id}/support/{item['id']}", json={"title": "Test Updated"}, headers=headers
    )
    assert response.status_code == 200

    item = response.json()
    assert item["title"] == "Test Updated"


async def test_should_delete_support_item(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    org = await add_organization(data_api, headers=headers)
    item = await add_support_item(data_api, org["id"], headers=headers)

    response = await data_api.delete(f"{data_api.test_org_id}/support/{item['id']}", headers=headers)
    assert response.status_code == 200

    response = await data_api.get(f"{data_api.test_org_id}/support/{item['id']}", headers=headers)
    assert response.status_code == 404
