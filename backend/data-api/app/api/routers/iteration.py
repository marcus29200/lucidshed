from typing import List, Optional

from fastapi import APIRouter, Depends, Request, Security
from pydantic import BaseModel

from app.api.dependencies.authorization import get_current_user
from app.api.dependencies.database import data_db_conn
from app.database.iterations.models.iteration import BaseIteration, Iteration, IterationSortableField

iteration_item_router = APIRouter

router = APIRouter(
    prefix="",
    tags=["iteration"],
    dependencies=[Security(get_current_user, scopes=["member"]), Depends(data_db_conn)],
)


class PagedResponse(BaseModel):
    items: List[Iteration]
    cursor: Optional[str] = None


@router.post("", status_code=201, response_model=Iteration)
async def add_iteration(request: Request, organization_id: str, body: BaseIteration) -> Iteration:
    return await request.app.iteration_controller.create(
        organization_id=organization_id, iteration=body, current_user="test@test.com"
    )


@router.get("/{id}", status_code=200, response_model=Iteration)
async def get_iteration(request: Request, organization_id: str, id: int) -> Iteration:
    return await request.app.iteration_controller.get(organization_id=organization_id, id=id)


@router.get("", status_code=200, response_model=PagedResponse)
async def get_iterations(
    request: Request,
    organization_id: str,
    sort: Optional[IterationSortableField] = IterationSortableField.TITLE,
    limit: Optional[int] = 1000,
    cursor: Optional[str] = None,
) -> PagedResponse:
    items, cursor = await request.app.iteration_controller.get_all(
        organization_id=organization_id, sort=sort, limit=limit, cursor=cursor
    )
    return PagedResponse(items=items, cursor=cursor)


@router.patch("/{id}", status_code=200, response_model=Iteration)
async def update_iteration(request: Request, organization_id: str, id: int, body: BaseIteration) -> Iteration:
    return await request.app.iteration_controller.update(
        organization_id=organization_id, id=id, updated_iteration=body, current_user="test@test.com"
    )


@router.delete("/{id}", status_code=200)
async def delete_iteration(request: Request, organization_id: str, id: int):
    return await request.app.iteration_controller.delete(
        organization_id=organization_id, id=id, current_user="test@test.com"
    )
