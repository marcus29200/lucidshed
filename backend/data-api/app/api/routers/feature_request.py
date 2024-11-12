from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from app.database.work_items.models.comment import BaseFeatureRequestComment, FeatureRequestComment

router = APIRouter()


class FeatureRequest(BaseModel):
    id: int
    title: str
    description: str
    status: str


class FeatureRequestCreate(BaseModel):
    title: str
    description: str


class FeatureRequestPagedResponse(BaseModel):
    items: List[FeatureRequest]
    cursor: Optional[str] = None


class FeatureRequestCommentPagedResponse(BaseModel):
    items: List[FeatureRequestComment]
    cursor: Optional[str] = None


# In-memory storage for feature requests
feature_requests = []


# Dependency to get the current feature request by ID
def get_feature_request_by_id(feature_request_id: int):
    for feature_request in feature_requests:
        if feature_request.id == feature_request_id:
            return feature_request
    raise HTTPException(status_code=404, detail="Feature request not found")


# Create a new feature request
@router.post("/", response_model=FeatureRequest)
def create_feature_request(feature_request: FeatureRequestCreate):
    new_id = len(feature_requests) + 1
    new_feature_request = FeatureRequest(id=new_id, **feature_request.model_dump(), status="pending")
    feature_requests.append(new_feature_request)
    return new_feature_request


# Get all feature requests
@router.get("/", response_model=List[FeatureRequest])
def get_feature_requests():
    return feature_requests


# Get a specific feature request by ID
@router.get("/{feature_request_id}", response_model=FeatureRequest)
def get_feature_request(feature_request_id: int, feature_request: FeatureRequest = Depends(get_feature_request_by_id)):
    return feature_request


# Update a feature request
@router.put("/{feature_request_id}", response_model=FeatureRequest)
def update_feature_request(
    feature_request_id: int,
    updated_feature_request: FeatureRequestCreate,
    feature_request: FeatureRequest = Depends(get_feature_request_by_id),
):
    feature_request.title = updated_feature_request.title
    feature_request.description = updated_feature_request.description
    return feature_request


# Delete a feature request
@router.delete("/{feature_request_id}", response_model=FeatureRequest)
def delete_feature_request(
    feature_request_id: int, feature_request: FeatureRequest = Depends(get_feature_request_by_id)
):
    feature_requests.remove(feature_request)
    return feature_request


# get comments for a feature request
@router.get("/{feature_request_id}/comments", status_code=200, response_model=FeatureRequestCommentPagedResponse)
async def get_feature_request_comments(
    request: Request,
    company_id: str,
    feature_request_id: int,
    # sort: Optional[WorkItemSortableField] = WorkItemSortableField.TITLE,  # NOTE fix me
    limit: Optional[int] = 1000,
    cursor: Optional[str] = None,
) -> FeatureRequestCommentPagedResponse:
    items, cursor = await request.app.engineering_controller.get_comments(
        company_id=company_id, id=feature_request_id  # TODO , sort=sort, limit=limit, cursor=cursor
    )
    return FeatureRequestCommentPagedResponse(items=items, cursor=cursor)


@router.patch("/{feature_request_id}/comments/{id}", status_code=200, response_model=FeatureRequest)
async def update_feature_request_comment(
    request: Request, company_id: str, feature_request_id: int, id: str, body: BaseFeatureRequestComment
) -> FeatureRequest:
    return await request.app.feature_request_controller.update_comment(
        company_id=company_id,
        feature_request_id=feature_request_id,
        id=id,
        updated_item=body,
        current_user=request.state.user.id,
    )


@router.delete("/{feature_request_id}/comments/{id}", status_code=200)
async def delete_feature_request_comment(request: Request, company_id: str, feature_request_id: int, id: str):
    return await request.app.engineering_controller.delete_comment(
        company_id=company_id,
        feature_reqeust_id=feature_request_id,
        id=id,
        current_user=request.state.user.id,
    )
