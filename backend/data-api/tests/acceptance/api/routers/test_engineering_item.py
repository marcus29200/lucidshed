from typing import Any, Dict, Optional

import pytest
from fastapi.testclient import TestClient

from app.database.work_items.models.engineering_item import EngineeringItemType

pytestmark = pytest.mark.asyncio


async def add_engineering_item(
    data_api: TestClient,
    overrides: Optional[Dict[str, Any]] = {},
    expected_status_code: Optional[int] = 201,
):
    data = {
        "title": "test",
        "description": "test description",
        "status": "done",
        "priority": "high",
    }
    data.update(**overrides)

    response = await data_api.post("/engineeringItem", json=data)

    assert response.status_code == expected_status_code

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
    engineering_item = await add_engineering_item(data_api, {"item_type": EngineeringItemType.EPIC})

    assert engineering_item["id"] > 0
    assert engineering_item["item_type"] == EngineeringItemType.EPIC


async def test_should_fail_to_add_invalid_engineering_item_type(data_api: TestClient):
    response = await add_engineering_item(data_api, {"item_type": "Invalid"}, expected_status_code=422)

    assert response["detail"][0]["loc"] == ["body", "item_type"]
    assert response["detail"][0]["msg"] == "Input should be 'epic', 'story' or 'task'"


async def test_should_add_engineering_item_with_created_by_override(
    data_api: TestClient,
):
    engineering_item = await add_engineering_item(data_api, {"created_by_id": "test2@test.com"})

    assert engineering_item["id"] > 0
    assert engineering_item["created_by_id"] == "test2@test.com"


async def test_should_get_engineering_item(data_api: TestClient):
    item = await add_engineering_item(data_api)
    assert item["id"] > 0

    response = await data_api.get(f"/engineeringItem/{item['id']}")
    assert response.status_code == 200

    engineering_item = response.json()
    assert engineering_item["id"] == item["id"]


async def test_should_not_get_engineering_item(data_api: TestClient):
    response = await data_api.get("/engineeringItem/0")
    assert response.status_code == 404
