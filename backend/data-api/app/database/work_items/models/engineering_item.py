import json
import re
from datetime import datetime
from enum import StrEnum
from typing import Any, Dict, List, Optional, Set

from app.database.iterations.models.iteration import Iteration
from app.database.teams.models.team import Team
from app.database.users.controllers.user import UserController
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
    EPIC = "epic"
    STORY = "story"
    TASK = "task"


class EngineeringItemSubType(StrEnum):
    BUG = "bug"
    TASK = "task"
    FEATURE = "feature"


class BaseEngineeringItem(BaseWorkItem):
    item_type: Optional[EngineeringItemType] = EngineeringItemType.STORY
    item_sub_type: Optional[EngineeringItemSubType] = EngineeringItemSubType.FEATURE
    estimate: Optional[int] = None
    start_date: Optional[datetime] = None  # TODO Finish adding
    due_date: Optional[datetime] = None
    acceptance_criteria: Optional[List[str]] = []
    iteration_id: Optional[str] = None
    team_id: Optional[str] = None
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
    iteration: Optional[Iteration] = None
    team: Optional[Team] = None

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
            "assigned_to",
            "created_by_id",
            "created_by",
            "modified_by_id",
            "modified_by",
        }

    async def get_searchable_doc(self, updated_fields: Optional[set[str]] = None) -> Dict[str, Any]:
        indexible_doc = await super().get_searchable_doc(updated_fields)

        if indexible_doc.get("description"):
            indexible_doc["description"] = self.cleaned_description

        # fields_to_expand = ["assigned_to_id", "created_by_id", "modified_by_id"]
        # # Populate users from ids
        # users = [self.assigned_to_id, self.created_by_id, self.modified_by_id]
        # users = await UserController().get_slim_users_by_id(ids=users)
        # indexible_doc["assigned_to"], indexible_doc["created_by"], indexible_doc["modified_by"] = (
        #     users[0].model_dump(),
        #     users[1].model_dump(),
        #     users[2].model_dump(),
        # )

        return indexible_doc


class EngineeringLinkType(StrEnum):
    SUBTASK = "subtask"
    RELATED = "related"
    BLOCKED = "blocked"
    BLOCKING = "blocking"
