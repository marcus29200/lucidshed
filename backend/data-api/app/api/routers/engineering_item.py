from typing import List, Optional

from fastapi import APIRouter, Request, Security
from pydantic import BaseModel

from app.api.dependencies.authorization import get_current_user
from app.api.dependencies.database import get_db_connection
from app.database.work_items.models.comment import BaseWorkItemComment, WorkItemComment
from app.database.work_items.models.engineering_item import BaseEngineeringItem, EngineeringItem
from app.database.work_items.models.work_item import WorkItemSortableField

engineering_item_router = APIRouter

router = APIRouter(
    prefix="",
    tags=["engineering"],
    dependencies=[Security(get_current_user, scopes=["member"])],
)


class EngineeringItemPagedResponse(BaseModel):
    items: List[EngineeringItem]
    cursor: Optional[str] = None


class WorkItemCommentPagedResponse(BaseModel):
    items: List[WorkItemComment]
    cursor: Optional[str] = None


@router.post("", status_code=201, response_model=EngineeringItem)
async def add_engineering_item(request: Request, organization_id: str, body: BaseEngineeringItem) -> EngineeringItem:
    return await request.app.engineering_controller.create(
        organization_id=organization_id, new_engineering_item=body, current_user=request.state.user.id
    )


@router.get("/{id}", status_code=200, response_model=EngineeringItem)
async def get_engineering_item(request: Request, organization_id: str, id: int) -> EngineeringItem:
    return await request.app.engineering_controller.get(organization_id=organization_id, id=id)


@router.get("", status_code=200, response_model=EngineeringItemPagedResponse)
async def get_engineering_items(
    request: Request,
    organization_id: str,
    sort: Optional[WorkItemSortableField] = WorkItemSortableField.TITLE,
    limit: Optional[int] = 1000,
    cursor: Optional[str] = None,
) -> EngineeringItemPagedResponse:
    items, cursor = await request.app.engineering_controller.get_all(
        organization_id=organization_id, sort=sort, limit=limit, cursor=cursor
    )
    return EngineeringItemPagedResponse(items=items, cursor=cursor)


@router.patch("/{id}", status_code=200, response_model=EngineeringItem)
async def update_engineering_item(
    request: Request, organization_id: str, id: int, body: BaseEngineeringItem
) -> EngineeringItem:
    return await request.app.engineering_controller.update(
        organization_id=organization_id, id=id, updated_engineering_item=body, current_user=request.state.user.id
    )


@router.delete("/{id}", status_code=200)
async def delete_engineering_item(request: Request, organization_id: str, id: int):
    return await request.app.engineering_controller.delete(
        organization_id=organization_id, id=id, current_user=request.state.user.id scope="ENGINEERING"
    )


@router.post("/{work_item_id}/comments", status_code=201)
async def create_engineering_item_comment(
    request: Request, organization_id: str, work_item_id: int, body: BaseWorkItemComment
) -> WorkItemComment:
    # NOTE Test for if engineering item doesn't exist what happens with the foreign constraint exception? Can we return a 404?
    return await request.app.engineering_controller.create_comment(
        organization_id=organization_id,
        work_item_id=work_item_id,
        new_comment=body,
        current_user=request.state.user.id,
    )


@router.get("/{work_item_id}/comments/{id}", status_code=200)
async def get_engineering_item_comment(
    request: Request, organization_id: str, work_item_id: int, id: str
) -> WorkItemComment:
    return await request.app.engineering_controller.get_comment(
        organization_id=organization_id, work_item_id=work_item_id, id=id
    )


@router.get("/{work_item_id}/comments", status_code=200, response_model=WorkItemCommentPagedResponse)
async def get_engineering_item_comments(
    request: Request,
    organization_id: str,
    work_item_id: int,
    sort: Optional[WorkItemSortableField] = WorkItemSortableField.TITLE,  # NOTE Change
    limit: Optional[int] = 1000,
    cursor: Optional[str] = None,
) -> WorkItemCommentPagedResponse:
    items, cursor = await request.app.engineering_controller.get_comments(
        organization_id=organization_id, work_item_id=work_item_id, sort=sort, limit=limit, cursor=cursor
    )
    return WorkItemCommentPagedResponse(items=items, cursor=cursor)


@router.patch("/{work_item_id}/comments/{id}", status_code=200, response_model=EngineeringItem)
async def update_engineering_item_comment(
    request: Request, organization_id: str, work_item_id: int, id: str, body: BaseWorkItemComment
) -> EngineeringItem:
    return await request.app.engineering_controller.update_comment(
        organization_id=organization_id,
        work_item_id=work_item_id,
        id=id,
        updated_engineering_item=body,
        current_user=request.state.user.id,
    )


@router.delete("/{work_item_id}/comments/{id}", status_code=200)
async def delete_engineering_item_comment(request: Request, organization_id: str, work_item_id: int, id: str):
    return await request.app.engineering_controller.delete(
        organization_id=organization_id,
        work_item_id=work_item_id,
        id=id,
        current_user=request.state.user.id,
    )
