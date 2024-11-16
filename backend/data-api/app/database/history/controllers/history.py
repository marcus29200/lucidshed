import json
from typing import List
from uuid import uuid4

from app.api.settings import data_db
from app.database.common.queries import QUERIES
from app.database.history.models.history import BaseHistory, History
from app.exceptions.common import ObjectNotFoundException


# Finish updating based on audit log models
class HistoryController:
    async def create(self, history: BaseHistory, current_user: str) -> History:
        # Create db record
        # How do we handle if completed is set right away?
        record = await data_db.get().fetchrow(
            QUERIES["CREATE_HISTORY"],
            uuid4().hex,
            str(history.item_id),
            history.item_type,
            history.message,
            history.action,
            json.dumps(history.metadata, default=str),
            current_user,
            current_user,
        )

        return History(**record)

    async def get(self, *, id: int) -> History:
        record = await data_db.get().fetchrow(QUERIES["GET_HISTORY"], id)

        if not record:
            raise ObjectNotFoundException(object_id=id)

        return History(**record)

    async def get_all(self, *, item_id: str, item_type: str) -> List[History]:
        # Get item record here
        records = await data_db.get().fetch(QUERIES["GET_ALL_HISTORIES"], str(item_id), item_type)

        return [History(**record) for record in records]
