import pytest

from app.database.iterations.models.iteration import Iteration
from tests.acceptance.database.organizations.controllers.test_organizations import create_organization
from tests.acceptance.database.utils import create_iteration, page_results

pytestmark = pytest.mark.asyncio


async def test_add_iteration(data_app):
    organization = await create_organization(data_app)
    iteration = await create_iteration(data_app, organization.id)

    assert isinstance(iteration, Iteration)

    assert iteration.id == 1
    assert iteration.title == "Test"


async def test_get_iteration(data_app):
    organization = await create_organization(data_app)
    iteration = await create_iteration(data_app, organization.id)

    iteration = await data_app.iteration_controller.get(organization_id=organization.id, id=iteration.id)

    assert iteration.id


async def test_get_all_iteration(data_app):
    organization = await create_organization(data_app)
    await create_iteration(data_app, organization.id)
    await create_iteration(data_app, organization.id, overrides={"title": "Test 2"})

    iterations = await data_app.iteration_controller.get_all(organization_id=organization.id)

    assert len(iterations) == 2


async def test_get_all_iterations_paging(data_app):
    organization = await create_organization(data_app)
    await create_iteration(data_app, organization.id)
    await create_iteration(data_app, organization.id, overrides={"title": "Test 2"})

    items = await page_results(data_app.iteration_controller, organization_id=organization.id, limit=1)

    assert len(items) == 2
    assert items[0].id != items[1].id


async def test_update_iteration(data_app):
    organization = await create_organization(data_app)
    iteration = await create_iteration(data_app, organization.id)

    iteration.title = "Test Updated"
    iteration = await data_app.iteration_controller.update(
        organization_id=organization.id, id=iteration.id, updated_iteration=iteration, current_user="test@test.com"
    )

    assert iteration.title == "Test Updated"


async def test_delete_iteration(data_app):
    organization = await create_organization(data_app)
    iteration = await create_iteration(data_app, organization.id)

    result = await data_app.iteration_controller.delete(
        organization_id=organization.id, id=iteration.id, current_user="test@test.com"
    )

    assert result
