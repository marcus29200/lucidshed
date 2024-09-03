from argparse import ArgumentParser

from asyncpg import connect


class BaseOrganizationCommand:
    """
    Base class for running a command against all or specific organizations
    """

    def __init__(self, *args, **kwargs):
        self.parser = ArgumentParser()

        # Shouldn't be required
        self.parser.add_argument("--organizations", dest="organizations", type=str, default=None)

    # Get the organizations to run the command against
    async def get_organizations(self):
        try:
            org_ids = []
            # Connect to postgres
            conn = await connect(
                host="localhost",
                port="5432",
                user="postgres",
                password="password",
            )
            # List all databases
            databases = await conn.fetch("SELECT datname FROM pg_database")

            for database in databases:
                if not isinstance(database, str) and database["datname"] not in [
                    "users",
                    "postgres",
                    "template1",
                    "template0",
                ]:
                    org_ids.append(database["datname"])
        finally:
            await conn.close()

        return org_ids

    async def run(self):
        organizations = self.parser.parse_args().organizations

        org_ids = []
        if organizations:
            org_ids = organizations.split(",")

        if not org_ids:
            org_ids = await self.get_organizations()

        for org_id in org_ids:
            await self.perform(org_id)

    async def perform(self, organization_id: str):
        pass
