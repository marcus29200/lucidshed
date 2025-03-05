from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Security
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from starlette.responses import JSONResponse

from app.api.dependencies.authorization import get_current_user
from app.api.dependencies.database import data_db_conn
from app.database.features.models.feature_list import BaseFeatureList, FeatureList
from app.database.work_items.models.work_item import WorkItemSortableField

router = APIRouter(
    prefix="",
    tags=["feature_lists"],
    dependencies=[Security(get_current_user, scopes=["member"]), Depends(data_db_conn)],
)


class FeatureListPagedResponse(BaseModel):
    items: List[FeatureList]
    cursor: Optional[str] = None


class BaseFeatureListListPayload(BaseModel):
    feature_id: str


class CreateFeatureListListPayload(BaseFeatureListListPayload):
    """
    This payload is directional, so item_1 is the parent and item_2 is the child,
    item_1 is typically the feature list and item_2 is the feature
    """
    feature_id: str


@router.post("", status_code=201, response_model=FeatureList)
async def add_feature_list(request: Request, organization_id: str, body: BaseFeatureList) -> FeatureList:
    return await request.app.feature_list_controller.create(new_item=body, current_user=request.state.user.id)


@router.get("/{id}", status_code=200, response_model=FeatureList)
async def get_feature_list(request: Request, organization_id: str, id: str) -> FeatureList:
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
async def update_feature_list(request: Request, organization_id: str, id: str, body: BaseFeatureList) -> FeatureList:
    return await request.app.feature_list_controller.update(
        id=id, updated_item=body, current_user=request.state.user.id
    )


@router.delete("/{id}", status_code=204)
async def delete_feature_list(request: Request, organization_id: str, id: str) -> None:
    feature_list = await request.app.feature_list_controller.get(id=id)
    if not feature_list:
        raise HTTPException(status_code=404, detail="Feature list not found")
    return await request.app.feature_list_controller.delete(id=id, current_user=request.state.user.id)


@router.post("/{feature_list_id}/links", status_code=201)
async def link_feature_to_feature_list(
    request: Request, organization_id: str, feature_list_id: str, body: CreateFeatureListListPayload
) -> JSONResponse:
    result = await request.app.feature_list_controller.link(
        item_1=feature_list_id, item_2=body.feature_id, current_user=request.state.user.id
    )
    if not result:
        return JSONResponse(status_code=412, content="Unable to create link")

    return JSONResponse(status_code=201, content=None)


@router.delete("/{feature_list_id}/links", status_code=200)
async def unlink_feature_from_feature_list(
    request: Request, organization_id: str, feature_list_id: str, body: BaseFeatureListListPayload
):
    return await request.app.feature_list_controller.unlink(
        item_1=feature_list_id, item_2=body.feature_id, current_user=request.state.user.id
    )


@router.get("/{feature_list_id}/unassigned_features", status_code=200)
async def get_unlinked_features(request: Request, organization_id: str, feature_list_id: str) -> JSONResponse:
    items = await request.app.feature_list_controller.get_unassigned_features(feature_list_id=feature_list_id)
    if not items:
        return JSONResponse(status_code=404, content="No unlinked features found")
    return JSONResponse(content=jsonable_encoder(items))
