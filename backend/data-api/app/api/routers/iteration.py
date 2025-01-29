from typing import List, Optional

from fastapi import APIRouter, Depends, Request, Security
from pydantic import BaseModel

from app.api.dependencies.authorization import get_current_user
from app.api.dependencies.database import data_db_conn, user_db_conn
from app.api.tools.opensearch import index_object
from app.database.iterations.models.iteration import BaseIteration, Iteration, IterationSortableField

router = APIRouter(
    prefix="",
    tags=["iteration"],
    dependencies=[Security(get_current_user, scopes=["member"]), Depends(user_db_conn), Depends(data_db_conn)],
)


class PagedResponse(BaseModel):
    items: List[Iteration]
    cursor: Optional[str] = None


@router.post("", status_code=201, response_model=Iteration)
async def add_iteration(request: Request, organization_id: str, body: BaseIteration) -> Iteration:
    iteration = await request.app.iteration_controller.create(iteration=body, current_user=request.state.user.id)

    await index_object(
        opensearch_client=request.app.opensearch_client,
        index=organization_id,
        item_id=iteration.id,
        document=iteration.get_searchable_doc(),
    )

    return iteration


@router.get("/{id}", status_code=200, response_model=Iteration)
async def get_iteration(request: Request, organization_id: str, id: int) -> Iteration:
    return await request.app.iteration_controller.get(id=id)


@router.get("", status_code=200, response_model=PagedResponse)
async def get_iterations(
    request: Request,
    organization_id: str,
    sort: Optional[IterationSortableField] = IterationSortableField.TITLE,
    limit: Optional[int] = 1000,
    cursor: Optional[str] = None,
) -> PagedResponse:
    items, cursor = await request.app.iteration_controller.get_all(sort=sort, limit=limit, cursor=cursor)
    return PagedResponse(items=items, cursor=cursor)


@router.patch("/{id}", status_code=200, response_model=Iteration)
async def update_iteration(request: Request, organization_id: str, id: int, body: BaseIteration) -> Iteration:
    iteration = await request.app.iteration_controller.update(
        id=id, updated_iteration=body, current_user=request.state.user.id
    )

    document = iteration.get_searchable_doc(body.model_fields_set)

    document["modified_date"] = iteration.modified_at
    document["modified_by_id"] = iteration.modified_by_id

    await index_object(
        opensearch_client=request.app.opensearch_client,
        index=organization_id,
        item_id=iteration.id,
        document=document,
        mode="update",
    )

    return iteration


@router.delete("/{id}", status_code=200)
async def delete_iteration(request: Request, organization_id: str, id: int):
    deleted = await request.app.iteration_controller.delete(id=id, current_user=request.state.user.id)

    if deleted:
        await index_object(
            opensearch_client=request.app.opensearch_client,
            index=organization_id,
            item_id=id,
            document={"type": Iteration.__name__},
            mode="delete",
        )

    return deleted
