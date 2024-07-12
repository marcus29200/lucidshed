import pytest_asyncio
from httpx import AsyncClient
import random
import string
from contextvars import ContextVar

from asyncpg import create_pool, InvalidCatalogNameError
from app.api.application import DataApplication
from app.api.settings import Settings, data_db, user_db
from app.database.utils import clear_database, create_database
from uuid import uuid4

org_id = ContextVar("org_id")


@pytest_asyncio.fixture
async def data_app() -> DataApplication:  # type: ignore
    async with create_pool(
        host="localhost", port="5432", user="postgres", password="password", database="users"
    ) as pool, pool.acquire() as conn:
        await clear_database(conn, "users")

        # await create_database(conn, "users")

        async with DataApplication(Settings()) as app:
            app.test_org_id = "".join(random.choice(string.ascii_lowercase) for _ in range(10))

            yield app

        try:
            try:
                data_db.get().close()
            except Exception:
                pass

            try:
                user_db.get().close()
            except Exception:
                pass

            # TODO Need to figure out what sessions are still using this, can't delete otherwise
            await clear_database(conn, app.test_org_id)
        except InvalidCatalogNameError:
            pass


@pytest_asyncio.fixture
async def data_api(data_app) -> AsyncClient:  # type: ignore
    async with AsyncClient(app=data_app, base_url="http://localhost:8080") as test_client:
        test_client.test_org_id = data_app.test_org_id
        yield test_client
