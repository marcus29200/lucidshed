from enum import Enum
from typing import Optional

from app.database.work_items.models.work_item import BaseWorkItem, WorkItem


class FeatureScore(Enum):
    SMALL = 1
    MEDIUM = 2
    LARGE = 3
    XLARGE = 4
    XXLARGE = 5


class BaseFeature(BaseWorkItem):
    requests: Optional[int] = 1
    reach: Optional[FeatureScore] = FeatureScore.SMALL.value
    impact: Optional[FeatureScore] = FeatureScore.SMALL.value
    confidence: Optional[FeatureScore] = FeatureScore.SMALL.value
    effort: Optional[FeatureScore] = FeatureScore.SMALL.value
    growth: Optional[FeatureScore] = FeatureScore.SMALL.value

    def __init__(self, **data):
        data["reach"] = data.get("reach") or FeatureScore.SMALL.value
        data["impact"] = data.get("impact") or FeatureScore.SMALL.value
        data["confidence"] = data.get("confidence") or FeatureScore.SMALL.value
        data["effort"] = data.get("effort") or FeatureScore.SMALL.value
        data["growth"] = data.get("growth") or FeatureScore.SMALL.value
        data["requests"] = data.get("requests") or 1

        super().__init__(**data)


class Feature(WorkItem, BaseFeature):
    """TODO: add fields to index in OpenSearch"""

    pass
