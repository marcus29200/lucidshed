import pytest
from typing import Optional
from data_api.orm.work_items.models.engineering_item import (
    BaseEngineeringItem,
    EngineeringItem,
    EngineeringItemType,
)
from data_api.orm.work_items.controllers.engineering_item import (
    EngineeringItemController,
)


pytestmark = pytest.mark.asyncio


async def create_engineering_item(
    engineering_item_controller: EngineeringItemController,
    item_type: Optional[EngineeringItemType] = EngineeringItemType.STORY,
) -> EngineeringItem:
    base_engineering_item = BaseEngineeringItem(
        title="Test",
        description="Test description",
        item_type=item_type,
    )

    return engineering_item_controller.create(base_engineering_item)


async def test_add_engineering_work_item(engineering_item_controller):
    engineering_item = await create_engineering_item(engineering_item_controller)

    assert isinstance(engineering_item, EngineeringItem)

    assert engineering_item.title == "Test"
    assert engineering_item.description == "Test description"
    assert engineering_item.created_at
    assert engineering_item.modified_at
    assert engineering_item.item_type == EngineeringItemType.STORY


async def test_add_engineering_work_item_defaults_item_type_to_valid_value(
    engineering_item_controller,
):
    engineering_item = await create_engineering_item(
        engineering_item_controller, item_type=None
    )

    assert isinstance(engineering_item, EngineeringItem)

    assert engineering_item.title == "Test"
    assert engineering_item.description == "Test description"
    assert engineering_item.created_at
    assert engineering_item.modified_at
    assert engineering_item.item_type == EngineeringItemType.STORY
