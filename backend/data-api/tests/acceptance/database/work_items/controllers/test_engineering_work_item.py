from typing import Optional

import pytest

from app.database.work_items.controllers.engineering_item import WorkItemSortableField
from app.database.work_items.models.engineering_item import BaseEngineeringItem, EngineeringItem, EngineeringItemType
from app.exceptions.common import ObjectNotFoundException
from tests.acceptance.database.organizations.controllers.test_organizations import create_organization

pytestmark = pytest.mark.asyncio


async def create_engineering_item(
    data_app,
    org_id,
    item_type: Optional[EngineeringItemType] = EngineeringItemType.STORY.value,
    title: Optional[str] = "Test",
) -> EngineeringItem:
    base_engineering_item = BaseEngineeringItem(
        title=title,
        description="Test description",
        item_type=item_type,
    )

    engineering_item = await data_app.engineering_controller.create(
        organization_id=org_id, new_engineering_item=base_engineering_item, current_user="test@test.com"
    )

    assert engineering_item.id

    return engineering_item


async def test_add_engineering_work_item(data_app):
    org = await create_organization(data_app)
    engineering_item = await create_engineering_item(data_app, org.id)

    assert isinstance(engineering_item, EngineeringItem)

    assert engineering_item.title == "Test"
    assert engineering_item.description == "Test description"
    assert engineering_item.created_at
    assert engineering_item.modified_at
    assert engineering_item.item_type == EngineeringItemType.STORY


async def test_add_engineering_work_item_defaults_item_type_to_valid_value(data_app):
    org = await create_organization(data_app)
    engineering_item = await create_engineering_item(data_app, org.id, item_type=None)

    assert isinstance(engineering_item, EngineeringItem)

    assert engineering_item.id
    assert engineering_item.title == "Test"
    assert engineering_item.description == "Test description"
    assert engineering_item.created_at
    assert engineering_item.modified_at
    assert engineering_item.item_type == EngineeringItemType.STORY


async def test_get_engineering_work_item(data_app):
    org = await create_organization(data_app)
    engineering_item = await create_engineering_item(data_app, org.id)

    engineering_item = await data_app.engineering_controller.get(organization_id="test", id=engineering_item.id)

    assert engineering_item.id


async def test_get_engineering_work_item_raises_not_found_exception(data_app):
    with pytest.raises(ObjectNotFoundException):
        await data_app.engineering_controller.get(organization_id="test", id=0)


async def test_get_all_engineering_work_item(data_app):
    org = await create_organization(data_app)
    await create_engineering_item(data_app, org.id)
    await create_engineering_item(data_app, org.id)

    engineering_items, cursor = await data_app.engineering_controller.get_all(organization_id="test")

    assert len(engineering_items) == 2
    assert isinstance(engineering_items[0], EngineeringItem)
    assert isinstance(engineering_items[1], EngineeringItem)

    assert cursor is None


async def page_results(data_app, sort: Optional[str] = WorkItemSortableField.ID, limit: Optional[int] = 1000):
    limit = 100
    pages = 0
    items = []
    cursor = None

    while True:
        engineering_items, cursor = await data_app.engineering_controller.get_all(
            organization_id="test", sort=sort, limit=limit, cursor=cursor
        )
        items.extend(engineering_items)

        if pages > limit:
            raise Exception("Too many pages, possible issue with cursor/paging")

        if not cursor:
            break

    return items


async def test_get_all_engineering_work_item_paging(data_app):
    org = await create_organization(data_app)
    await create_engineering_item(data_app, org.id)
    await create_engineering_item(data_app, org.id)

    items = await page_results(data_app, page_size=1)

    assert len(items) == 2
    assert isinstance(items[0], EngineeringItem)
    assert items[0].id != items[1].id


# NOTE This test is out of order right now because we don't have the sort param fully implemented
async def _test_get_all_engineering_work_item_paging_sorting(data_app):
    org = await create_organization(data_app)
    await create_engineering_item(data_app, org.id, title="Test2")
    await create_engineering_item(data_app, org.id, title="Test1")

    items = await page_results(data_app, sort=WorkItemSortableField.TITLE, page_size=1)

    assert len(items) == 2
    assert items[0].title == "Test1"
    assert items[1].title == "Test2"


async def test_update_engineering_work_item(data_app):
    org = await create_organization(data_app)
    engineering_item = await create_engineering_item(data_app, org.id)

    engineering_item.title = "Test Updated"
    assert engineering_item.modified_at
    old_modified_at = engineering_item.modified_at

    engineering_item = await data_app.engineering_controller.update(
        organization_id="test",
        id=engineering_item.id,
        updated_engineering_item=engineering_item,
        current_user="test@test.com",
    )

    assert engineering_item.title == "Test Updated"
    assert engineering_item.description == "Test description"
    assert engineering_item.modified_at > old_modified_at


async def test_delete_engineering_work_item(data_app):
    org = await create_organization(data_app)
    engineering_item = await create_engineering_item(data_app, org.id)

    result = await data_app.engineering_controller.delete(
        organization_id=engineering_item.organization_id,
        id=engineering_item.id,
        current_user="test@test.com",
    )

    assert result is True


async def test_delete_engineering_work_item_fails_when_doesnt_exist(data_app):
    with pytest.raises(ObjectNotFoundException):
        await data_app.engineering_controller.delete(organization_id="t", id=0, current_user="test@test.com")
