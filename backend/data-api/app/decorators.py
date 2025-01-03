from functools import wraps

from app.database.work_items.models.feature_list import BaseFeatureList, FeatureScore


def serialize_enum_values(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        item = kwargs.get("new_item") or kwargs.get("updated_item")
        if isinstance(item, BaseFeatureList):
            item.reach = item.reach.value if isinstance(item.reach, FeatureScore) else item.reach
            item.impact = item.impact.value if isinstance(item.impact, FeatureScore) else item.impact
            item.confidence = item.confidence.value if isinstance(item.confidence, FeatureScore) else item.confidence
            item.effort = item.effort.value if isinstance(item.effort, FeatureScore) else item.effort
            item.growth = item.growth.value if isinstance(item.growth, FeatureScore) else item.growth
        return await func(*args, **kwargs)

    return wrapper
