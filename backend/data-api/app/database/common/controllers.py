import logging

from app.api.settings import data_db
from app.database.common.models import BaseModel
from app.database.common.queries import QUERIES
from app.database.history.models.history import BaseHistory
from app.exceptions.common import ObjectNotFoundException

logger = logging.getLogger(__name__)


"""
This base controller is designed to handle everything at a generic level, to hopefully keep things simple, and also cut
down on the boiler plate code we would need for different types of objects.
"""


class BaseController:
    _type = ""
    _create_history = False
    _database_context = data_db
    RETURN_MODEL = BaseModel

    def __init__(self):
        if self._type != "HISTORY":
            from app.database.history.controllers.history import HistoryController

            self.history_controller = HistoryController()

        if not self._type:
            logger.warning(f"{self.__module__} does not have a type set")
        if isinstance(self.RETURN_MODEL, BaseModel):
            logger.warning(f"{self.__module__} does not have a return model set")

    async def create(self, *, new_item, current_user: str):
        keys, values = new_item.dump_to_create_sql(current_user)
        record = await self._database_context.get().fetchrow(
            QUERIES[f"CREATE_{self._type}"].format(keys, values),
        )

        if self._create_history:
            await self.history_controller.create(
                new_item=BaseHistory(
                    item_id=record["id"],
                    item_type=self._type.lower(),
                    action="create",
                    metadata=new_item.model_dump(exclude_unset=True),
                ),
                current_user=current_user,
            )

        return self.RETURN_MODEL(**record)

    async def get(self, *, id: str, **extra_params):
        params = [id] + [value for value in extra_params.values()]
        record = await self._database_context.get().fetchrow(QUERIES[f"GET_{self._type}"], *params)

        if not record:
            raise ObjectNotFoundException(object_id=id)

        return self.RETURN_MODEL(**record)

    async def update(self, *, id: str, updated_item, current_user: str, **extra_params):
        params = [id] + [value for value in extra_params.values()]
        record = await self._database_context.get().fetchrow(
            QUERIES[f"UPDATE_{self._type}"].format(fields=updated_item.dump_to_update_sql(current_user)),
            *params,
        )

        if self._create_history:
            await self.history_controller.create(
                new_item=BaseHistory(
                    item_id=record["id"],
                    item_type=self._type.lower(),
                    action="update",
                    metadata=updated_item.model_dump(exclude_unset=True),
                ),
                current_user=current_user,
            )

        return self.RETURN_MODEL(**record)

    async def delete(self, *, id: str, current_user: str, **extra_params) -> bool:
        params = [id, current_user] + [value for value in extra_params.values()]
        result = await self._database_context.get().execute(QUERIES[f"DELETE_{self._type}"], *params)

        if result != "UPDATE 1":
            raise ObjectNotFoundException(object_id=id)

        if self._create_history:
            await self.history_controller.create(
                new_item=BaseHistory(item_id=str(id), item_type=self._type.lower(), action="delete"), current_user=current_user
            )

        return True
