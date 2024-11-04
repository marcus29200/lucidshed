from typing import List, Optional

from fastapi import APIRouter, Depends, Request, Security
from pydantic import BaseModel

from app.api.dependencies.authorization import get_current_user
from app.api.dependencies.database import data_db_conn, user_db_conn
from app.database.files.models.file import BaseFile, File, FileSortableField

iteration_item_router = APIRouter

router = APIRouter(
    prefix="",
    tags=["files"],
    dependencies=[Security(get_current_user, scopes=["member"]), Depends(user_db_conn), Depends(data_db_conn)],
)


class PagedResponse(BaseModel):
    items: List[File]
    cursor: Optional[str] = None


@router.post("", status_code=201, response_model=File)
async def add_file(request: Request, organization_id: str, body: BaseFile) -> File:
    return await request.app.file_controller.create(
        organization_id=organization_id, file=body, current_user=request.state.user.id
    )


@router.get("/{id}", status_code=200, response_model=File)
async def get_file(request: Request, organization_id: str, id: str) -> File:
    return await request.app.file_controller.get(organization_id=organization_id, id=id)


@router.get("", status_code=200, response_model=PagedResponse)
async def get_files(
    request: Request,
    organization_id: str,
    sort: Optional[FileSortableField] = FileSortableField.CREATED_AT,
    limit: Optional[int] = 1000,
    cursor: Optional[str] = None,
) -> PagedResponse:
    items, cursor = await request.app.file_controller.get_all(
        organization_id=organization_id, sort=sort, limit=limit, cursor=cursor
    )
    return PagedResponse(items=items, cursor=cursor)


# @router.patch("/{id}", status_code=200, response_model=Iteration)
# async def update_iteration(request: Request, organization_id: str, id: int, body: BaseIteration) -> Iteration:
#     return await request.app.iteration_controller.update(
#         organization_id=organization_id, id=id, updated_iteration=body, current_user=request.state.user.id
#     )


@router.delete("/{id}", status_code=200)
async def delete_file(request: Request, organization_id: str, id: str):
    return await request.app.file_controller.delete(
        organization_id=organization_id, id=id, current_user=request.state.user.id
    )
