from enum import StrEnum
from typing import List, Optional

from app.database.work_items.models.work_item import BaseWorkItem, WorkItem


class EngineeringItemType(StrEnum):
    EPIC: str = "epic"
    STORY: str = "story"
    TASK: str = "task"


class BaseEngineeringItem(BaseWorkItem):
    item_type: Optional[EngineeringItemType] = EngineeringItemType.STORY
    estimate: Optional[int] = None
    iteration_id: Optional[str] = None
    tags: Optional[List[str]] = []  # Maybe should be a list of ids
    related_tickets: Optional[List[str]] = []  # List of ids
    related_files: Optional[List[str]] = []  # List of ids

    def __init__(self, **data):
        data["item_type"] = data.get("item_type") or EngineeringItemType.STORY.value  # no None values

        super().__init__(**data)


class EngineeringItem(WorkItem, BaseEngineeringItem):
    pass
