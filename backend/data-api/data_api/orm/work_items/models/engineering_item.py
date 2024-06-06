from data_api.orm.work_items.models.work_item import BaseWorkItem, WorkItem
from enum import StrEnum
from typing import Optional


class EngineeringItemType(StrEnum):
    EPIC: str = "epic"
    STORY: str = "story"
    TASK: str = "task"


class BaseEngineeringItem(BaseWorkItem):
    item_type: Optional[EngineeringItemType] = EngineeringItemType.STORY

    def __init__(self, **data):
        data["item_type"] = (
            data.get("item_type") or EngineeringItemType.STORY
        )  # no None values

        super().__init__(**data)


class EngineeringItem(WorkItem, BaseEngineeringItem):
    pass
