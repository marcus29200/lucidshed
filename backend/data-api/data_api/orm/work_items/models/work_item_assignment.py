from data_api.orm.common import Model
from datetime import datetime


class WorkItemAssignment(Model):
    work_item_id: str
    user_id: str
    assigned_at: datetime
