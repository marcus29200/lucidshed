from typing import Optional

import pytest

from app.database.work_items.controllers.support_item import WorkItemSortableField
from app.database.work_items.models.support_item import BaseSupportItem, SupportItem, SupportItemStatus
from app.exceptions.common import ObjectNotFoundException
from tests.acceptance.database.organizations.controllers.test_organizations import create_organization
from tests.acceptance.database.utils import page_results

pytestmark = pytest.mark.asyncio


async def create_support_item(
    data_app,
    org_id,
    status: Optional[SupportItemStatus] = SupportItemStatus.NEW.value,
    title: Optional[str] = "Test",
) -> SupportItem:
    base_support_item = BaseSupportItem(
        title=title,
        description="Test description",
        status=status,
    )

    support_item = await data_app.support_controller.create(
        organization_id=org_id, new_item=base_support_item, current_user="test@test.com"
    )

    assert support_item.id

    return support_item


async def test_add_support_work_item(data_app):
    org = await create_organization(data_app)
    support_item = await create_support_item(data_app, org.id)

    assert isinstance(support_item, SupportItem)

    assert support_item.title == "Test"
    assert support_item.description == "Test description"
    assert support_item.created_at
    assert support_item.modified_at
    assert support_item.status == SupportItemStatus.NEW


async def test_add_support_work_item_defaults_status_to_valid_value(data_app):
    org = await create_organization(data_app)
    support_item = await create_support_item(data_app, org.id, status=None)

    assert isinstance(support_item, SupportItem)

    assert support_item.id
    assert support_item.title == "Test"
    assert support_item.description == "Test description"
    assert support_item.created_at
    assert support_item.modified_at
    assert support_item.status == SupportItemStatus.NEW


async def test_add_history_item_to_support_work_item(data_app):
    org = await create_organization(data_app)
    support_item = await create_support_item(data_app, org.id)

    assert support_item.id

    history_items = await data_app.history_controller.get_all(
        organization_id=org.id, item_id=support_item.id, item_type="support"
    )

    assert len(history_items) == 1
    assert history_items[0].item_id == str(support_item.id)
    assert history_items[0].item_type == "support"
    assert history_items[0].action == "create"
    assert history_items[0].metadata["title"] == "Test"


async def test_get_support_work_item(data_app):
    org = await create_organization(data_app)
    support_item = await create_support_item(data_app, org.id)

    support_item = await data_app.support_controller.get(organization_id=org.id, id=support_item.id)

    assert support_item.id


async def test_get_support_work_item_raises_not_found_exception(data_app):
    org = await create_organization(data_app)

    with pytest.raises(ObjectNotFoundException):
        await data_app.support_controller.get(organization_id=org.id, id=0)


# TODO Fix
async def _test_get_all_support_work_item(data_app):
    org = await create_organization(data_app)
    await create_support_item(data_app, org.id)
    await create_support_item(data_app, org.id)

    items = await page_results(data_app.support_controller, organization_id=org.id, limit=1)

    assert len(items) == 2
    assert isinstance(items[0], SupportItem)
    assert isinstance(items[1], SupportItem)


# TODO Fix
async def _test_get_all_support_work_item_paging(data_app):
    org = await create_organization(data_app)
    await create_support_item(data_app, org.id)
    await create_support_item(data_app, org.id)

    items = await page_results(data_app.support_controller, organization_id=org.id, limit=1)

    assert len(items) == 2
    assert isinstance(items[0], SupportItem)
    assert items[0].id != items[1].id


# NOTE This test is out of order right now because we don't have the sort param fully implemented
async def _test_get_all_support_work_item_paging_sorting(data_app):
    org = await create_organization(data_app)
    await create_support_item(data_app, org.id, title="Test2")
    await create_support_item(data_app, org.id, title="Test1")

    items = await page_results(
        data_app.support_controller, organization_id=org.id, sort=WorkItemSortableField.TITLE, page_size=1
    )

    assert len(items) == 2
    assert items[0].title == "Test1"
    assert items[1].title == "Test2"


async def test_update_support_work_item(data_app):
    org = await create_organization(data_app)
    support_item = await create_support_item(data_app, org.id)

    support_item.title = "Test Updated"
    assert support_item.modified_at
    old_modified_at = support_item.modified_at

    support_item = await data_app.support_controller.update(
        organization_id=org.id,
        id=support_item.id,
        updated_item=support_item,
        current_user="test@test.com",
    )

    assert support_item.title == "Test Updated"
    assert support_item.description == "Test description"
    assert support_item.modified_at > old_modified_at


async def test_delete_support_work_item(data_app):
    org = await create_organization(data_app)
    support_item = await create_support_item(data_app, org.id)

    result = await data_app.support_controller.delete(
        organization_id=support_item.organization_id, id=support_item.id, current_user="test@test.com", scope="SUPPORT"
    )

    assert result is True


async def test_delete_support_work_item_fails_when_doesnt_exist(data_app):
    org = await create_organization(data_app)

    with pytest.raises(ObjectNotFoundException):
        await data_app.support_controller.delete(
            organization_id=org.id, id=0, current_user="test@test.com", scope="SUPPORT"
        )
