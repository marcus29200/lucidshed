from typing import List, Optional

from fastapi import APIRouter, Depends, Request, Security
from pydantic import BaseModel
from starlette.responses import JSONResponse

from app.api.dependencies.authorization import get_current_user
from app.api.dependencies.database import data_db_conn, user_db_conn
from app.api.tools.ask_lucid import perform_engineering_item_request
from app.api.tools.opensearch import index_object
from app.database.work_items.models.comment import BaseWorkItemComment, WorkItemComment
from app.database.work_items.models.engineering_item import (
    BaseEngineeringItem,
    EngineeringItem,
    EngineeringItemType,
    EngineeringLinkType,
)
from app.database.work_items.models.work_item import WorkItemSortableField

router = APIRouter(
    prefix="",
    tags=["engineering"],
    dependencies=[Security(get_current_user, scopes=["member"]), Depends(user_db_conn), Depends(data_db_conn)],
)


class EngineeringItemPagedResponse(BaseModel):
    items: List[EngineeringItem]
    cursor: Optional[str] = None


class WorkItemCommentPagedResponse(BaseModel):
    items: List[WorkItemComment]
    cursor: Optional[str] = None


class BaseEngineeringItemLinkPayload(BaseModel):
    item_id: int


class AskLucidPayload(BaseModel):
    query: str


class AskLucidResponse(BaseModel):
    summary: str
    related_items: List[EngineeringItem]


class CreateEngineeringItemLinkPayload(BaseEngineeringItemLinkPayload):
    """
    This payload is directional, so item_1 is the parent and item_2 is the child, so for example if you wanted to
    have a relationship where an item is blocking another, lets say id 1 is blocked by id 2. You would set item_1
    to 1 and item_2 to 2 and link_type to "blocked".
    """

    item_id: str
    link_type: EngineeringLinkType


class BatchUpdateEngineeringItemPayload(BaseModel):
    updates: List[BaseEngineeringItem]


@router.post("/ask-lucid", status_code=200)
async def ask_lucid(request: Request, organization_id: str, body: AskLucidPayload):
    # Basic idea here is to take in some query and then use the AI model to get results based on postgres data
    # Flow:
    # 1. Get an understanding of the query, figure out if there are any relevant things we can filter on first
    # 2. Get relevant data from filters from the database
    # 3. Run the query through the AI model with the relevant data
    # 4. Ask the AI model to return a list of item ids that are relevant along with a summary of the findings
    # 5. Load the relevant items using those ids
    # 6. Return the relevant items and the summary
    summary, related_items = await perform_engineering_item_request(
        request.app.opensearch_client, organization_id, body.query
    )

    return AskLucidResponse(summary=summary, related_items=related_items)


@router.post("", status_code=201, response_model=EngineeringItem)
async def add_engineering_item(request: Request, organization_id: str, body: BaseEngineeringItem) -> EngineeringItem:
    engineering_item = await request.app.engineering_controller.create(
        new_item=body, current_user=request.state.user.id
    )

    await index_object(
        opensearch_client=request.app.opensearch_client,
        index=organization_id,
        item_id=engineering_item.id,
        document=engineering_item.get_searchable_doc(),
    )

    return engineering_item


@router.get("/{id}", status_code=200, response_model=EngineeringItem)
async def get_engineering_item(request: Request, organization_id: str, id: str) -> EngineeringItem:
    return await request.app.engineering_controller.get(id=id)


@router.get("", status_code=200, response_model=EngineeringItemPagedResponse)
async def get_engineering_items(
    request: Request,
    organization_id: str,
    item_type: Optional[EngineeringItemType] = None,
    iteration_id: Optional[str] = None,
    related_item_id: Optional[str] = None,
    assigned_to_id: Optional[str] = None,
    sort: Optional[WorkItemSortableField] = WorkItemSortableField.TITLE,
    limit: Optional[int] = 1000,
    cursor: Optional[str] = None,
) -> EngineeringItemPagedResponse:
    items, cursor = await request.app.engineering_controller.get_all(
        item_type=item_type,
        iteration_id=iteration_id,
        related_item_id=related_item_id,
        assigned_to_id=assigned_to_id,
        sort=sort,
        limit=limit,
        cursor=cursor,
    )
    return EngineeringItemPagedResponse(items=items, cursor=cursor)


@router.patch("/{id}", status_code=200, response_model=EngineeringItem)
async def update_engineering_item(
    request: Request, organization_id: str, id: str, body: BaseEngineeringItem
) -> EngineeringItem:
    engineering_item = await request.app.engineering_controller.update(
        id=id, updated_item=body, current_user=request.state.user.id
    )

    document = engineering_item.get_searchable_doc(body.model_fields_set)

    document["modified_date"] = engineering_item.modified_at
    document["modified_by_id"] = engineering_item.modified_by_id

    await index_object(
        opensearch_client=request.app.opensearch_client,
        index=organization_id,
        item_id=engineering_item.id,
        document=document,
        mode="update",
    )

    return engineering_item


@router.delete("/{id}", status_code=200)
async def delete_engineering_item(request: Request, organization_id: str, id: str):
    deleted = await request.app.engineering_controller.delete(id=id, current_user=request.state.user.id)

    if deleted:
        await index_object(
            opensearch_client=request.app.opensearch_client,
            index=organization_id,
            item_id=id,
            document={"type": EngineeringItem.__name__},
            mode="delete",
        )

    return deleted


@router.get("/{id}/history", status_code=200)
async def get_engineering_item_history(request: Request, organization_id: str, id: str):
    return await request.app.history_controller.get_all(item_id=id, item_type="engineering_item")


@router.post("/{work_item_id}/comments", status_code=201)
async def create_engineering_item_comment(
    request: Request, organization_id: str, work_item_id: str, body: BaseWorkItemComment
) -> WorkItemComment:
    # NOTE If engineering item doesn't exist what happens with the foreign constraint exception? Can we return a 404?
    return await request.app.engineering_controller.create_comment(
        work_item_id=work_item_id, new_comment=body, current_user=request.state.user.id
    )


@router.get("/{work_item_id}/comments/{id}", status_code=200)
async def get_engineering_item_comment(
    request: Request, organization_id: str, work_item_id: str, id: str
) -> WorkItemComment:
    return await request.app.engineering_controller.get_comment(work_item_id=work_item_id, id=id)


@router.get("/{work_item_id}/comments", status_code=200, response_model=WorkItemCommentPagedResponse)
async def get_engineering_item_comments(
    request: Request,
    organization_id: str,
    work_item_id: str,
    sort: Optional[WorkItemSortableField] = WorkItemSortableField.TITLE,  # NOTE Change
    limit: Optional[int] = 1000,
    cursor: Optional[str] = None,
) -> WorkItemCommentPagedResponse:
    items, cursor = await request.app.engineering_controller.get_comments(
        id=work_item_id  # TODO , sort=sort, limit=limit, cursor=cursor
    )
    return WorkItemCommentPagedResponse(items=items, cursor=cursor)


@router.patch("/{work_item_id}/comments/{id}", status_code=200, response_model=EngineeringItem)
async def update_engineering_item_comment(
    request: Request, organization_id: str, work_item_id: str, id: str, body: BaseWorkItemComment
) -> EngineeringItem:
    return await request.app.engineering_controller.update_comment(
        work_item_id=work_item_id, id=id, updated_item=body, current_user=request.state.user.id
    )


@router.delete("/{work_item_id}/comments/{id}", status_code=200)
async def delete_engineering_item_comment(request: Request, organization_id: str, work_item_id: str, id: str):
    return await request.app.engineering_controller.delete_comment(
        work_item_id=work_item_id, id=id, current_user=request.state.user.id
    )


@router.post("/{work_item_id}/links", status_code=201)
async def create_engineering_item_link(
    request: Request, organization_id: str, work_item_id: str, body: CreateEngineeringItemLinkPayload
) -> JSONResponse:
    result = await request.app.engineering_controller.link(
        item_1=work_item_id, item_2=body.item_id, link_type=body.link_type, current_user=request.state.user.id
    )

    if not result:
        return JSONResponse(status_code=412, content="Unable to create link")

    return JSONResponse(status_code=201, content=None)


@router.delete("/{work_item_id}/links", status_code=200)
async def delete_engineering_item_link(
    request: Request, organization_id: str, work_item_id: str, body: BaseEngineeringItemLinkPayload
):
    return await request.app.engineering_controller.unlink(
        item_1=work_item_id, item_2=body.item_id, current_user=request.state.user.id
    )
