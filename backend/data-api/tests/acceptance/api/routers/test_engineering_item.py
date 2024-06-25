from typing import Any, Dict, Optional

import pytest
from fastapi.testclient import TestClient

from app.database.work_items.models.engineering_item import EngineeringItemType
from tests.acceptance.api.routers.test_organization import add_organization

pytestmark = pytest.mark.asyncio


async def add_engineering_item(
    data_api: TestClient,
    org_id: str,
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

    response = await data_api.post(f"{org_id}/engineering", json=data)

    assert response.status_code == expected_status_code

    return response.json()


async def test_should_add_engineering_item(data_api: TestClient):
    org = await add_organization(data_api)
    engineering_item = await add_engineering_item(data_api, org["id"])

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
    org = await add_organization(data_api)
    engineering_item = await add_engineering_item(data_api, org["id"], {"item_type": EngineeringItemType.EPIC})

    assert engineering_item["id"] > 0
    assert engineering_item["item_type"] == EngineeringItemType.EPIC


async def test_should_fail_to_add_invalid_engineering_item_type(data_api: TestClient):
    org = await add_organization(data_api)
    response = await add_engineering_item(data_api, org["id"], {"item_type": "Invalid"}, expected_status_code=422)

    assert response["detail"][0]["loc"] == ["body", "item_type"]
    assert response["detail"][0]["msg"] == "Input should be 'epic', 'story' or 'task'"


async def test_should_add_engineering_item_with_created_by_override(data_api: TestClient):
    org = await add_organization(data_api)
    engineering_item = await add_engineering_item(data_api, org["id"], {"created_by_id": "test2@test.com"})

    assert engineering_item["id"] > 0
    assert engineering_item["created_by_id"] == "test2@test.com"


async def test_should_get_engineering_item(data_api: TestClient):
    org = await add_organization(data_api)
    item = await add_engineering_item(data_api, org["id"])

    response = await data_api.get(f"test/engineering/{item['id']}")
    assert response.status_code == 200

    engineering_item = response.json()
    assert engineering_item["id"] == item["id"]


async def test_should_get_all_engineering_item(data_api: TestClient):
    org = await add_organization(data_api)
    await add_engineering_item(data_api, org["id"], overrides={"title": "test1"})
    await add_engineering_item(data_api, org["id"], overrides={"title": "test2"})

    response = await data_api.get(f"test/engineering")
    assert response.status_code == 200

    engineering_items = response.json()
    assert len(engineering_items) == 2


async def test_should_get_all_engineering_item_limit(data_api: TestClient):
    org = await add_organization(data_api)
    await add_engineering_item(data_api, org["id"], overrides={"title": "test1"})
    await add_engineering_item(data_api, org["id"], overrides={"title": "test2"})

    response = await data_api.get(f"test/engineering?limit=1")
    assert response.status_code == 200

    engineering_items = response.json()
    assert len(engineering_items) == 1
    assert engineering_items[0]["title"] == "test1"


async def test_should_get_all_engineering_item_limit_with_offset(data_api: TestClient):
    org = await add_organization(data_api)
    await add_engineering_item(data_api, org["id"], overrides={"title": "test1"})
    await add_engineering_item(data_api, org["id"], overrides={"title": "test2"})

    response = await data_api.get(f"test/engineering?limit=1&offset=1")
    assert response.status_code == 200

    engineering_items = response.json()
    assert len(engineering_items) == 1
    assert engineering_items[0]["title"] == "test2"


# TODO implement later when sorting is better
async def _test_should_get_all_engineering_item_with_sort(data_api: TestClient):
    org = await add_organization(data_api)
    await add_engineering_item(data_api, org["id"], overrides={"title": "test2"})
    await add_engineering_item(data_api, org["id"], overrides={"title": "test1"})

    response = await data_api.get(f"test/engineering?limit=1&sort=title")
    assert response.status_code == 200

    engineering_items = response.json()
    assert len(engineering_items) == 1
    assert engineering_items[0]["title"] == "test1"


async def test_should_not_get_engineering_item(data_api: TestClient):
    org = await add_organization(data_api)

    response = await data_api.get(f"{org['id']}/engineering/0")
    assert response.status_code == 404


async def test_should_update_engineering_item(data_api: TestClient):
    org = await add_organization(data_api)
    item = await add_engineering_item(data_api, org["id"])

    response = await data_api.patch(f"test/engineering/{item['id']}", json={"title": "Test Updated"})
    assert response.status_code == 200

    item = response.json()
    assert item["title"] == "Test Updated"


async def test_should_delete_engineering_item(data_api: TestClient):
    org = await add_organization(data_api)
    item = await add_engineering_item(data_api, org["id"])

    response = await data_api.delete(f"test/engineering/{item['id']}")
    assert response.status_code == 200

    response = await data_api.get(f"test/engineering/{item['id']}")
    assert response.status_code == 404
