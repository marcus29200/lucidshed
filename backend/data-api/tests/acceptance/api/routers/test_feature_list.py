import pytest
from fastapi.testclient import TestClient

from tests.acceptance.api.utils import add_feature_list, add_organization, authenticate, expired_headers

pytestmark = pytest.mark.asyncio


async def test_should_create_or_update_feature_list(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)
    feature_list = await add_feature_list(
        data_api,
        organization["id"],
        headers=headers,
        overrides={
            "description": "Feature List Description"
        })

    assert feature_list["title"] == f"{organization["id"]}-Feature-List"
    assert feature_list["description"] == "Feature List Description"


async def test_should_not_create_or_update_feature_list_with_expired_headers(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)
    await add_feature_list(data_api, organization["id"], headers=expired_headers, expected_status_code=401)


async def test_should_get_one_feature_list(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)
    feature_list = await add_feature_list(
        data_api,
        organization["id"],
        headers=headers,
        overrides={"description": "Feature List Description"}
    )

    response = await data_api.get(f"{organization['id']}/feature_lists/{feature_list['id']}", headers=headers)
    assert response.status_code == 200

    fetched_feature_list = response.json()
    assert fetched_feature_list["id"] == feature_list["id"]
    assert fetched_feature_list["description"] == "Feature List Description"
    assert not fetched_feature_list["features"]


async def test_should_get_all_feature_lists(data_api: TestClient):
    _, _, headers = await authenticate(data_api, create_org=False)
    organization = await add_organization(data_api, headers=headers)
    feature_list_1 = await add_feature_list(data_api, organization["id"], headers=headers)

    response = await data_api.get(f"{organization['id']}/feature_lists", headers=headers)
    assert response.status_code == 200

    fetched_feature_lists = response.json()
    assert len(fetched_feature_lists) >= 2  # Ensure at least two feature lists are returned

    feature_list_ids = [fl["id"] for fl in fetched_feature_lists["items"]]
    assert feature_list_1["id"] in feature_list_ids


async def test_should_link_feature_to_feature_list(data_api: TestClient):
    from tests.acceptance.api.routers.test_features import add_feature

    org, _, headers = await authenticate(data_api)

    feature_list = await add_feature_list(data_api, org["id"], headers=headers)
    feature = await add_feature(data_api, org["id"], headers=headers)

    response = await data_api.post(
        f"{org['id']}/feature_lists/{feature_list['id']}/links",
        json={"feature_id": feature["id"]},
        headers=headers,
    )
    assert response.status_code == 201


# async def test_should_unlink_feature_from_feature_list(data_api: TestClient):
#     from tests.acceptance.api.routers.test_features import add_feature

#     org, _, headers = await authenticate(data_api)

#     feature_list = await add_feature_list(data_api, org["id"], headers=headers)
#     feature = await add_feature(data_api, org["id"], headers=headers)

#     response = await data_api.post(
#         f"{org['id']}/feature_lists/{feature_list['id']}/links",
#         json={"feature_id": feature["id"]},
#         headers=headers,
#     )
#     assert response.status_code == 201

#     response = await data_api.delete(
#         f"{org['id']}/feature_lists/{feature_list['id']}/links",
#         json={"feature_id": feature["id"]},
#         headers=headers,
#     )
#     assert response.status_code == 200


async def test_should_get_all_features_associated_to_feature_list(data_api: TestClient):
    from tests.acceptance.api.routers.test_features import add_feature

    org, _, headers = await authenticate(data_api)

    feature_list = await add_feature_list(data_api, org["id"], headers=headers)
    feature_1 = await add_feature(data_api, org["id"], headers=headers)
    feature_2 = await add_feature(data_api, org["id"], headers=headers)

    response = await data_api.post(
        f"{org['id']}/feature_lists/{feature_list['id']}/links",
        json={"feature_id": feature_1["id"]},
        headers=headers,
    )
    assert response.status_code == 201

    response = await data_api.post(
        f"/{org['id']}/feature_lists/{feature_list['id']}/links",
        json={"feature_id": feature_2["id"]},
        headers=headers,
    )
    assert response.status_code == 201

    response = await data_api.get(
        f"/{org['id']}/feature_lists/{feature_list['id']}",
        headers=headers,
    )
    assert response.status_code == 200
    feature_list = response.json()
    assert feature_list["features"][0] == feature_1["id"]
    assert feature_list["features"][1] == feature_2["id"]
