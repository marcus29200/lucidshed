import pytest

from app.database.files.models.file import File
from tests.acceptance.database.organizations.controllers.test_organizations import create_organization
from tests.acceptance.database.utils import create_file, page_results
from unittest.mock import patch, Mock

pytestmark = pytest.mark.asyncio


async def test_add_file(data_app, mock_gcs):
    organization = await create_organization(data_app)
    file = await create_file(data_app, organization.id)

    assert isinstance(file, File)

    mock_gcs.call_count == 4


async def test_add_file_fails_to_add_to_gcs(data_app, mock_gcs):
    organization = await create_organization(data_app)
    mock_gcs.side_effect = Exception("Test Exception")

    with pytest.raises(Exception):
        await create_file(data_app, organization.id)

    mock_gcs.call_count == 2

    # check that the file was not added to the database
    files = await data_app.file_controller.get_all(organization_id=organization.id)

    assert len(files) == 0


async def test_get_file(data_app, mock_gcs):
    organization = await create_organization(data_app)
    file = await create_file(data_app, organization.id)

    file = await data_app.file_controller.get(organization_id=organization.id, id=file.id)

    assert file.id


async def test_get_all_file(data_app, mock_gcs):
    organization = await create_organization(data_app)
    await create_file(data_app, organization.id)
    await create_file(data_app, organization.id, overrides={"title": "Test 2"})

    files = await data_app.file_controller.get_all(organization_id=organization.id)

    assert len(files) == 2


async def _test_get_all_files_paging(data_app, mock_gcs):
    organization = await create_organization(data_app)
    await create_file(data_app, organization.id)
    await create_file(data_app, organization.id, overrides={"title": "Test 2"})

    items = await page_results(data_app.file_controller, organization_id=organization.id, limit=1)

    assert len(items) == 2
    assert items[0].id != items[1].id


# async def test_update_file(data_app, mock_gcs):
#     organization = await create_organization(data_app)
#     file = await create_file(data_app, organization.id)

#     file.title = "Test Updated"
#     file = await data_app.file_controller.update(
#         organization_id=organization.id, id=file.id, updated_file=file, current_user="test@test.com"
#     )

#     assert file.title == "Test Updated"


async def test_delete_file(data_app, mock_gcs):
    organization = await create_organization(data_app)
    file = await create_file(data_app, organization.id)

    result = await data_app.file_controller.delete(
        organization_id=organization.id, id=file.id, current_user="test@test.com"
    )

    assert result

    mock_gcs.call_count == 8
