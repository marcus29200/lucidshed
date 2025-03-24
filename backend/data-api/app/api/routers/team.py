from typing import List, Optional

from fastapi import APIRouter, Depends, Request, Security
from pydantic import BaseModel

from app.api.dependencies.authorization import get_current_user
from app.api.dependencies.database import data_db_conn
from app.database.teams.models.team import BaseTeam, Team

router = APIRouter(
    prefix="",
    tags=["team"],
    dependencies=[Security(get_current_user, scopes=["member"]), Depends(data_db_conn)],
)


class PagedResponse(BaseModel):
    items: List[Team]
    cursor: Optional[str] = None


# TODO Needs to be indexed


@router.post("", status_code=201, response_model=Team)
async def add_team(request: Request, organization_id: str, body: BaseTeam) -> Team:
    return await request.app.team_controller.create(new_item=body, current_user=request.state.user.id)


@router.get("/{id}", status_code=200, response_model=Team)
async def get_team(request: Request, organization_id: str, id: str) -> Team:
    return await request.app.team_controller.get(id=id)


# @router.get("", status_code=200, response_model=PagedResponse)
# async def get_teams(
#     request: Request,
#     organization_id: str,
#     sort: Optional[WorkItemSortableField] = WorkItemSortableField.TITLE,
#     limit: Optional[int] = 1000,
#     cursor: Optional[str] = None,
# ) -> PagedResponse:
#     items, cursor = await request.app.team_controller.get_all(
#         sort=sort, limit=limit, cursor=cursor
#     )
#     return PagedResponse(items=items, cursor=cursor)


@router.patch("/{id}", status_code=200, response_model=Team)
async def update_team(request: Request, organization_id: str, id: str, body: BaseTeam) -> Team:
    return await request.app.team_controller.update(id=id, updated_item=body, current_user=request.state.user.id)


@router.delete("/{id}", status_code=200)
async def delete_team(request: Request, organization_id: str, id: str):
    return await request.app.team_controller.delete(id=id, current_user=request.state.user.id)
