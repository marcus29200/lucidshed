# NOTE: To log history of work items, etc... To provide an audit log
from data_api.orm.common.models import Model
from enum import StrEnum


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
