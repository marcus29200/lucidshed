from typing import List, Optional, Tuple

from app.api.settings import data_db
from app.api.utils import generate_cursor, parse_cursor
from app.database.common.queries import QUERIES
from app.database.iterations.models.iteration import BaseIteration, Iteration
from app.exceptions.common import ObjectNotFoundException


class IterationController:
    async def create(self, iteration: BaseIteration, current_user: str) -> Iteration:
        # Create db record
        # How do we handle if completed is set right away?
        record = await data_db.get().fetchrow(
            QUERIES["CREATE_ITERATION"],
            iteration.title,
            iteration.description,
            iteration.status,
            iteration.start_date,
            iteration.end_date,
            current_user,
            current_user,
        )

        return Iteration(**record)

    async def get(self, *, id: int) -> Iteration:
        # Get item record here
        record = await data_db.get().fetchrow(QUERIES["GET_ITERATION"], id)

        if not record:
            raise ObjectNotFoundException(object_id=id)

        return Iteration(**record)

    async def get_all(
        self, *, sort: Optional[str] = "id", limit: Optional[int] = 1000, cursor: Optional[str] = None
    ) -> Tuple[List[Iteration], str | None]:
        offset = 0
        if cursor:
            sort, offset, _ = parse_cursor(cursor)

        # Get item record here
        records = await data_db.get().fetch(QUERIES["GET_ALL_ITERATIONS"], sort, limit, offset)

        cursor = None
        if len(records) == limit:
            cursor = generate_cursor(sort, offset + limit)

        return [Iteration(**record) for record in records], cursor

    async def update(
        self,
        *,
        id: int,
        updated_iteration: Iteration,
        current_user: str,
    ) -> Iteration:
        old_iteration = await self.get(id=id)

        new_item_json = updated_iteration.model_dump(exclude_unset=True)
        old_item_json = old_iteration.model_dump()

        old_item_json.update(**new_item_json)

        record = await data_db.get().fetchrow(
            QUERIES["UPDATE_ITERATION"],
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

        return Iteration(**record)

    async def delete(self, *, id: int, current_user: str) -> bool:
        result = await data_db.get().execute(
            QUERIES["DELETE_ITERATION"],
            id,
            current_user,
        )

        if result != "UPDATE 1":
            raise ObjectNotFoundException(object_id=id)

        return True
