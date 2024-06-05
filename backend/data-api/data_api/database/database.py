import asyncpg
from typing import Any, List, Optional
from contextlib import asynccontextmanager


class DatabaseController:
    def __init__(self, server: str) -> None:
        self.__server = server
        self.__pool = None

    async def init(
        self, min_pool_size: Optional[int] = 2, max_pool_size: Optional[int] = 5
    ) -> None:
        self.__pool = await asyncpg.create_pool(
            self.__server, min_size=min_pool_size or 2, max_size=max_pool_size or 5
        )

    async def close(self) -> None:
        if self.__pool:
            await self.__pool.close()

    @asynccontextmanager
    async def get_connection(self):
        async with self.__pool.acquire() as connection:
            yield connection

    async def execute(self, query: str, *args: Any) -> None:
        return await self.__pool.execute(query, *args())

    async def fetch(self, query: str, *args: Any) -> List[asyncpg.Record]:
        return await self.__pool.fetch(query, *args)

    async def fetchrow(self, query: str, *args: Any) -> asyncpg.Record:
        return await self.__pool.fetchrow(query, *args)
