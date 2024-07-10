import logging
from typing import Any, List, Optional

import asyncpg

from app.database.common.queries import INIT_STATEMENTS

logger = logging.getLogger(__name__)

clear_database_sql = """
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;
"""


class DatabaseController:
    def __init__(self, dsn: str) -> None:
        self.__dsn = dsn

    async def init(
        self, min_pool_size: Optional[int] = 2, max_pool_size: Optional[int] = 5, reinit: Optional[bool] = False
    ) -> None:
        self.pool = await asyncpg.create_pool(self.__dsn, min_size=min_pool_size or 2, max_size=max_pool_size or 5)

        if reinit:
            logger.warning("Clearing Database")

            await self.clear_database_tables()

            logger.warning("Database Cleared")

        await self.init_database_tables()

        logger.warning("Database initialized")

    async def clear_database_tables(self):
        async with self.pool.acquire() as conn:
            async with conn.transaction():
                await conn.execute(clear_database_sql)

    async def init_database_tables(self):
        async with self.pool.acquire() as conn:
            async with conn.transaction():
                for init_statement in INIT_STATEMENTS:
                    logger.info(f"Executing query: {init_statement}")

                    await conn.execute(init_statement)

    async def close(self) -> None:
        if self.pool:
            await self.pool.close()

    async def create_database(self, db_name: str):
        async with self.pool.acquire() as conn:
            async with conn.transaction():
                await conn.execute(f"CREATE DATABASE {db_name};")

    async def execute(self, query: str, *args: Any) -> str:
        return await self.pool.execute(query, *args)

    async def fetch(self, query: str, *args: Any) -> List[asyncpg.Record]:
        return await self.pool.fetch(query, *args)

    async def fetchrow(self, query: str, *args: Any) -> asyncpg.Record:
        return await self.pool.fetchrow(query, *args)
