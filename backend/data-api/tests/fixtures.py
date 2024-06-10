import pytest_asyncio

# from async_asgi_testclient import TestClient
from httpx import AsyncClient

from app.api.application import DataApplication
from app.api.settings import Settings
from app.database.database import DatabaseController
from app.database.work_items.controllers.engineering_item import EngineeringController


@pytest_asyncio.fixture
async def data_application() -> DataApplication:
    async with DataApplication(Settings()) as app:
        await app.init()

        yield app


@pytest_asyncio.fixture
async def engineering_controller():
    database = DatabaseController(Settings().database_dsn)

    await database.init()

    try:
        yield EngineeringController(database)
    finally:
        await database.close()


@pytest_asyncio.fixture
async def data_api(data_application):
    async with AsyncClient(app=data_application, base_url="http://localhost:8080") as test_client:
        yield test_client
