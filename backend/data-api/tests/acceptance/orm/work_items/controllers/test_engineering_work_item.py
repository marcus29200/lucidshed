from typing import Optional

import pytest

from data_api.exceptions.common import ObjectNotFoundException
from data_api.orm.work_items.controllers.engineering_item import EngineeringController
from data_api.orm.work_items.models.engineering_item import BaseEngineeringItem, EngineeringItem, EngineeringItemType

pytestmark = pytest.mark.asyncio


async def create_engineering_item(
    engineering_controller: EngineeringController,
    item_type: Optional[EngineeringItemType] = EngineeringItemType.STORY.value,
) -> EngineeringItem:
    base_engineering_item = BaseEngineeringItem(
        title="Test",
        description="Test description",
        item_type=item_type,
    )

    engineering_item = await engineering_controller.create(base_engineering_item)

    assert engineering_item.id

    return engineering_item


async def test_add_engineering_work_item(engineering_controller):
    engineering_item = await create_engineering_item(engineering_controller)

    assert isinstance(engineering_item, EngineeringItem)

    assert engineering_item.title == "Test"
    assert engineering_item.description == "Test description"
    assert engineering_item.created_at
    assert engineering_item.modified_at
    assert engineering_item.item_type == EngineeringItemType.STORY


async def test_add_engineering_work_item_defaults_item_type_to_valid_value(
    engineering_controller,
):
    engineering_item = await create_engineering_item(engineering_controller, item_type=None)

    assert isinstance(engineering_item, EngineeringItem)

    assert engineering_item.id
    assert engineering_item.title == "Test"
    assert engineering_item.description == "Test description"
    assert engineering_item.created_at
    assert engineering_item.modified_at
    assert engineering_item.item_type == EngineeringItemType.STORY


async def test_get_engineering_work_item(
    engineering_controller: EngineeringController,
):
    engineering_item = await create_engineering_item(engineering_controller)

    engineering_item = await engineering_controller.get(organization_id="test", id=engineering_item.id)

    assert engineering_item.id


async def test_get_engineering_work_item_raises_not_found_exception(
    engineering_controller: EngineeringController,
):
    with pytest.raises(ObjectNotFoundException):
        await engineering_controller.get(organization_id="test", id=0)


async def test_update_engineering_work_item(
    engineering_controller: EngineeringController,
):
    engineering_item = await create_engineering_item(engineering_controller)

    engineering_item.title = "Test Updated"
    assert engineering_item.modified_at
    old_modified_at = engineering_item.modified_at

    engineering_item = await engineering_controller.update(engineering_item)

    assert engineering_item.title == "Test Updated"
    assert engineering_item.description == "Test description"
    assert engineering_item.modified_at > old_modified_at


async def test_delete_engineering_work_item(
    engineering_controller: EngineeringController,
):
    engineering_item = await create_engineering_item(engineering_controller)

    result = await engineering_controller.delete(
        organization_id=engineering_item.organization_id, id=engineering_item.id
    )

    assert result is True


async def test_delete_engineering_work_item_fails_when_doesnt_exist(
    engineering_controller: EngineeringController,
):
    with pytest.raises(ObjectNotFoundException):
        await engineering_controller.delete(organization_id="t", id=0)
