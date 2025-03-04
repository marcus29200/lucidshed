from typing import List, Optional

from fastapi import APIRouter, Depends, Request, Security
from pydantic import BaseModel

from app.api.dependencies.authorization import get_current_user
from app.api.dependencies.database import data_db_conn
from app.database.features.models.feature import BaseFeature, Feature
from app.database.work_items.models.work_item import WorkItemSortableField

router = APIRouter(
    prefix="",
    tags=["features"],
    dependencies=[Security(get_current_user, scopes=["member"]), Depends(data_db_conn)],
)


class FeaturePagedResponse(BaseModel):
    items: List[Feature]
    cursor: Optional[str] = None


@router.post("", status_code=201, response_model=Feature)
async def add_feature(request: Request, organization_id: str, body: BaseFeature) -> Feature:
    return await request.app.feature_controller.create(new_item=body, current_user=request.state.user.id)


@router.get("/{id}", status_code=200, response_model=Feature)
async def get_feature(request: Request, organization_id: str, id: int) -> Feature:
    return await request.app.feature_controller.get(id=id)


@router.get("", status_code=200, response_model=FeaturePagedResponse)
async def get_features(
    request: Request,
    organization_id: str,
    sort: Optional[WorkItemSortableField] = WorkItemSortableField.TITLE,
    limit: Optional[int] = 1000,
    cursor: Optional[str] = None,
) -> FeaturePagedResponse:
    items, cursor = await request.app.feature_controller.get_all(sort=sort, limit=limit, cursor=cursor)
    return FeaturePagedResponse(items=items, cursor=cursor)


@router.patch("/{id}", status_code=200, response_model=Feature)
async def update_feature(request: Request, organization_id: str, id: int, body: BaseFeature) -> Feature:
    return await request.app.feature_controller.update(
        id=id, updated_item=body, current_user=request.state.user.id
    )


@router.delete("/{id}", status_code=200)
async def delete_feature(request: Request, organization_id: str, id: int):
    return await request.app.feature_controller.delete(id=id, current_user=request.state.user.id)
