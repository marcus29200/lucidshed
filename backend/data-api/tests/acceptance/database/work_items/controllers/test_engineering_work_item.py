from typing import Optional

import pytest

from app.database.work_items.models.engineering_item import BaseEngineeringItem, EngineeringItem, EngineeringItemType
from app.exceptions.common import ObjectNotFoundException
from tests.acceptance.database.organizations.controllers.test_organizations import create_organization

pytestmark = pytest.mark.asyncio


async def create_engineering_item(
    data_app,
    item_type: Optional[EngineeringItemType] = EngineeringItemType.STORY.value,
) -> EngineeringItem:
    org = await create_organization(data_app)

    base_engineering_item = BaseEngineeringItem(
        title="Test",
        description="Test description",
        item_type=item_type,
    )

    engineering_item = await data_app.engineering_controller.create(
        organization_id=org.id, new_engineering_item=base_engineering_item, current_user="test@test.com"
    )

    assert engineering_item.id

    return engineering_item


async def test_add_engineering_work_item(data_app):
    engineering_item = await create_engineering_item(data_app)

    assert isinstance(engineering_item, EngineeringItem)

    assert engineering_item.title == "Test"
    assert engineering_item.description == "Test description"
    assert engineering_item.created_at
    assert engineering_item.modified_at
    assert engineering_item.item_type == EngineeringItemType.STORY


async def test_add_engineering_work_item_defaults_item_type_to_valid_value(data_app):
    engineering_item = await create_engineering_item(data_app, item_type=None)

    assert isinstance(engineering_item, EngineeringItem)

    assert engineering_item.id
    assert engineering_item.title == "Test"
    assert engineering_item.description == "Test description"
    assert engineering_item.created_at
    assert engineering_item.modified_at
    assert engineering_item.item_type == EngineeringItemType.STORY


async def test_get_engineering_work_item(data_app):
    engineering_item = await create_engineering_item(data_app)

    engineering_item = await data_app.engineering_controller.get(organization_id="test", id=engineering_item.id)

    assert engineering_item.id


async def test_get_engineering_work_item_raises_not_found_exception(data_app):
    with pytest.raises(ObjectNotFoundException):
        await data_app.engineering_controller.get(organization_id="test", id=0)


async def test_update_engineering_work_item(data_app):
    engineering_item = await create_engineering_item(data_app)

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
    engineering_item = await create_engineering_item(data_app)

    result = await data_app.engineering_controller.delete(
        organization_id=engineering_item.organization_id,
        id=engineering_item.id,
        current_user="test@test.com",
    )

    assert result is True


async def test_delete_engineering_work_item_fails_when_doesnt_exist(data_app):
    with pytest.raises(ObjectNotFoundException):
        await data_app.engineering_controller.delete(organization_id="t", id=0, current_user="test@test.com")
