from datetime import datetime

from app.database.common.models import Model


class WorkItemAssignment(Model):
    work_item_id: str
    user_id: str
    assigned_at: datetime
