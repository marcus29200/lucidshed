from typing import List, Optional, Tuple
from uuid import uuid4
import json

from app.api.settings import data_db
from app.api.utils import generate_cursor, parse_cursor
from app.database.history.models.history import History, BaseHistory
from app.database.common.queries import QUERIES
from app.exceptions.common import ObjectNotFoundException


# Finish updating based on audit log models
class HistoryController:
    async def create(self, organization_id: str, history: BaseHistory, current_user: str) -> History:
        # Create db record
        # How do we handle if completed is set right away?
        record = await data_db.get().fetchrow(
            QUERIES["CREATE_HISTORY"],
            uuid4().hex,
            organization_id,
            str(history.item_id),
            history.item_type,
            history.message,
            history.action,
            json.dumps(history.metadata),
            current_user,
            current_user,
        )

        return History(**record)

    async def get(self, *, organization_id: str, id: int) -> History:
        record = await data_db.get().fetchrow(QUERIES["GET_HISTORY"], organization_id, id)

        if not record:
            raise ObjectNotFoundException(organization_id=organization_id, object_id=id)

        return History(**record)

    async def get_all(
        self,
        *,
        organization_id: str,
        sort: Optional[str] = "id",
        limit: Optional[int] = 1000,
        cursor: Optional[str] = None,
    ) -> Tuple[List[History], str]:
        offset = 0
        if cursor:
            sort, offset, _ = parse_cursor(cursor)

        # Get item record here
        records = await data_db.get().fetch(QUERIES["GET_ALL_HISTORIES"], organization_id, sort, limit, offset)

        cursor = None
        if len(records) == limit:
            cursor = generate_cursor(sort, offset + limit)

        return [History(**record) for record in records], cursor
