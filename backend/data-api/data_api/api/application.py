from fastapi import APIRouter, FastAPI

from data_api.database.database import DatabaseController
from data_api.orm.work_items.controllers.engineering_item import EngineeringController

router = APIRouter()


class DataApplication(FastAPI):
    def __init__(self, settings, *args, **kwargs):
        super().__init__(title="LucidShed Data API")

        self.settings = settings

        self.include_router(router)

    async def init(self) -> None:
        self.db = DatabaseController(self.settings.database_dsn)
        await self.db.init()

        self.engineering_controller = EngineeringController(self.db)

    async def close(self) -> None:
        await self.db.close()
