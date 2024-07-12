from typing import List, Optional, Tuple

from app.api.utils import generate_cursor, parse_cursor
from app.database.common.queries import QUERIES
from app.database.iterations.models.iteration import BaseIteration, Iteration
from app.exceptions.common import ObjectNotFoundException
from app.api.settings import data_db


class IterationController:
    async def create(self, organization_id: str, iteration: BaseIteration, current_user: str) -> Iteration:
        # Create db record
        # How do we handle if completed is set right away?
        record = await data_db.get().fetchrow(
            QUERIES["CREATE_ITERATION"],
            organization_id,
            iteration.title,
            iteration.description,
            iteration.status,
            iteration.start_date,
            iteration.end_date,
            current_user,
            current_user,
        )

        # TODO Create history entry

        return Iteration(**record)

    async def get(self, *, organization_id: str, id: int) -> Iteration:
        # Get item record here
        record = await data_db.get().fetchrow(QUERIES["GET_ITERATION"], organization_id, id)

        if not record:
            raise ObjectNotFoundException(organization_id=organization_id, object_id=id)

        return Iteration(**record)

    async def get_all(
        self,
        *,
        organization_id: str,
        sort: Optional[str] = "id",
        limit: Optional[int] = 1000,
        cursor: Optional[str] = None,
    ) -> Tuple[List[Iteration], str]:
        offset = 0
        if cursor:
            sort, offset = parse_cursor(cursor)

        # Get item record here
        records = await data_db.get().fetch(QUERIES["GET_ALL_ITERATIONS"], organization_id, sort, limit, offset)

        cursor = None
        if len(records) == limit:
            cursor = generate_cursor(sort, offset + limit)

        return [Iteration(**record) for record in records], cursor

    async def update(
        self,
        *,
        organization_id: str,
        id: str,
        updated_iteration: Iteration,
        current_user: str,
    ) -> Iteration:
        old_iteration = await self.get(organization_id=organization_id, id=id)

        new_item_json = updated_iteration.model_dump(exclude_unset=True)
        old_item_json = old_iteration.model_dump()

        old_item_json.update(**new_item_json)

        record = await data_db.get().fetchrow(
            QUERIES["UPDATE_ITERATION"],
            organization_id,
            id,
            old_item_json["title"],
            old_item_json["description"],
            old_item_json["status"],
            old_item_json["start_date"],
            old_item_json["end_date"],
            current_user,
            old_item_json["deleted_at"],
            old_item_json["deleted_by_id"],
        )

        # TODO Create history entry on new engineering item changes

        return Iteration(**record)

    async def delete(self, *, organization_id: str, id: int, current_user: str) -> bool:
        result = await data_db.get().execute(
            QUERIES["DELETE_ITERATION"],
            organization_id,
            id,
            current_user,
        )

        if result != "UPDATE 1":
            raise ObjectNotFoundException(organization_id=organization_id, object_id=id)

        return True
