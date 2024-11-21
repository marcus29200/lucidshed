from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Security
from pydantic import BaseModel

from app.api.dependencies.authorization import get_current_user
from app.api.dependencies.database import data_db_conn
from app.database.work_items.models.feature_request import FeatureRequest
from app.database.work_items.models.comment import BaseFeatureRequestComment, FeatureRequestComment
from app.database.work_items.models.work_item import WorkItemSortableField

feature_request_router = APIRouter

router = APIRouter(
    prefix="",
    tags=["feature_requests"],
    dependencies=[Security(get_current_user, scopes=["member"]), Depends(data_db_conn)],
)

class FeatureRequestPagedResponse(BaseModel):
    items: List[FeatureRequest]
    cursor: Optional[str] = None


class FeatureRequestCommentPagedResponse(BaseModel):
    items: List[FeatureRequestComment]
    cursor: Optional[str] = None


@router.post("", status_code=201, response_model=FeatureRequest)
async def add_feature_request(request: Request, organization_id: str, body: FeatureRequest) -> FeatureRequest:
    return await request.app.feature_request_controller.create(new_item=body, current_user=request.state.user.id)


@router.get("/{id}", status_code=200, response_model=FeatureRequest)
async def get_feature_request(request: Request, organization_id: str, id: int) -> FeatureRequest:
    return await request.app.feature_request_controller.get(id=id)


@router.get("", status_code=200, response_model=FeatureRequestCommentPagedResponse)
async def get_feature_requests(
    request: Request,
    organization_id: str,
    sort: Optional[WorkItemSortableField] = WorkItemSortableField.TITLE,
    limit: Optional[int] = 1000,
    cursor: Optional[str] = None,
) -> FeatureRequestCommentPagedResponse:
    items, cursor = await request.app.feature_request_controller.get_all(sort=sort, limit=limit, cursor=cursor)
    return FeatureRequestCommentPagedResponse(items=items, cursor=cursor)


@router.patch("/{id}", status_code=200, response_model=FeatureRequest)
async def update_feature_request(request: Request, organization_id: str, id: int, body: FeatureRequest) -> FeatureRequest:
    return await request.app.feature_request_controller.update(id=id, updated_item=body, current_user=request.state.user.id)


# Delete a feature request
@router.delete("/{id}", status_code=200, response_model=FeatureRequest)
async def delete_feature_request(request: Request, organization_id: str, id: int) -> FeatureRequest:
    feature_request = await request.app.feature_request_controller.get(id=id)
    if not feature_request:
        raise HTTPException(status_code=404, detail="Feature request not found")
    await request.app.feature_request_controller.delete(id=id)
    return feature_request


# get comments for a feature request
@router.get("/{feature_request_id}/comments", status_code=200, response_model=FeatureRequestCommentPagedResponse)
async def get_feature_request_comments(
    request: Request,
    feature_request_id: int,
    sort: Optional[WorkItemSortableField] = WorkItemSortableField.TITLE,  # NOTE fix me
    limit: Optional[int] = 1000,
    cursor: Optional[str] = None,
) -> FeatureRequestCommentPagedResponse:
    items, cursor = await request.app.engineering_controller.get_comments(
        id=feature_request_id  # TODO , sort=sort, limit=limit, cursor=cursor
    )
    return FeatureRequestCommentPagedResponse(items=items, cursor=cursor)


@router.patch("/{feature_request_id}/comments/{id}", status_code=200, response_model=FeatureRequest)
async def update_feature_request_comment(
    request: Request, feature_request_id: int, id: str, body: BaseFeatureRequestComment
) -> FeatureRequest:
    return await request.app.feature_request_controller.update_comment(
        feature_request_id=feature_request_id,
        id=id,
        updated_item=body,
        current_user=request.state.user.id,
    )


@router.delete("/{feature_request_id}/comments/{id}", status_code=200)
async def delete_feature_request_comment(request: Request, feature_request_id: int, id: str):
    return await request.app.engineering_controller.delete_comment(
        feature_reqeust_id=feature_request_id,
        id=id,
        current_user=request.state.user.id,
    )
