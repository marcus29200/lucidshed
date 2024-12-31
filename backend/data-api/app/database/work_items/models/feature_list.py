from enum import Enum
from typing import List, Optional

from app.database.work_items.models.work_item import BaseWorkItem, WorkItem


class FeatureScore(Enum):
    SMALL = 1
    MEDIUM = 2
    LARGE = 3
    XLARGE = 4
    XXLARGE = 5


class BaseFeatureList(BaseWorkItem):
    requests: int
    reach: Optional[FeatureScore] = FeatureScore.SMALL.value
    impact: Optional[FeatureScore] = FeatureScore.SMALL.value
    confidence: Optional[FeatureScore] = FeatureScore.SMALL.value
    effort: Optional[FeatureScore] = FeatureScore.SMALL.value
    growth: Optional[FeatureScore] = FeatureScore.SMALL.value
    feature_requests: Optional[List[int]] = []

    def __init__(self, **data):
        data["reach"] = data.get("reach") or FeatureScore.SMALL.value
        data["impact"] = data.get("impact") or FeatureScore.SMALL.value
        data["confidence"] = data.get("confidence") or FeatureScore.SMALL.value
        data["effort"] = data.get("effort") or FeatureScore.SMALL.value
        data["growth"] = data.get("growth") or FeatureScore.SMALL.value

        super().__init__(**data)


class FeatureList(WorkItem, BaseFeatureList):
    """TODO: add fields to index in OpenSearch"""

    pass
