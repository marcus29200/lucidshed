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


async def clear_database(pool, db_name):
    async with pool.acquire() as conn:
        async with conn.transaction():
            await conn.execute(CLEAR_DATABASE_SQL)


async def delete_database(pool, db_name):
    try:
        await pool.execute(f"DROP DATABASE IF EXISTS {db_name}")
    except Exception as e:
        logger.error(f"Failed to delete database {db_name}: {e}")


async def create_database(pool, db_name):
    if not db_name.startswith("users") and not db_name.endswith("_data") and db_name != "postgres":
        db_name = f"{db_name}_data"

    await pool.execute(f"CREATE DATABASE {db_name}")


async def init_database_tables(pool, init_statements):
    async with pool.acquire() as conn:
        async with conn.transaction():
            for init_statement in init_statements:
                logger.debug(f"Executing query: {init_statement}")

                await conn.execute(init_statement)
