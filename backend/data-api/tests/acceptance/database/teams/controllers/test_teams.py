import pytest

from app.database.teams.models.team import Team
from tests.acceptance.database.organizations.controllers.test_organizations import create_organization
from tests.acceptance.database.utils import create_team, page_results

pytestmark = pytest.mark.asyncio


async def test_add_team(data_app):
    await create_organization(data_app)
    team = await create_team(data_app)

    assert isinstance(team, Team)

    assert team.id
    assert team.title == "Test"


async def test_get_team(data_app):
    await create_organization(data_app)
    team = await create_team(data_app)

    team = await data_app.team_controller.get(id=team.id)

    assert team.id


async def test_get_all_team(data_app):
    await create_organization(data_app)
    await create_team(data_app)
    await create_team(data_app, overrides={"title": "Test 2"})

    teams = await data_app.team_controller.get_all()

    assert len(teams) == 2


async def _test_get_all_teams_paging(data_app):
    await create_organization(data_app)
    await create_team(data_app)
    await create_team(data_app, overrides={"title": "Test 2"})

    items = await page_results(data_app.team_controller, limit=1)

    assert len(items) == 2
    assert items[0].id != items[1].id


async def test_update_team(data_app):
    await create_organization(data_app)
    team = await create_team(data_app)

    team.title = "Test Updated"
    team = await data_app.team_controller.update(id=team.id, updated_item=team, current_user="test@test.com")

    assert team.title == "Test Updated"


async def test_delete_team(data_app):
    await create_organization(data_app)
    team = await create_team(data_app)

    result = await data_app.team_controller.delete(id=team.id, current_user="test@test.com")

    assert result
