import asyncio

from app.api.dependencies.database import get_pool
from app.commands.organizations.base import BaseOrganizationCommand


class TestCleanupCommand(BaseOrganizationCommand):
    async def perform(self, organization_id):
        try:
            pool = await get_pool(db_name=organization_id)
            async with pool.acquire() as conn:
                await conn.execute(f"DROP DATABASE IF EXISTS {organization_id}")

                print(f"Deleted test database {organization_id}")

            await pool.close()
        except Exception as e:
            print(f"Failed to delete test database {organization_id}: {e}")


def run_command():
    command = TestCleanupCommand()
    asyncio.run(command.run())
