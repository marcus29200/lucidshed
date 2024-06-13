import pytest

from app.database.organizations.models.organization import BaseOrganization, Organization

pytestmark = pytest.mark.asyncio


async def create_organization(data_app) -> Organization:
    base_organization = BaseOrganization(id="test", title="Test")

    organization = await data_app.organization_controller.create(
        organization=base_organization, current_user="test@test.com"
    )

    assert organization.id

    return organization


async def test_add_organization(data_app):
    organization = await create_organization(data_app)

    assert isinstance(organization, Organization)

    assert organization.id == "test"
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
