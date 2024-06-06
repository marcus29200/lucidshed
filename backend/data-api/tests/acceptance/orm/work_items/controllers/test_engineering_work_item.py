import pytest
import pytest_asyncio
from typing import Optional
from data_api.api.settings import Settings
from data_api.database.database import DatabaseController
from data_api.orm.work_items.models.engineering_item import (
    BaseEngineeringItem,
    EngineeringItem,
    EngineeringItemType,
)
from data_api.orm.work_items.controllers.engineering_item import (
    EngineeringItemController,
)
from data_api.exceptions.common import ObjectNotFoundException


pytestmark = pytest.mark.asyncio


async def create_engineering_item(
    engineering_item_controller: EngineeringItemController,
    item_type: Optional[EngineeringItemType] = EngineeringItemType.STORY.value,
) -> EngineeringItem:
    base_engineering_item = BaseEngineeringItem(
        title="Test",
        description="Test description",
        item_type=item_type,
    )

    # NOTE: This is an async generator for some reason
    return await engineering_item_controller.create(base_engineering_item)


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


async def test_get_engineering_work_item(
    engineering_item_controller: EngineeringItemController,
):
    engineering_item = await create_engineering_item(engineering_item_controller)

    assert engineering_item.id

    engineering_item = await engineering_item_controller.get(
        organization_id="test", id=engineering_item.id
    )

    assert engineering_item.id


async def test_get_engineering_work_item_raises_not_found_exception(
    engineering_item_controller: EngineeringItemController,
):
    with pytest.raises(ObjectNotFoundException):
        await engineering_item_controller.get(organization_id="test", id=0)
