import json
from typing import List
from uuid import uuid4

from app.api.settings import data_db
from app.database.common.queries import QUERIES
from app.database.history.models.history import BaseHistory, History
from app.exceptions.common import ObjectNotFoundException
from app.database.common.controllers import BaseController


# Finish updating based on audit log models
class HistoryController(BaseController):
    _type = "HISTORY"
    _create_history = False
    RETURN_MODEL = History

    async def get_all(self, *, item_id: str, item_type: str) -> List[History]:
        # Get item record here
        records = await data_db.get().fetch(QUERIES["GET_ALL_HISTORIES"], item_id, item_type)

        return [History(**record) for record in records]
