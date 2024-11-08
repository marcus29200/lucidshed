import json
from datetime import datetime
from enum import StrEnum
from typing import List, Optional

from app.database.iterations.models.iteration import Iteration
from app.database.teams.models.team import Team
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


class EngineeringItem(WorkItem, BaseEngineeringItem):
    pass


class EngineeringLinkType(StrEnum):
    SUBTASK: str = "subtask"
    RELATED: str = "related"
    BLOCKED: str = "blocked"
    BLOCKING: str = "blocking"
