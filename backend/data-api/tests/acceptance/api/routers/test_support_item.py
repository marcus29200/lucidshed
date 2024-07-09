from typing import Any, Dict, Optional

import pytest
from fastapi.testclient import TestClient

from app.database.work_items.models.support_item import SupportItemStatus
from tests.acceptance.api.routers.test_organization import add_organization
from tests.acceptance.api.utils import page_results

pytestmark = pytest.mark.asyncio


async def add_support_item(
    data_api: TestClient,
    org_id: str,
    overrides: Optional[Dict[str, Any]] = {},
    expected_status_code: Optional[int] = 201,
):
    data = {
        "title": "test",
        "description": "test description",
        "priority": "high",
    }
    data.update(**overrides)

    response = await data_api.post(f"{org_id}/support", json=data)

    assert response.status_code == expected_status_code

    return response.json()


async def test_should_add_support_item(data_api: TestClient):
    org = await add_organization(data_api)
    support_item = await add_support_item(data_api, org["id"])

    assert support_item["id"] > 0
    assert support_item["title"] == "test"
    assert support_item["description"] == "test description"
    assert support_item["priority"] == "high"
    assert support_item["status"] == SupportItemStatus.NEW
    assert support_item["created_at"]
    assert support_item["created_by_id"] == "test@test.com"
    assert support_item["modified_at"]
    assert support_item["modified_by_id"] == "test@test.com"


async def test_should_add_support_item_pending_status(data_api: TestClient):
    org = await add_organization(data_api)
    support_item = await add_support_item(data_api, org["id"], {"status": SupportItemStatus.PENDING})

    assert support_item["id"] > 0
    assert support_item["status"] == SupportItemStatus.PENDING


async def test_should_fail_to_add_invalid_support_item_status(data_api: TestClient):
    org = await add_organization(data_api)
    response = await add_support_item(data_api, org["id"], {"status": "Invalid"}, expected_status_code=422)

    assert response["detail"][0]["loc"] == ["body", "status"]
    assert response["detail"][0]["msg"] == "Input should be 'new', 'open', 'pending' or 'on-hold'"


async def test_should_add_support_item_with_created_by_override(data_api: TestClient):
    org = await add_organization(data_api)
    support_item = await add_support_item(data_api, org["id"], {"created_by_id": "test2@test.com"})

    assert support_item["id"] > 0
    assert support_item["created_by_id"] == "test2@test.com"


async def test_should_get_support_item(data_api: TestClient):
    org = await add_organization(data_api)
    item = await add_support_item(data_api, org["id"])

    response = await data_api.get(f"test/support/{item['id']}")
    assert response.status_code == 200

    support_item = response.json()
    assert support_item["id"] == item["id"]


async def test_should_get_support_items(data_api: TestClient):
    org = await add_organization(data_api)
    await add_support_item(data_api, org["id"], overrides={"title": "test1"})
    await add_support_item(data_api, org["id"], overrides={"title": "test2"})

    items = await page_results(data_api, "test/support")

    assert len(items) == 2


async def test_should_get_all_support_item_limit(data_api: TestClient):
    org = await add_organization(data_api)
    await add_support_item(data_api, org["id"], overrides={"title": "test1"})
    await add_support_item(data_api, org["id"], overrides={"title": "test2"})

    items = await page_results(data_api, "test/support", limit=1)

    assert len(items) == 2


# TODO implement later when sorting is better
async def _test_should_get_all_support_item_with_sort(data_api: TestClient):
    org = await add_organization(data_api)
    await add_support_item(data_api, org["id"], overrides={"title": "test2"})
    await add_support_item(data_api, org["id"], overrides={"title": "test1"})

    items = await page_results(data_api, limit=1)

    assert len(items) == 2
    assert items[0]["id"] == "test1"
    assert items[1]["id"] == "test2"


async def test_should_not_get_support_item(data_api: TestClient):
    org = await add_organization(data_api)

    response = await data_api.get(f"{org['id']}/support/0")
    assert response.status_code == 404


async def test_should_update_support_item(data_api: TestClient):
    org = await add_organization(data_api)
    item = await add_support_item(data_api, org["id"])

    response = await data_api.patch(f"test/support/{item['id']}", json={"title": "Test Updated"})
    assert response.status_code == 200

    item = response.json()
    assert item["title"] == "Test Updated"


async def test_should_delete_support_item(data_api: TestClient):
    org = await add_organization(data_api)
    item = await add_support_item(data_api, org["id"])

    response = await data_api.delete(f"test/support/{item['id']}")
    assert response.status_code == 200

    response = await data_api.get(f"test/support/{item['id']}")
    assert response.status_code == 404
