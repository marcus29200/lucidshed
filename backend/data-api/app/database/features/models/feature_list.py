from typing import List, Optional

from app.database.work_items.models.work_item import BaseWorkItem, WorkItem


class BaseFeatureList(BaseWorkItem):
    features: Optional[List[str]] = []


class FeatureList(WorkItem, BaseFeatureList):
    """TODO: add fields to index in OpenSearch"""

    pass
