# NOTE: To log history of work items, etc... To provide an audit log
from enum import StrEnum

from app.database.common.models import Model


class ActionType(StrEnum):
    CREATE: str = "create"
    UPDATE: str = "update"
    DELETE: str = "delete"
    GET: str = "get"


class HistoryItem(Model):
    user_id: str
    item_id: str
    action: ActionType
    detail: str
    # TODO What else?
