from typing import Any, Dict, Optional

import pytest
from fastapi.testclient import TestClient

from app.database.work_items.models.engineering_item import EngineeringItemType, EngineeringLinkType
from tests.acceptance.api.utils import add_iteration, authenticate, expired_headers, page_results

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


async def test_should_add_engineering_item_with_estimated_completion_date_in_iso_format_with_timezone(
    data_api: TestClient,
):
    org, _, headers = await authenticate(data_api)

    engineering_item = await add_engineering_item(
        data_api, org["id"], {"estimated_completion_date": "2021-01-01T00:00:00+00:00"}, headers=headers
    )

    assert engineering_item["id"] > 0
    assert engineering_item["estimated_completion_date"] == "2021-01-01T00:00:00Z"


async def test_should_add_engineering_item_with_iteration(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    iteration = await add_iteration(data_api, org["id"], headers=headers)
    engineering_item = await add_engineering_item(
        data_api, org["id"], {"iteration_id": iteration["id"]}, headers=headers
    )

    assert engineering_item["id"] > 0
    assert engineering_item["iteration_id"] == iteration["id"]
    assert engineering_item["iteration"]["id"] == iteration["id"]


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


async def test_should_add_engineering_item_to_get_history(data_api: TestClient):
    org, user, headers = await authenticate(data_api)

    engineering_item = await add_engineering_item(data_api, org["id"], headers=headers)

    response = await data_api.get(f"{org['id']}/engineering/{engineering_item['id']}/history", headers=headers)
    assert response.status_code == 200

    history = response.json()
    assert len(history) == 1
    assert history[0]["item_id"] == str(engineering_item["id"])
    assert history[0]["created_by_id"] == user["id"]
    assert history[0]["created_at"]
    assert history[0]["modified_at"]
    assert history[0]["modified_by_id"] == user["id"]


async def test_should_get_engineering_item(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    item = await add_engineering_item(data_api, org["id"], headers=headers)

    response = await data_api.get(f"{data_api.test_org_id}/engineering/{item['id']}", headers=headers)
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

    response = await data_api.get(f"{data_api.test_org_id}/engineering/{item['id']}", headers=expired_headers)
    assert response.status_code == 401


async def test_get_engineering_item_should_include_iteration_details(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    iteration = await add_iteration(data_api, org["id"], headers=headers)
    item = await add_engineering_item(data_api, org["id"], {"iteration_id": iteration["id"]}, headers=headers)

    response = await data_api.get(f"{data_api.test_org_id}/engineering/{item['id']}", headers=headers)
    assert response.status_code == 200

    engineering_item = response.json()
    assert engineering_item["iteration"]["id"] == iteration["id"]


async def test_should_get_engineering_items(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    await add_engineering_item(data_api, org["id"], overrides={"title": "test1"}, headers=headers)
    await add_engineering_item(data_api, org["id"], overrides={"title": "test2"}, headers=headers)

    items = await page_results(
        data_api, f"{data_api.test_org_id}/engineering", item_type=EngineeringItemType.STORY.value, headers=headers
    )

    assert len(items) == 2


async def test_should_get_all_engineering_item_limit(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    await add_engineering_item(data_api, org["id"], overrides={"title": "test1"}, headers=headers)
    await add_engineering_item(data_api, org["id"], overrides={"title": "test2"}, headers=headers)

    items = await page_results(
        data_api,
        f"{data_api.test_org_id}/engineering",
        item_type=EngineeringItemType.STORY.value,
        limit=1,
        headers=headers,
    )

    assert len(items) == 2


async def test_should_get_all_engineering_item_with_iteration_id(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    iteration = await add_iteration(data_api, org["id"], headers=headers)
    await add_engineering_item(
        data_api, org["id"], overrides={"title": "test2", "iteration_id": iteration["id"]}, headers=headers
    )

    items = await page_results(
        data_api,
        f"{data_api.test_org_id}/engineering",
        item_type=EngineeringItemType.STORY.value,
        iteration_id=iteration["id"],
        headers=headers,
    )

    assert len(items) == 1


async def test_should_get_epics(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    await add_engineering_item(data_api, org["id"], overrides={"title": "test1"}, headers=headers)
    await add_engineering_item(
        data_api, org["id"], overrides={"title": "test2", "item_type": EngineeringItemType.EPIC.value}, headers=headers
    )

    items = await page_results(
        data_api, f"{data_api.test_org_id}/engineering", item_type=EngineeringItemType.EPIC.value, headers=headers
    )

    assert len(items) == 1


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

    items = await page_results(
        data_api, f"{data_api.test_org_id}engineering", headers=expired_headers, expected_status_code=401
    )

    assert len(items) == 0


async def test_should_update_engineering_item(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    item = await add_engineering_item(data_api, org["id"], headers=headers)

    response = await data_api.patch(
        f"{data_api.test_org_id}/engineering/{item['id']}", json={"title": "Test Updated"}, headers=headers
    )
    assert response.status_code == 200

    item = response.json()
    assert item["title"] == "Test Updated"


async def test_should_not_update_engineering_item_with_expired_token(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    item = await add_engineering_item(data_api, org["id"], headers=headers)

    response = await data_api.patch(
        f"{data_api.test_org_id}/engineering/{item['id']}", json={"title": "Test Updated"}, headers=expired_headers
    )
    assert response.status_code == 401

    response = await data_api.get(f"{data_api.test_org_id}/engineering/{item['id']}", headers=headers)
    item = response.json()
    assert item["title"] != "Test Updated"


async def test_should_delete_engineering_item(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    item = await add_engineering_item(data_api, org["id"], headers=headers)

    response = await data_api.delete(f"{data_api.test_org_id}/engineering/{item['id']}", headers=headers)
    assert response.status_code == 200

    response = await data_api.get(f"{data_api.test_org_id}/engineering/{item['id']}", headers=headers)
    assert response.status_code == 404


async def test_should_not_delete_engineering_item_with_expired_token(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    item = await add_engineering_item(data_api, org["id"], headers=headers)

    response = await data_api.delete(f"{data_api.test_org_id}/engineering/{item['id']}", headers=expired_headers)
    assert response.status_code == 401

    response = await data_api.get(f"{data_api.test_org_id}/engineering/{item['id']}", headers=headers)
    assert response.status_code == 200


async def test_should_link_story_to_epic(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    epic = await add_engineering_item(
        data_api, org["id"], {"title": "Epic", "item_type": EngineeringItemType.EPIC.value}, headers=headers
    )
    story = await add_engineering_item(
        data_api, org["id"], {"title": "Story", "item_type": EngineeringItemType.STORY.value}, headers=headers
    )

    response = await data_api.post(
        f"{data_api.test_org_id}/engineering/{epic['id']}/links",
        json={"item_id": story["id"], "link_type": EngineeringLinkType.SUBTASK.value},
        headers=headers,
    )
    assert response.status_code == 201


@pytest.mark.parametrize("link_type", [link_type.value for link_type in EngineeringLinkType])
async def test_should_link_items_together_with_different_types(data_api: TestClient, link_type: str):
    org, _, headers = await authenticate(data_api)

    story1 = await add_engineering_item(
        data_api, org["id"], {"title": "Story1", "item_type": EngineeringItemType.STORY.value}, headers=headers
    )
    story2 = await add_engineering_item(
        data_api, org["id"], {"title": "Story2", "item_type": EngineeringItemType.STORY.value}, headers=headers
    )

    response = await data_api.post(
        f"{data_api.test_org_id}/engineering/{story1['id']}/links",
        json={"item_id": story2["id"], "link_type": link_type},
        headers=headers,
    )
    assert response.status_code == 201


async def test_should_get_linked_stories(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    story1 = await add_engineering_item(
        data_api, org["id"], {"title": "Story1", "item_type": EngineeringItemType.STORY.value}, headers=headers
    )
    story2 = await add_engineering_item(
        data_api, org["id"], {"title": "Story2", "item_type": EngineeringItemType.STORY.value}, headers=headers
    )

    response = await data_api.post(
        f"{data_api.test_org_id}/engineering/{story1['id']}/links",
        json={"item_id": story2["id"], "link_type": EngineeringLinkType.RELATED.value},
        headers=headers,
    )
    assert response.status_code == 201

    response = await data_api.get(f"{data_api.test_org_id}/engineering?related_item_id={story1['id']}", headers=headers)
    assert response.status_code == 200

    data = response.json()
    assert len(data["items"]) == 1
    assert data["items"][0]["id"] == story2["id"]


async def test_should_add_comment_to_story(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    story = await add_engineering_item(
        data_api, org["id"], {"title": "Story", "item_type": EngineeringItemType.STORY.value}, headers=headers
    )

    response = await data_api.post(
        f"{data_api.test_org_id}/engineering/{story['id']}/comments",
        json={"comment": "Test Comment"},
        headers=headers,
    )
    assert response.status_code == 201

    comment = response.json()
    assert comment["comment"] == "Test Comment"
    assert comment["item_id"] == story["id"]
    assert comment["created_by_id"] == data_api.test_user_id


async def test_should_not_add_comment_to_story_with_expired_token(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    story = await add_engineering_item(
        data_api, org["id"], {"title": "Story", "item_type": EngineeringItemType.STORY.value}, headers=headers
    )

    response = await data_api.post(
        f"{data_api.test_org_id}/engineering/{story['id']}/comments",
        json={"comment": "Test Comment"},
        headers=expired_headers,
    )
    assert response.status_code == 401


async def test_should_not_add_comment_to_story_with_invalid_token(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    story = await add_engineering_item(
        data_api, org["id"], {"title": "Story", "item_type": EngineeringItemType.STORY.value}, headers=headers
    )

    response = await data_api.post(
        f"{data_api.test_org_id}/engineering/{story['id']}/comments", json={"comment": "Test Comment"}, headers={},
    )
    assert response.status_code == 401


async def test_should_get_comment_for_story(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    story = await add_engineering_item(
        data_api, org["id"], {"title": "Story", "item_type": EngineeringItemType.STORY.value}, headers=headers
    )

    comment = await data_api.post(
        f"{data_api.test_org_id}/engineering/{story['id']}/comments",
        json={"comment": "Test Comment"},
        headers=headers,
    )

    response = await data_api.get(
        f"{data_api.test_org_id}/engineering/{story['id']}/comments/{comment['id']}", headers=headers
    )
    assert response.status_code == 200

    comment = response.json()
    assert comment["comment"] == "Test Comment"
    assert comment["item_id"] == story["id"]
    assert comment["created_by_id"] == data_api.test_user_id


async def test_should_get_comments_for_story(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    story = await add_engineering_item(
        data_api, org["id"], {"title": "Story", "item_type": EngineeringItemType.STORY.value}, headers=headers
    )

    await data_api.post(
        f"{data_api.test_org_id}/engineering/{story['id']}/comments",
        json={"comment": "Test Comment"},
        headers=headers,
    )

    response = await data_api.get(f"{data_api.test_org_id}/engineering/{story['id']}/comments", headers=headers)
    assert response.status_code == 200

    comments = response.json()
    assert len(comments) == 1
    assert comments[0]["comment"] == "Test Comment"
    assert comments[0]["item_id"] == story["id"]
    assert comments[0]["created_by_id"] == data_api.test_user_id


async def test_should_not_get_comments_for_story_with_expired_token(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    story = await add_engineering_item(
        data_api, org["id"], {"title": "Story", "item_type": EngineeringItemType.STORY.value}, headers=headers
    )

    await data_api.post(
        f"{data_api.test_org_id}/engineering/{story['id']}/comments",
        json={"comment": "Test Comment"},
        headers=headers,
    )

    response = await data_api.get(f"{data_api.test_org_id}/engineering/{story['id']}/comments", headers=expired_headers)
    assert response.status_code == 401


async def test_should_not_get_comments_for_story_with_invalid_token(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    story = await add_engineering_item(
        data_api, org["id"], {"title": "Story", "item_type": EngineeringItemType.STORY.value}, headers=headers
    )

    await data_api.post(
        f"{data_api.test_org_id}/engineering/{story['id']}/comments",
        json={"comment": "Test Comment"},
        headers=headers,
    )

    response = await data_api.get(f"{data_api.test_org_id}/engineering/{story['id']}/comments", headers={})
    assert response.status_code == 401


async def test_should_delete_comment_for_story(data_api: TestClient):
    org, _, headers = await authenticate(data_api)

    story = await add_engineering_item(
        data_api, org["id"], {"title": "Story", "item_type": EngineeringItemType.STORY.value}, headers=headers
    )

    comment = await data_api.post(
        f"{data_api.test_org_id}/engineering/{story['id']}/comments",
        json={"comment": "Test Comment"},
        headers=headers,
    )

    response = await data_api.delete(
        f"{data_api.test_org_id}/engineering/{story['id']}/comments/{comment['id']}", headers=headers
    )
    assert response.status_code == 200

    response = await data_api.get(
        f"{data_api.test_org_id}/engineering/{story['id']}/comments/{comment['id']}", headers=headers
    )
    assert response.status_code == 404