from typing import List, Optional

from fastapi import APIRouter, Depends, Request, Security
from pydantic import BaseModel

from app.api.dependencies.authorization import get_current_user
from app.api.dependencies.database import data_db_conn
from app.database.work_items.models.support_item import BaseSupportItem, SupportItem
from app.database.work_items.models.work_item import WorkItemSortableField

support_item_router = APIRouter

router = APIRouter(
    prefix="",
    tags=["support"],
    dependencies=[Security(get_current_user, scopes=["member"]), Depends(data_db_conn)],
)


class PagedResponse(BaseModel):
    items: List[SupportItem]
    cursor: Optional[str] = None


@router.post("", status_code=201, response_model=SupportItem)
async def add_support_item(request: Request, organization_id: str, body: BaseSupportItem) -> SupportItem:
    return await request.app.support_controller.create(
        organization_id=organization_id, new_support_item=body, current_user=request.state.user.id
    )


@router.get("/{id}", status_code=200, response_model=SupportItem)
async def get_support_item(request: Request, organization_id: str, id: int) -> SupportItem:
    return await request.app.support_controller.get(organization_id=organization_id, id=id)


@router.get("", status_code=200, response_model=PagedResponse)
async def get_support_items(
    request: Request,
    organization_id: str,
    sort: Optional[WorkItemSortableField] = WorkItemSortableField.TITLE,
    limit: Optional[int] = 1000,
    cursor: Optional[str] = None,
) -> PagedResponse:
    items, cursor = await request.app.support_controller.get_all(
        organization_id=organization_id, sort=sort, limit=limit, cursor=cursor
    )
    return PagedResponse(items=items, cursor=cursor)


@router.patch("/{id}", status_code=200, response_model=SupportItem)
async def update_support_item(request: Request, organization_id: str, id: int, body: BaseSupportItem) -> SupportItem:
    return await request.app.support_controller.update(
        organization_id=organization_id, id=id, updated_support_item=body, current_user=request.state.user.id
    )


@router.delete("/{id}", status_code=200)
async def delete_support_item(request: Request, organization_id: str, id: int):
    return await request.app.support_controller.delete(
        organization_id=organization_id, id=id, current_user=request.state.user.id, scope="SUPPORT"
    )


@router.get("/{id}/history", status_code=200)
async def get_engineering_item_history(request: Request, organization_id: str, id: int):
    return await request.app.history_controller.get_all(
        organization_id=organization_id, item_id=id, item_type="support"
    )