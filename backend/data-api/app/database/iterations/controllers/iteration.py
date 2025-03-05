from typing import List, Optional, Tuple

from app.api.settings import data_db
from app.api.utils import generate_cursor, parse_cursor
from app.database.common.controllers import BaseController
from app.database.common.queries import QUERIES
from app.database.iterations.models.iteration import Iteration


class IterationController(BaseController):
    _type = "ITERATION"
    _create_history = False
    RETURN_MODEL = Iteration

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
