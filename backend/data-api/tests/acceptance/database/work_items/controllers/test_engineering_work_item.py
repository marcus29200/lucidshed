from typing import Optional

import pytest

from app.database.work_items.controllers.engineering_item import WorkItemSortableField
from app.database.work_items.models.comment import BaseWorkItemComment
from app.database.work_items.models.engineering_item import BaseEngineeringItem, EngineeringItem, EngineeringItemType
from app.exceptions.common import ObjectNotFoundException
from tests.acceptance.database.organizations.controllers.test_organizations import create_organization
from tests.acceptance.database.utils import create_iteration, create_team, page_results

pytestmark = pytest.mark.asyncio


async def create_engineering_item(
    data_app,
    org_id,
    item_type: Optional[EngineeringItemType] = EngineeringItemType.STORY.value,
    iteration_id: Optional[str] = None,
    team_id: Optional[str] = None,
    title: Optional[str] = "Test",
) -> EngineeringItem:
    base_engineering_item = BaseEngineeringItem(
        title=title, description="Test description", item_type=item_type, iteration_id=iteration_id, team_id=team_id
    )

    engineering_item = await data_app.engineering_controller.create(
        organization_id=org_id, new_engineering_item=base_engineering_item, current_user="test@test.com"
    )

    assert engineering_item.id

    return engineering_item


async def test_add_engineering_work_item(data_app):
    org = await create_organization(data_app)
    engineering_item = await create_engineering_item(data_app, org.id)

    assert isinstance(engineering_item, EngineeringItem)

    assert engineering_item.title == "Test"
    assert engineering_item.description == "Test description"
    assert engineering_item.created_at
    assert engineering_item.modified_at
    assert engineering_item.item_type == EngineeringItemType.STORY


async def test_add_engineering_work_item_defaults_item_type_to_valid_value(data_app):
    org = await create_organization(data_app)
    engineering_item = await create_engineering_item(data_app, org.id, item_type=None)

    assert isinstance(engineering_item, EngineeringItem)

    assert engineering_item.id
    assert engineering_item.title == "Test"
    assert engineering_item.description == "Test description"
    assert engineering_item.created_at
    assert engineering_item.modified_at
    assert engineering_item.item_type == EngineeringItemType.STORY


async def test_get_engineering_work_item(data_app):
    org = await create_organization(data_app)
    engineering_item = await create_engineering_item(data_app, org.id)

    engineering_item = await data_app.engineering_controller.get(organization_id=org.id, id=engineering_item.id)

    assert engineering_item.id


async def test_get_engineering_work_item_raises_not_found_exception(data_app):
    org = await create_organization(data_app)

    with pytest.raises(ObjectNotFoundException):
        await data_app.engineering_controller.get(organization_id=org.id, id=0)


async def test_get_all_engineering_work_item(data_app):
    org = await create_organization(data_app)
    await create_engineering_item(data_app, org.id)
    await create_engineering_item(data_app, org.id)

    items = await page_results(
        data_app.engineering_controller, organization_id=org.id, item_type=EngineeringItemType.STORY, limit=1
    )

    assert len(items) == 2
    assert isinstance(items[0], EngineeringItem)
    assert isinstance(items[1], EngineeringItem)


async def test_get_all_engineering_work_item_filtered_by_stories(data_app):
    org = await create_organization(data_app)
    await create_engineering_item(data_app, org.id)
    await create_engineering_item(data_app, org.id)
    await create_engineering_item(data_app, org.id, item_type=EngineeringItemType.EPIC.value)

    items = await page_results(
        data_app.engineering_controller, organization_id=org.id, item_type=EngineeringItemType.STORY, limit=1
    )

    assert len(items) == 2
    assert isinstance(items[0], EngineeringItem)
    assert isinstance(items[1], EngineeringItem)


async def test_get_all_engineering_work_item_paging(data_app):
    org = await create_organization(data_app)
    await create_engineering_item(data_app, org.id)
    await create_engineering_item(data_app, org.id)

    items = await page_results(
        data_app.engineering_controller, organization_id=org.id, item_type=EngineeringItemType.STORY, limit=1
    )

    assert len(items) == 2
    assert isinstance(items[0], EngineeringItem)
    assert items[0].id != items[1].id


# NOTE This test is out of order right now because we don't have the sort param fully implemented
async def _test_get_all_engineering_work_item_paging_sorting(data_app):
    org = await create_organization(data_app)
    await create_engineering_item(data_app, org.id, title="Test2")
    await create_engineering_item(data_app, org.id, title="Test1")

    items = await page_results(
        data_app.engineering_controller,
        organization_id=org.id,
        sort=WorkItemSortableField.TITLE,
        page_size=1,
    )

    assert len(items) == 2
    assert items[0].title == "Test1"
    assert items[1].title == "Test2"


async def test_update_engineering_work_item(data_app):
    org = await create_organization(data_app)
    engineering_item = await create_engineering_item(data_app, org.id)

    engineering_item.title = "Test Updated"
    assert engineering_item.modified_at
    old_modified_at = engineering_item.modified_at

    engineering_item = await data_app.engineering_controller.update(
        organization_id=org.id,
        id=engineering_item.id,
        updated_engineering_item=engineering_item,
        current_user="test@test.com",
    )

    assert engineering_item.title == "Test Updated"
    assert engineering_item.description == "Test description"
    assert engineering_item.modified_at > old_modified_at


async def test_delete_engineering_work_item(data_app):
    org = await create_organization(data_app)
    engineering_item = await create_engineering_item(data_app, org.id)

    result = await data_app.engineering_controller.delete(
        organization_id=engineering_item.organization_id,
        id=engineering_item.id,
        current_user="test@test.com",
        scope="ENGINEERING",
    )

    assert result is True


async def test_delete_engineering_work_item_fails_when_doesnt_exist(data_app):
    org = await create_organization(data_app)

    with pytest.raises(ObjectNotFoundException):
        await data_app.engineering_controller.delete(
            organization_id=org.id, id=0, current_user="test@test.com", scope="ENGINEERING"
        )


async def test_create_engineering_item_with_iteration(data_app):
    org = await create_organization(data_app)
    iteration = await create_iteration(data_app, org.id)
    engineering_item = await create_engineering_item(data_app, org.id, iteration_id=iteration.id)

    assert engineering_item.iteration == iteration


async def test_assign_iteration_to_engineering_item(data_app):
    org = await create_organization(data_app)
    engineering_item = await create_engineering_item(data_app, org.id)
    iteration = await create_iteration(data_app, org.id)

    engineering_item.iteration_id = iteration.id
    engineering_item = await data_app.engineering_controller.update(
        organization_id=org.id,
        id=engineering_item.id,
        updated_engineering_item=engineering_item,
        current_user="test@test.com",
    )

    assert engineering_item.iteration == iteration


async def test_get_engineering_item_with_iteration(data_app):
    org = await create_organization(data_app)
    iteration = await create_iteration(data_app, org.id)
    engineering_item = await create_engineering_item(data_app, org.id, iteration_id=iteration.id)

    engineering_item = await data_app.engineering_controller.get(organization_id=org.id, id=engineering_item.id)

    assert engineering_item.iteration == iteration


async def test_get_all_engineering_work_item_with_iteration(data_app):
    org = await create_organization(data_app)
    iteration = await create_iteration(data_app, org.id)
    await create_engineering_item(data_app, org.id, iteration_id=iteration.id)
    await create_engineering_item(data_app, org.id)

    items = await page_results(
        data_app.engineering_controller, organization_id=org.id, item_type=EngineeringItemType.STORY, limit=1
    )

    assert len(items) == 2

    assert items[0].iteration.id == iteration.id
    assert not items[1].iteration


async def test_create_engineering_item_with_team(data_app):
    org = await create_organization(data_app)
    team = await create_team(data_app, org.id)
    engineering_item = await create_engineering_item(data_app, org.id, team_id=team.id)

    assert engineering_item.team == team


async def test_assign_team_to_engineering_item(data_app):
    org = await create_organization(data_app)
    engineering_item = await create_engineering_item(data_app, org.id)
    team = await create_team(data_app, org.id)

    engineering_item.team_id = team.id
    engineering_item = await data_app.engineering_controller.update(
        organization_id=org.id,
        id=engineering_item.id,
        updated_engineering_item=engineering_item,
        current_user="test@test.com",
    )

    assert engineering_item.team == team


async def test_get_engineering_item_with_team(data_app):
    org = await create_organization(data_app)
    team = await create_team(data_app, org.id)
    engineering_item = await create_engineering_item(data_app, org.id, team_id=team.id)

    engineering_item = await data_app.engineering_controller.get(organization_id=org.id, id=engineering_item.id)

    assert engineering_item.team == team


async def test_get_all_engineering_work_item_with_team(data_app):
    org = await create_organization(data_app)
    team = await create_team(data_app, org.id)
    await create_engineering_item(data_app, org.id, team_id=team.id)
    await create_engineering_item(data_app, org.id)

    items = await page_results(
        data_app.engineering_controller, organization_id=org.id, item_type=EngineeringItemType.STORY, limit=1
    )

    assert len(items) == 2

    assert items[0].team.id == team.id
    assert not items[1].team


async def test_create_comment_on_engineering_item(data_app):
    org = await create_organization(data_app)
    engineering_item = await create_engineering_item(data_app, org.id)

    new_comment = BaseWorkItemComment(description="Testing 123")
    comment = await data_app.engineering_controller.create_comment(
        organization_id=org.id, work_item_id=engineering_item.id, new_comment=new_comment, current_user="test@test.com"
    )

    assert comment.id


async def test_get_comment_on_engineering_item(data_app):
    org = await create_organization(data_app)
    engineering_item = await create_engineering_item(data_app, org.id)

    new_comment = BaseWorkItemComment(description="Testing 123")
    comment = await data_app.engineering_controller.create_comment(
        organization_id=org.id, work_item_id=engineering_item.id, new_comment=new_comment, current_user="test@test.com"
    )

    comment = await data_app.engineering_controller.get_comment(
        organization_id=org.id, work_item_id=engineering_item.id, id=comment.id
    )
    assert comment.id


async def test_update_comment_on_engineering_item(data_app):
    org = await create_organization(data_app)
    engineering_item = await create_engineering_item(data_app, org.id)

    new_comment = BaseWorkItemComment(description="Testing 123")
    comment = await data_app.engineering_controller.create_comment(
        organization_id=org.id, work_item_id=engineering_item.id, new_comment=new_comment, current_user="test@test.com"
    )

    comment.description = "Test Updated 123"
    updated_comment = await data_app.engineering_controller.update_comment(
        organization_id=org.id,
        work_item_id=engineering_item.id,
        id=comment.id,
        updated_comment=comment,
        current_user="test@test.com",
    )
    assert updated_comment.description == comment.description
    assert updated_comment.modified_at > comment.modified_at


async def test_delete_comment_on_engineering_item(data_app):
    org = await create_organization(data_app)
    engineering_item = await create_engineering_item(data_app, org.id)

    new_comment = BaseWorkItemComment(description="Testing 123")
    comment = await data_app.engineering_controller.create_comment(
        organization_id=org.id, work_item_id=engineering_item.id, new_comment=new_comment, current_user="test@test.com"
    )

    result = await data_app.engineering_controller.delete_comment(
        organization_id=org.id, work_item_id=engineering_item.id, id=comment.id, current_user="test@test.com"
    )
    assert result


async def test_delete_comments_on_engineering_item(data_app):
    org = await create_organization(data_app)
    engineering_item = await create_engineering_item(data_app, org.id)

    new_comment = BaseWorkItemComment(description="Testing 123")
    await data_app.engineering_controller.create_comment(
        organization_id=org.id, work_item_id=engineering_item.id, new_comment=new_comment, current_user="test@test.com"
    )
    await data_app.engineering_controller.create_comment(
        organization_id=org.id, work_item_id=engineering_item.id, new_comment=new_comment, current_user="test@test.com"
    )

    result = await data_app.engineering_controller.delete_comments(
        organization_id=org.id, work_item_id=engineering_item.id, current_user="test@test.com"
    )
    assert result == "2"
