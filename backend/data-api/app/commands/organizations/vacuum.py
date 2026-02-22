import asyncio

from asyncpg import connect

from app.commands.organizations.base import BaseOrganizationCommand

VACUUM_INTERVAL = 30


class VacuumCommand(BaseOrganizationCommand):
    async def perform(self, organization_id: str):
        objects_removed = 0

        conn = None
        try:
            conn = await connect(
                host="localhost",
                port="5432",
                user="postgres",
                password="password",
                database=organization_id,
            )
            tables = await conn.fetch("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")

            for table in tables:
                table_name = table["table_name"]
                result = await conn.execute(
                    f"DELETE FROM {table_name} WHERE deleted_at < NOW() - INTERVAL '{VACUUM_INTERVAL} days'"
                )

                objects_removed_from_table = int(result.split(" ")[-1])
                objects_removed += objects_removed_from_table
                print(f"{objects_removed_from_table} objects from {organization_id}:{table_name}")
        except Exception as e:
            print(f"Failed to vacuum {organization_id}: {e}")
        finally:
            if conn:
                await conn.close()

        return objects_removed


def run_command():
    command = VacuumCommand()
    asyncio.run(command.run())
