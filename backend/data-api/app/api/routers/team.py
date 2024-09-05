from typing import List, Optional

from fastapi import APIRouter, Depends, Request, Security
from pydantic import BaseModel

from app.api.dependencies.authorization import get_current_user
from app.api.dependencies.database import data_db_conn
from app.database.teams.models.team import BaseTeam, Team

team_item_router = APIRouter

router = APIRouter(
    prefix="",
    tags=["team"],
    dependencies=[Security(get_current_user, scopes=["member"]), Depends(data_db_conn)],
)


class PagedResponse(BaseModel):
    items: List[Team]
    cursor: Optional[str] = None


@router.post("", status_code=201, response_model=Team)
async def add_team(request: Request, organization_id: str, body: BaseTeam) -> Team:
    return await request.app.team_controller.create(
        organization_id=organization_id, team=body, current_user=request.state.user.id
    )


@router.get("/{id}", status_code=200, response_model=Team)
async def get_team(request: Request, organization_id: str, id: int) -> Team:
    return await request.app.team_controller.get(organization_id=organization_id, id=id)


# @router.get("", status_code=200, response_model=PagedResponse)
# async def get_teams(
#     request: Request,
#     organization_id: str,
#     sort: Optional[WorkItemSortableField] = WorkItemSortableField.TITLE,
#     limit: Optional[int] = 1000,
#     cursor: Optional[str] = None,
# ) -> PagedResponse:
#     items, cursor = await request.app.team_controller.get_all(
#         organization_id=organization_id, sort=sort, limit=limit, cursor=cursor
#     )
#     return PagedResponse(items=items, cursor=cursor)


@router.patch("/{id}", status_code=200, response_model=Team)
async def update_team(request: Request, organization_id: str, id: int, body: BaseTeam) -> Team:
    return await request.app.team_controller.update(
        organization_id=organization_id, id=id, updated_team=body, current_user=request.state.user.id
    )


@router.delete("/{id}", status_code=200)
async def delete_team(request: Request, organization_id: str, id: int):
    return await request.app.team_controller.delete(
        organization_id=organization_id, id=id, current_user=request.state.user.id
    )
