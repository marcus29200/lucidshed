import asyncio

import pytest

from tests.acceptance.api.utils import add_engineering_item, add_iteration, authenticate

pytestmark = pytest.mark.asyncio


async def test_search_for_engineering_items(data_api):
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
