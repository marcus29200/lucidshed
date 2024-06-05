from data_api.orm.work_items.models.work_item import BaseWorkItem, WorkItem
from enum import StrEnum
from typing import Optional


class EngineeringItemType(StrEnum):
    EPIC: str = "epic"
    STORY: str = "story"
    TASK: str = "task"


class BaseEngineeringItem(BaseWorkItem):
    item_type: Optional[EngineeringItemType] = EngineeringItemType.STORY


class EngineeringItem(WorkItem, BaseEngineeringItem):
    pass
