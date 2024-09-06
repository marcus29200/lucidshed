from typing import Any, Dict

import pytest

from app.api.dependencies.database import get_pool
from app.api.settings import data_db
from app.database.organizations.models.organization import BaseOrganization, Organization

pytestmark = pytest.mark.asyncio


async def create_organization(data_app, overrides: Dict[str, Any] = {}) -> Organization:
    data_db.set(await get_pool(data_app.test_org_id))

    org_obj = {"id": data_app.test_org_id, "title": "Test"}
    org_obj.update(**overrides)

    organization = await data_app.organization_controller.create(
        organization=BaseOrganization(**org_obj), current_user="test@test.com"
    )

    assert organization.id

    return organization


async def test_add_organization(data_app):
    organization = await create_organization(data_app)

    assert isinstance(organization, Organization)

    assert organization.id == data_app.test_org_id
    assert organization.title == "Test"


async def test_add_organization_with_settings(data_app):
    organization = await create_organization(data_app, overrides={"settings": {"test": "value"}})

    assert organization.settings == {"test": "value"}


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


async def test_update_organization_with_settings(data_app):
    organization = await create_organization(data_app)

    organization.settings = {"test": "value"}
    organization = await data_app.organization_controller.update(
        id=organization.id, updated_organization=organization, current_user="test@test.com"
    )

    assert organization.settings == {"test": "value"}


async def test_delete_organization(data_app):
    organization = await create_organization(data_app)

    result = await data_app.organization_controller.delete(id=organization.id, current_user="test@test.com")

    assert result
