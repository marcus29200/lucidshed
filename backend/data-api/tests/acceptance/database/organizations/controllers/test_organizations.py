import pytest

from asyncpg import create_pool
from app.database.utils import create_database, init_database_tables
from app.database.common.queries import INIT_STATEMENTS
from app.api.settings import data_db
from app.database.organizations.models.organization import BaseOrganization, Organization

pytestmark = pytest.mark.asyncio


async def create_organization(data_app) -> Organization:
    base_organization = BaseOrganization(id=data_app.test_org_id, title="Test")

    async with create_pool(
        host="localhost", port="5432", user="postgres", password="password"
    ) as pool, pool.acquire() as conn:
        await create_database(conn, data_app.test_org_id)

    pool = await create_pool(
        host="localhost", port="5432", database=data_app.test_org_id, user="postgres", password="password"
    )
    data_db.set(await pool.acquire())
    await init_database_tables(data_db.get(), INIT_STATEMENTS)

    organization = await data_app.organization_controller.create(
        organization=base_organization, current_user="test@test.com"
    )

    assert organization.id

    return organization


async def test_add_organization(data_app):
    organization = await create_organization(data_app)

    assert isinstance(organization, Organization)

    assert organization.id == data_app.test_org_id
    assert organization.title == "Test"


async def test_get_organization(data_app):
    organization = await create_organization(data_app)

    organization = await data_app.organization_controller.get(id=organization.id)

    assert organization.id


async def test_update_organization(data_app):
    organization = await create_organization(data_app)

    organization.title = "Test Updated"
    organization = await data_app.organization_controller.update(
        id=organization.id, updated_organization=organization, current_user="test@test.com"
    )

    assert organization.id
    assert organization.title == "Test Updated"


async def test_delete_organization(data_app):
    organization = await create_organization(data_app)

    result = await data_app.organization_controller.delete(id=organization.id, current_user="test@test.com")

    assert result
