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

    @property
    def cleaned_description(self):
        return re.sub(r"<img[^>]*>", "", self.description or "")

    @property
    def ai_text(self):
        included_fields = [
            "title",
            "description",
            "status",
            "assigned_to_id",
            "iteration_id",
            "created_at",
            "modified_at",
            "completed_at",
            "deleted_at",
        ]

        return " ".join([f"{field}={getattr(self, field)}" for field in included_fields])


class EngineeringItem(WorkItem, BaseEngineeringItem):
    @property
    def indexed_fields(self) -> Set[str]:
        return {
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
        }

    def get_searchable_doc(self, updated_fields: Optional[set[str]] = None) -> Dict[str, Any]:
        indexible_doc = super().get_searchable_doc(updated_fields)

        if indexible_doc.get("description"):
            indexible_doc["description"] = self.cleaned_description

        return indexible_doc


class EngineeringLinkType(StrEnum):
    SUBTASK: str = "subtask"
    RELATED: str = "related"
    BLOCKED: str = "blocked"
    BLOCKING: str = "blocking"
