import asyncio

import pytest

from app.api.settings import settings
from tests.acceptance.api.utils import add_engineering_item, add_iteration, authenticate

pytestmark = pytest.mark.asyncio


async def _test_search_for_engineering_items(data_api, opensearch_enabled):
    org, user, headers = await authenticate(data_api)

    await add_engineering_item(data_api, org["id"], {"title": "Story", "assigned_to_id": user["id"]}, headers=headers)
    await add_engineering_item(data_api, org["id"], {"title": "Testing", "assigned_to_id": user["id"]}, headers=headers)
    iteration = await add_iteration(data_api, org["id"], headers=headers)
    await add_engineering_item(
        data_api, org["id"], {"title": "Story with iteration", "iteration_id": iteration["id"]}, headers=headers
    )

    await asyncio.sleep(1)

    response = await data_api.post(
        f"{org['id']}/search",
        json={"query": {"match": {"title": "Story"}}},
        headers=headers,
    )
    assert response.status_code == 200

    data = response.json()

    assert len(data["items"]) == 2
    assert data["items"][0]["title"] == "Story"

    response = await data_api.post(
        f"{org['id']}/search",
        json={"query": {"match": {"iteration_id": iteration["id"]}}},
        headers=headers,
    )
    assert response.status_code == 200

    data = response.json()

    assert len(data["items"]) == 1
    assert data["items"][0]["title"] == "Story with iteration"


async def _test_search_for_updated_engineering_item(data_api, opensearch_enabled):
    org, user, headers = await authenticate(data_api)

    item = await add_engineering_item(
        data_api, org["id"], {"title": "Story", "assigned_to_id": user["id"]}, headers=headers
    )

    await asyncio.sleep(1)

    response = await data_api.post(
        f"{org['id']}/search",
        json={"query": {"match": {"title": "Story"}}},
        headers=headers,
    )
    assert response.status_code == 200

    data = response.json()

    assert len(data["items"]) == 1
    assert data["items"][0]["title"] == "Story"

    await data_api.patch(
        f"{org['id']}/engineering/{item['id']}",
        json={"title": "New Story"},
        headers=headers,
    )

    await asyncio.sleep(1)

    response = await data_api.post(
        f"{org['id']}/search",
        json={"query": {"match": {"title": "New Story"}}},
        headers=headers,
    )
    assert response.status_code == 200

    data = response.json()

    assert len(data["items"]) == 1
    assert data["items"][0]["title"] == "New Story"


async def _test_search_engineering_item_assigned_to_specific_user_by_first_name(data_api, opensearch_enabled):
    org, user, headers = await authenticate(data_api)

    await add_engineering_item(data_api, org["id"], {"title": "Story", "assigned_to_id": user["id"]}, headers=headers)

    await asyncio.sleep(1)

    response = await data_api.post(
        f"{org['id']}/search",
        json={"query": {"match": {"assigned_to.first_name": "Test"}}},
        headers=headers,
    )
    assert response.status_code == 200

    data = response.json()

    assert len(data["items"]) == 1
    assert data["items"][0]["title"] == "Story"

    response = await data_api.post(
        f"{org['id']}/search",
        json={"query": {"match": {"assigned_to.first_name": "Marcus"}}},
        headers=headers,
    )
    assert response.status_code == 200

    data = response.json()

    assert len(data["items"]) == 0


async def _test_search_with_async_indexing(data_api, opensearch_enabled):
    settings.opensearch_async_indexing = True

    org, user, headers = await authenticate(data_api)

    await add_engineering_item(data_api, org["id"], {"title": "Story", "assigned_to_id": user["id"]}, headers=headers)

    await asyncio.sleep(1)

    response = await data_api.post(
        f"{org['id']}/search",
        json={"query": {"match": {"title": "Story"}}},
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data["items"]) == 1
    assert data["items"][0]["title"] == "Story"


async def _test_search_doesnt_work_with_indexing_disabled(data_api):
    org, user, headers = await authenticate(data_api)

    await add_engineering_item(data_api, org["id"], {"title": "Story", "assigned_to_id": user["id"]}, headers=headers)

    await asyncio.sleep(1)

    response = await data_api.post(
        f"{org['id']}/search",
        json={"query": {"match": {"title": "Story"}}},
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data["items"]) == 0
