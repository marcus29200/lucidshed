from typing import List, Optional, Union

from pydantic import Field

from app.database.common.models import MAX_ID_LENGTH
from app.database.companies.models.company import BaseCompany, Company
from app.database.work_items.models.work_item import BaseWorkItem, WorkItem


class BaseFeatureRequest(BaseWorkItem):
    title: Optional[str] = Field("", max_length=256)
    company_id: Optional[int] = None
    company: Union[Optional[Company], Optional[BaseCompany]] = None
    submitted_by_id: Optional[str] = Field(None, max_length=MAX_ID_LENGTH)
    # feature_assigned: Optional[List[str]] = []  # TODO make searchable, typeahead, etc.
    description: Optional[str] = ""
    # tags: Optional[List[Tag]] = []  # TODO Create DB models and relationships
    comments: Optional[List[str]] = []

    def __init__(self, **data):
        if isinstance(data.get("company"), dict):
            data["company"] = BaseCompany(**data["company"])

        super().__init__(**data)


class FeatureRequest(WorkItem, BaseFeatureRequest):
    """TODO: add fields to index in OpenSearch"""

    pass
