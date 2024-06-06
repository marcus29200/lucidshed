import pytest_asyncio
from data_api.api.application import DataApplication
from data_api.database.database import DatabaseController
from data_api.orm.work_items.controllers.engineering_item import (
    EngineeringItemController,
)
from data_api.api.settings import Settings


@pytest_asyncio.fixture
async def data_application() -> DataApplication:
    async with DataApplication(Settings()) as app:
        await app.init()

        yield app


@pytest_asyncio.fixture
async def engineering_item_controller():
    database = DatabaseController(Settings().database_dsn)

    await database.init()

    try:
        yield EngineeringItemController(database)
    finally:
        await database.close()
