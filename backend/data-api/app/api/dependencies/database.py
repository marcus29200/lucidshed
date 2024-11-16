from typing import Optional

import backoff
from asyncpg import create_pool
from asyncpg.exceptions import TooManyConnectionsError
from fastapi import Request

from app.api.settings import data_db, database_pools, settings, user_db


@backoff.on_exception(backoff.expo, TooManyConnectionsError, max_tries=10, max_time=5)
async def get_pool(db_name: Optional[str] = None):
    if db_name is None:
        db_name = "postgres"
    elif not db_name.startswith("users") and not db_name.endswith("_data"):
        db_name = f"{db_name}_data"

    if not database_pools.get().get(db_name) or database_pools.get()[db_name]._closed:
        database_pools.get()[db_name] = await create_pool(
            dsn=settings.get_database_url(db_name), min_size=1, max_size=100, max_inactive_connection_lifetime=5
        )

    return database_pools.get()[db_name]


def close_pool(db_name: Optional[str] = None):
    if db_name is None:
        db_name = "postgres"

    if db_name in database_pools.get():
        pool = database_pools.get().pop(db_name)
        pool.terminate()


async def data_db_conn(request: Request):
    db_name = request.path_params.get("organization_id")
    if db_name:
        # TODO Add _data to the end so we can have something to filter on for upgrades
        pool = await get_pool(f"{db_name}_data")
        async with pool.acquire() as data_conn:
            try:
                data_db.set(data_conn)

                async with data_conn.transaction():
                    yield
            except Exception:
                raise
            finally:
                data_conn.terminate()
                data_db.set(None)


async def user_db_conn():
    pool = await get_pool(settings.user_db_name)
    async with pool.acquire() as user_conn:
        try:
            user_db.set(user_conn)

            async with user_conn.transaction():
                yield
        except Exception:
            raise
        finally:
            user_conn.terminate()
            user_db.set(None)
