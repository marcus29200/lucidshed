from typing import List, Optional, Tuple

from app.api.settings import data_db
from app.api.utils import generate_cursor, parse_cursor
from app.database.common.queries import QUERIES
from app.database.teams.models.team import BaseTeam, Team
from app.exceptions.common import ObjectNotFoundException


class TeamController:
    async def create(self, team: BaseTeam, current_user: str) -> Team:
        record = await data_db.get().fetchrow(
            QUERIES["CREATE_TEAM"], team.title, team.description, current_user, current_user
        )

        return Team(**record)

    async def get(self, *, id: int) -> Team:
        # Get item record here
        record = await data_db.get().fetchrow(QUERIES["GET_TEAM"], id)

        if not record:
            raise ObjectNotFoundException(object_id=id)

        return Team(**record)

    async def get_all(
        self,
        *,
        sort: Optional[str] = "id",
        limit: Optional[int] = 1000,
        cursor: Optional[str] = None,
    ) -> Tuple[List[Team], str | None]:
        offset = 0
        if cursor:
            sort, offset, _ = parse_cursor(cursor)

        # Get item record here
        records = await data_db.get().fetch(QUERIES["GET_ALL_TEAMS"], sort, limit, offset)

        cursor = None
        if len(records) == limit:
            cursor = generate_cursor(sort, offset + limit)

        return [Team(**record) for record in records], cursor

    async def update(
        self,
        *,
        id: int,
        updated_team: Team,
        current_user: str,
    ) -> Team:
        old_team = await self.get(id=id)

        new_item_json = updated_team.model_dump(exclude_unset=True)
        old_item_json = old_team.model_dump()

        old_item_json.update(**new_item_json)

        record = await data_db.get().fetchrow(
            QUERIES["UPDATE_TEAM"],
            id,
            old_item_json["title"],
            old_item_json["description"],
            current_user,
            old_item_json["deleted_at"],
            old_item_json["deleted_by_id"],
        )

        return Team(**record)

    async def delete(self, *, id: int, current_user: str) -> bool:
        result = await data_db.get().execute(
            QUERIES["DELETE_TEAM"],
            id,
            current_user,
        )

        if result != "UPDATE 1":
            raise ObjectNotFoundException(object_id=id)

        return True
