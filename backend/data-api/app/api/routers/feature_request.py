from typing import List, Optional

from fastapi import APIRouter, Depends, Request, Security
from pydantic import BaseModel
from starlette.responses import JSONResponse

from app.api.dependencies.authorization import get_current_user
from app.api.dependencies.database import data_db_conn
from app.database.work_items.models.comment import BaseFeatureRequestComment, FeatureRequestComment
from app.database.features.models.feature_request import BaseFeatureRequest, FeatureRequest
from app.database.work_items.models.work_item import WorkItemSortableField

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


class BaseFeatureLinkPayload(BaseModel):
    feature_id: int


class CreateFeatureLinkPayload(BaseFeatureLinkPayload):
    """
    This payload is directional, so item_1 is the parent and item_2 is the child, 
    item_1 is typically the feature request and item_2 is the feature
    """
    feature_id: int


@router.post("", status_code=201, response_model=FeatureRequest)
async def add_feature_request(request: Request, organization_id: str, body: BaseFeatureRequest) -> FeatureRequest:
    return await request.app.feature_request_controller.create(new_item=body, current_user=request.state.user.id)


@router.get("/{id}", status_code=200, response_model=FeatureRequest)
async def get_feature_request(request: Request, organization_id: str, id: int) -> FeatureRequest:
    return await request.app.feature_request_controller.get(id=id)


@router.get("", status_code=200, response_model=FeatureRequestPagedResponse)
async def get_feature_requests(
    request: Request,
    organization_id: str,
    sort: Optional[WorkItemSortableField] = WorkItemSortableField.TITLE,
    limit: Optional[int] = 1000,
    cursor: Optional[str] = None,
) -> FeatureRequestPagedResponse:
    items, cursor = await request.app.feature_request_controller.get_all(sort=sort, limit=limit, cursor=cursor)
    return FeatureRequestPagedResponse(items=items, cursor=cursor)


@router.patch("/{id}", status_code=200, response_model=FeatureRequest)
async def update_feature_request(
    request: Request, organization_id: str, id: int, body: BaseFeatureRequest
) -> FeatureRequest:
    return await request.app.feature_request_controller.update(
        id=id, updated_item=body, current_user=request.state.user.id
    )


# Delete a feature request
@router.delete("/{id}", status_code=200)
async def delete_feature_request(request: Request, organization_id: str, id: int):
    return await request.app.feature_request_controller.delete(
        id=id, current_user=request.state.user.id
    )


@router.post("/{feature_request_id}/comments", status_code=201)
async def create_feature_request_comment(
    request: Request, organization_id: str, feature_request_id: int, body: BaseFeatureRequest
) -> FeatureRequestComment:
    return await request.app.feature_request_controller.create_comment(
        feature_request_id=feature_request_id, new_comment=body, current_user=request.state.user.id
    )


# get comments for a feature request
@router.get("/{feature_request_id}/comments", status_code=200, response_model=FeatureRequestCommentPagedResponse)
async def get_feature_request_comments(
    request: Request,
    feature_request_id: int,
    sort: Optional[WorkItemSortableField] = WorkItemSortableField.TITLE,  # NOTE fix me
    limit: Optional[int] = 1000,
    cursor: Optional[str] = None,
) -> FeatureRequestCommentPagedResponse:
    items, cursor = await request.app.feature_request_controller.get_comments(
        id=feature_request_id  # TODO , sort=sort, limit=limit, cursor=cursor
    )
    return FeatureRequestCommentPagedResponse(items=items, cursor=cursor)


@router.get("/{feature_request_id}/comments/{id}", status_code=200, response_model=FeatureRequestComment)
async def get_feature_request_comment(
    request: Request, feature_request_id: int, id: str
) -> FeatureRequestComment:
    return await request.app.feature_request_controller.get_comment(
        feature_request_id=feature_request_id, id=id
    )


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
    return await request.app.feature_request_controller.delete_comment(
        feature_request_id=feature_request_id,
        id=id,
        current_user=request.state.user.id,
    )


@router.post("/{feature_request_id}/links", status_code=201)
async def create_feature_request_item_link(
    request: Request, organization_id: str, feature_request_id: int, body: CreateFeatureLinkPayload
) -> JSONResponse:
    result = await request.app.feature_request_controller.link(
        item_1=feature_request_id, item_2=body.feature_id, current_user=request.state.user.id
    )

    if not result:
        return JSONResponse(status_code=412, content="Unable to create link")

    return JSONResponse(status_code=201, content=None)


@router.delete("/{feature_request_id}/links", status_code=200)
async def delete_feature_request_item_link(
    request: Request, organization_id: str, feature_request_id: int, body: BaseFeatureLinkPayload
):
    return await request.app.feature_request_controller.unlink(
        item_1=feature_request_id, item_2=body.feature_id, current_user=request.state.user.id
    )
