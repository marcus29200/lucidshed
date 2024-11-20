import json
import re
from datetime import datetime
from enum import StrEnum
from typing import Any, Dict, List, Optional, Set

from app.database.iterations.models.iteration import Iteration
from app.database.teams.models.team import Team
from app.database.work_items.models.work_item import BaseWorkItem, WorkItem

INDEXED_FIELDS = [
    "id",
    "title",
    "description",
    "status",
    "priority",
    "created_at",
    "modified_at",
    "item_type",
    "item_sub_type",
    "iteration_id",
    "team_id",
    "assigned_to_id",
    "created_by_id",
    "modified_by_id",
]


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
    start_date: Optional[datetime] = None  # TODO Finish adding
    due_date: Optional[datetime] = None
    acceptance_criteria: Optional[List[str]] = []
    iteration_id: Optional[int] = None
    iteration: Optional[Iteration] = None
    team_id: Optional[int] = None
    team: Optional[Team] = None
    # watchers: Optional[List[Watcher]] = []  # TODO Create db models and relationships

    def __init__(self, **data):
        if isinstance(data.get("iteration"), str):
            data["iteration"] = json.loads(data["iteration"])
        if isinstance(data.get("team"), str):
            data["team"] = json.loads(data["team"])

        super().__init__(**data)

    def ai_format(self):
        return f"id={self.id}, description={self.description}, status={self.status}"


class EngineeringItem(WorkItem, BaseEngineeringItem):
    def get_fields_to_index(self, updated_fields: Optional[Set[str]] = set()) -> list[str]:
        return list(set(INDEXED_FIELDS).intersection(updated_fields)) if updated_fields else INDEXED_FIELDS

    def get_os_doc(self, updated_fields: Optional[set[str]] = None) -> Dict[str, Any]:
        indexible_doc = {field: getattr(self, field) for field in self.get_fields_to_index(updated_fields)}

        if indexible_doc.get("description"):
            indexible_doc["description"] = re.sub(r"<img[^>]*>", "", indexible_doc["description"])

        return indexible_doc


class EngineeringLinkType(StrEnum):
    SUBTASK: str = "subtask"
    RELATED: str = "related"
    BLOCKED: str = "blocked"
    BLOCKING: str = "blocking"
