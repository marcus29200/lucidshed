from typing import Optional

from asyncpg import create_pool
from fastapi import Request

from app.api.settings import Settings, data_db


async def get_pool(database_pools, db_name: Optional[str] = None):
    settings = Settings()

    if not database_pools.get(db_name):
        database_pools[db_name] = await create_pool(
            host="localhost",
            port="5432",
            database=db_name or settings.database_name,
            user="postgres",
            password="password",
        )

    return database_pools[db_name]


async def data_db_conn(request: Request):
    db_name = request.path_params.get("organization_id")
    if db_name:
        pool = await get_pool(request.app.database_pools, db_name)
        async with pool.acquire() as data_conn:
            try:
                data_db.set(data_conn)

                async with data_conn.transaction():
                    yield
            except Exception:
                raise
            finally:
                data_db.set(None)
