import pytest
from fastapi.testclient import TestClient
from data_api.orm.work_items.models.engineering_item import EngineeringItemType
from typing import Any, Dict, Optional

pytestmark = pytest.mark.asyncio


async def add_engineering_item(
    data_api: TestClient, overrides: Optional[Dict[str, Any]] = {}
):
    data = {
        "title": "test",
        "description": "test description",
        "status": "done",
        "priority": "high",
    }
    data.update(**overrides)

    response = await data_api.post("/engineeringItem", json=data)

    assert response.status_code == 201

    return response.json()


async def test_should_add_engineering_item(data_api: TestClient):
    engineering_item = await add_engineering_item(data_api)

    assert engineering_item["id"] > 0
    assert engineering_item["title"] == "test"
    assert engineering_item["description"] == "test description"
    assert engineering_item["status"] == "done"
    assert engineering_item["priority"] == "high"
    assert engineering_item["item_type"] == EngineeringItemType.STORY
    assert engineering_item["created_at"]
    assert engineering_item["created_by_id"] == "test@test.com"
    assert engineering_item["modified_at"]
    assert engineering_item["modified_by_id"] == "test@test.com"


async def test_should_add_engineering_item_epic_type(data_api: TestClient):
    engineering_item = await add_engineering_item(
        data_api, {"item_type": EngineeringItemType.EPIC}
    )

    assert engineering_item["id"] > 0
    assert engineering_item["item_type"] == EngineeringItemType.EPIC


async def test_should_add_engineering_item_with_created_by_override(
    data_api: TestClient,
):
    engineering_item = await add_engineering_item(
        data_api, {"created_by_id": "test2@test.com"}
    )

    assert engineering_item["id"] > 0
    assert engineering_item["created_by_id"] == "test2@test.com"
