import logging

logger = logging.getLogger(__name__)


CLEAR_DATABASE_SQL = """
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;
"""


async def clear_database(conn, db_name):
    async with conn.transaction():
        await conn.execute(CLEAR_DATABASE_SQL)


async def delete_database(conn, db_name):
    await conn.execute(f"DROP DATABASE {db_name}")


async def create_database(conn, db_name):
    await conn.execute(f"CREATE DATABASE {db_name}")


async def init_database_tables(conn, init_statements):
    async with conn.transaction():
        for init_statement in init_statements:
            logger.info(f"Executing query: {init_statement}")

            await conn.execute(init_statement)
