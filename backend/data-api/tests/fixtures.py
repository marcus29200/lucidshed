import random
import string
from unittest.mock import patch

import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.api.application import DataApplication
from app.api.dependencies.database import close_pool, data_db, get_pool
from app.database.common.queries import INIT_STATEMENTS
from app.database.utils import create_database, delete_database, init_database_tables
from app.settings import database_pools, settings


def setup():
    test_org_id = "".join(random.choice(string.ascii_lowercase) for _ in range(10))
    settings.testing = True
    settings.sendgrid_api_key = None
    settings.opensearch_enabled = False
    settings.opensearch_async_indexing = False
    settings.rate_limit_requests = False

    settings.user_db_name = f"{test_org_id}_users"

    return test_org_id


async def cleanup(test_org_id):
    pools = database_pools.get().copy()
    for key, _ in pools.items():
        close_pool(key)

    pool = await get_pool()

    await delete_database(pool, settings.user_db_name)
    await delete_database(pool, test_org_id)

    close_pool()


@pytest_asyncio.fixture
async def data_app() -> DataApplication:  # type: ignore
    test_org_id = setup()

    pool = await get_pool()

    try:
        await create_database(pool, settings.user_db_name)
        await create_database(pool, test_org_id)

        close_pool()

        pool = await get_pool(test_org_id)
        await init_database_tables(pool, INIT_STATEMENTS)
        close_pool(test_org_id)

        try:
            app = None
            async with DataApplication(settings) as app:
                database_pools.set({})

                app.test_org_id = test_org_id

                yield app
        except Exception:
            if app:
                await app.close()

            raise

        data_db.set(None)
    finally:
        await cleanup(test_org_id)


@pytest_asyncio.fixture
async def data_api() -> AsyncClient:  # type: ignore
    test_org_id = setup()

    pool = await get_pool()

    try:
        await create_database(pool, settings.user_db_name)

        async with DataApplication(settings) as app:
            database_pools.set({})

            app.test_org_id = test_org_id

            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://localhost:8080") as test_client:
                test_client.test_org_id = app.test_org_id
                yield test_client
    finally:
        await cleanup(test_org_id)


@pytest_asyncio.fixture(autouse=True)
async def mock_gcs():
    with (
        patch("app.database.files.models.file.storage.Client") as mock_client,
        patch("app.database.files.models.file.default", return_value=("test", "test")),
    ):
        mock_client.return_value.bucket.return_value.blob.return_value.generate_signed_url.return_value = (  # noqa
            "http://test.com/test"
        )
        yield mock_client


@pytest_asyncio.fixture
async def opensearch_enabled():
    settings.opensearch_enabled = True

    yield
