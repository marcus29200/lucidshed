from fastapi import APIRouter, FastAPI

from data_api.database.database import DatabaseController
from data_api.orm.work_items.controllers.engineering_item import EngineeringController
from data_api.api.routers.engineering_item import router as engineering_item_router

router = APIRouter()


class DataApplication(FastAPI):
    def __init__(self, settings, *args, **kwargs):
        super().__init__(title="LucidShed Data API")

        self.settings = settings

        self.include_router(router)
        self.include_router(engineering_item_router)

    async def __aenter__(self):
        await self.init()

        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()

    async def init(self) -> None:
        self.db = DatabaseController(self.settings.database_dsn)
        await self.db.init()

        self.engineering_controller = EngineeringController(self.db)

    async def close(self) -> None:
        await self.db.close()
