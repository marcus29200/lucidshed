from enum import Enum
from typing import Optional

from app.database.work_items.models.work_item import BaseWorkItem, WorkItem


class FeatureScore(Enum):
    DEFAULT = 0
    SMALL = 1
    MEDIUM = 2
    LARGE = 3
    XLARGE = 4
    XXLARGE = 5


class BaseFeature(BaseWorkItem):
    requests: Optional[int] = 0
    reach: Optional[FeatureScore] = FeatureScore.DEFAULT
    impact: Optional[FeatureScore] = FeatureScore.DEFAULT
    confidence: Optional[FeatureScore] = FeatureScore.DEFAULT
    effort: Optional[FeatureScore] = FeatureScore.DEFAULT
    growth: Optional[FeatureScore] = FeatureScore.DEFAULT

    def __init__(self, **data):
        data["reach"] = data.get("reach") or FeatureScore.DEFAULT
        data["impact"] = data.get("impact") or FeatureScore.DEFAULT
        data["confidence"] = data.get("confidence") or FeatureScore.DEFAULT
        data["effort"] = data.get("effort") or FeatureScore.DEFAULT
        data["growth"] = data.get("growth") or FeatureScore.DEFAULT
        data["requests"] = data.get("requests") or 0

        super().__init__(**data)


class Feature(WorkItem, BaseFeature):
    """TODO: add fields to index in OpenSearch"""

    pass
