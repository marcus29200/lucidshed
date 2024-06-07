import logging
from typing import Any, List, Optional

import asyncpg

from data_api.orm.common.queries import INIT_STATEMENTS

logger = logging.getLogger(__name__)


class DatabaseController:
    def __init__(self, dsn: str) -> None:
        self.__dsn = dsn

    async def init(self, min_pool_size: Optional[int] = 2, max_pool_size: Optional[int] = 5) -> None:
        self.__pool = await asyncpg.create_pool(self.__dsn, min_size=min_pool_size or 2, max_size=max_pool_size or 5)

        await self.init_database_tables()

    async def init_database_tables(self):
        async with self.__pool.acquire() as conn:
            async with conn.transaction():
                for init_statement in INIT_STATEMENTS:
                    logger.info(f"Executing query: {init_statement}")

                    await conn.execute(init_statement)

    async def close(self) -> None:
        if self.__pool:
            await self.__pool.close()

    async def execute(self, query: str, *args: Any) -> str:
        return await self.__pool.execute(query, *args)

    async def fetch(self, query: str, *args: Any) -> List[asyncpg.Record]:
        return await self.__pool.fetch(query, *args)

    async def fetchrow(self, query: str, *args: Any) -> asyncpg.Record:
        return await self.__pool.fetchrow(query, *args)
