from datetime import datetime
from enum import StrEnum
from typing import List, Optional

from app.database.work_items.models.work_item import BaseWorkItem, WorkItem


class EngineeringItemType(StrEnum):
    EPIC: str = "epic"
    STORY: str = "story"
    TASK: str = "task"


class EngineeringItemSubType(StrEnum):
    BUG: str = "bug"
    TASK: str = "task"
    FEATURE: str = "feature"


class BaseEngineeringItem(BaseWorkItem):
    item_type: Optional[EngineeringItemType] = EngineeringItemType.STORY
    item_sub_type: Optional[EngineeringItemSubType] = EngineeringItemSubType.FEATURE
    estimate: Optional[int] = None
    iteration_id: Optional[str] = None
    due_date: Optional[datetime] = None
    acceptance_criteria: Optional[List[str]] = []
    # iteration: Optional[Iteration] = None  # TODO Create db models and relationships
    # watchers: Optional[List[Watcher]] = []  # TODO Create db models and relationships

    def __init__(self, **data):
        data["item_type"] = data.get("item_type") or EngineeringItemType.STORY.value  # no None values

        super().__init__(**data)


class EngineeringItem(WorkItem, BaseEngineeringItem):
    pass
