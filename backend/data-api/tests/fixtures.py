import pytest_asyncio
from httpx import AsyncClient

from app.api.application import DataApplication
from app.api.settings import Settings


@pytest_asyncio.fixture
async def data_app() -> DataApplication:  # type: ignore
    async with DataApplication(Settings()) as app:
        await app.init(reinit=True)

        yield app


@pytest_asyncio.fixture
async def data_api(data_app) -> AsyncClient:  # type: ignore
    async with AsyncClient(app=data_app, base_url="http://localhost:8080") as test_client:
        yield test_client
