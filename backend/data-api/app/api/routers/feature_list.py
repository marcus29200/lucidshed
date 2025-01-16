from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Security
from pydantic import BaseModel

from app.api.dependencies.authorization import get_current_user
from app.api.dependencies.database import data_db_conn
from app.database.work_items.models.feature_list import BaseFeatureList, FeatureList
from app.database.work_items.models.work_item import WorkItemSortableField


router = APIRouter(
    prefix="",
    tags=["feature_lists"],
    dependencies=[Security(get_current_user, scopes=["member"]), Depends(data_db_conn)],
)


class FeatureListPagedResponse(BaseModel):
    items: List[FeatureList]
    cursor: Optional[str] = None


@router.post("", status_code=201, response_model=FeatureList)
async def add_feature_list(request: Request, organization_id: str, body: BaseFeatureList) -> FeatureList:
    return await request.app.feature_list_controller.create(new_item=body, current_user=request.state.user.id)


@router.get("/{id}", status_code=200, response_model=FeatureList)
async def get_feature_list(request: Request, organization_id: str, id: int) -> FeatureList:
    return await request.app.feature_list_controller.get(id=id)


@router.get("", status_code=200, response_model=FeatureListPagedResponse)
async def get_feature_lists(
    request: Request,
    organization_id: str,
    sort: Optional[WorkItemSortableField] = WorkItemSortableField.TITLE,
    limit: Optional[int] = 1000,
    cursor: Optional[str] = None,
) -> FeatureListPagedResponse:
    items, cursor = await request.app.feature_list_controller.get_all(sort=sort, limit=limit, cursor=cursor)
    return FeatureListPagedResponse(items=items)


@router.patch("/{id}", status_code=200, response_model=FeatureList)
async def update_feature_list(request: Request, organization_id: str, id: int, body: BaseFeatureList) -> FeatureList:
    return await request.app.feature_list_controller.update(
        id=id, updated_item=body, current_user=request.state.user.id
    )


@router.delete("/{id}", status_code=204)
async def delete_feature_list(request: Request, organization_id: str, id: int) -> None:
    feature_list = await request.app.feature_list_controller.get(id=id)
    if not feature_list:
        raise HTTPException(status_code=404, detail="Feature list not found")
    await request.app.feature_list_controller.delete(id=id, current_user=request.state.user.id, scope="FEATURE_LIST")
    return feature_list
