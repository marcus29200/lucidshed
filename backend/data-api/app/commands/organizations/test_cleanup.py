import asyncio

from asyncpg import create_pool

from app.commands.organizations.base import BaseOrganizationCommand


class TestCleanupCommand(BaseOrganizationCommand):
    async def perform(self, organization_id):
        try:
            async with create_pool(
                host="localhost",
                port="5432",
                user="postgres",
                password="password",
            ) as pool:
                async with pool.acquire() as conn:
                    await conn.execute(f"DROP DATABASE IF EXISTS {organization_id}")

                    print(f"Deleted test database {organization_id}")
        except Exception as e:
            print(f"Failed to delete test database {organization_id}: {e}")


def run_command():
    command = TestCleanupCommand()
    asyncio.run(command.run())
