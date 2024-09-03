import random
import string

import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.api.application import DataApplication
from app.api.dependencies.database import data_db, get_pool
from app.api.settings import database_pools, settings
from app.database.common.queries import INIT_STATEMENTS
from app.database.utils import create_database, init_database_tables


@pytest_asyncio.fixture
async def data_app() -> DataApplication:  # type: ignore
    test_org_id = "".join(random.choice(string.ascii_lowercase) for _ in range(10))
    settings.testing = True
    settings.sendgrid_api_key = None

    settings.user_db_name = f"users_{test_org_id}"

    pool = await get_pool()
    await create_database(pool, settings.user_db_name)
    await create_database(pool, test_org_id)

    pool.terminate()

    pool = await get_pool(test_org_id)
    await init_database_tables(pool, INIT_STATEMENTS)

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


@pytest_asyncio.fixture
async def data_api() -> AsyncClient:  # type: ignore
    test_org_id = "".join(random.choice(string.ascii_lowercase) for _ in range(10))
    settings.testing = True
    settings.sendgrid_api_key = None

    settings.user_db_name = f"users_{test_org_id}"

    pool = await get_pool()
    await create_database(pool, settings.user_db_name)

    async with DataApplication(settings) as app:
        database_pools.set({})

        app.test_org_id = test_org_id

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://localhost:8080") as test_client:
            test_client.test_org_id = app.test_org_id
            yield test_client
