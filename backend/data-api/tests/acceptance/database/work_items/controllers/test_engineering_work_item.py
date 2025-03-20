from typing import Optional

import pytest

from app.database.work_items.controllers.engineering_item import WorkItemSortableField
from app.database.work_items.models.comment import BaseWorkItemComment
from app.database.work_items.models.engineering_item import (
    BaseEngineeringItem,
    EngineeringItem,
    EngineeringItemType,
    EngineeringLinkType,
)
from app.exceptions.common import ObjectNotFoundException
from tests.acceptance.database.organizations.controllers.test_organizations import create_organization
from tests.acceptance.database.utils import create_iteration, create_team, page_results

pytestmark = pytest.mark.asyncio


async def create_engineering_item(
    data_app,
    item_type: Optional[EngineeringItemType] = EngineeringItemType.STORY.value,
    iteration_id: Optional[str] = None,
    team_id: Optional[str] = None,
    title: Optional[str] = "Test",
) -> EngineeringItem:
    base_engineering_item = BaseEngineeringItem(
        title=title, description="Test description", item_type=item_type, iteration_id=iteration_id, team_id=team_id
    )

    engineering_item = await data_app.engineering_controller.create(
        new_item=base_engineering_item, current_user="test@test.com"
    )

    assert engineering_item.id

    return engineering_item


async def test_add_engineering_work_item(data_app):
    await create_organization(data_app)
    engineering_item = await create_engineering_item(data_app)

    assert isinstance(engineering_item, EngineeringItem)

    assert engineering_item.title == "Test"
    assert engineering_item.description == "Test description"
    assert engineering_item.created_at
    assert engineering_item.modified_at
    assert engineering_item.item_type == EngineeringItemType.STORY


async def test_add_engineering_work_item_creates_history(data_app):
    await create_organization(data_app)
    engineering_item = await create_engineering_item(data_app)

    assert engineering_item.id

    history_items = await data_app.history_controller.get_all(item_id=engineering_item.id, item_type="engineering_item")

    assert len(history_items) == 1
    assert history_items[0].item_id == str(engineering_item.id)
    assert history_items[0].item_type == "engineering_item"
    assert history_items[0].action == "create"
    assert history_items[0].metadata["title"] == "Test"


async def test_add_engineering_work_item_gets_only_story_history(data_app):
    await create_organization(data_app)
    engineering_item = await create_engineering_item(data_app)
    await create_engineering_item(data_app, item_type=EngineeringItemType.EPIC.value)

    history_items = await data_app.history_controller.get_all(item_id=engineering_item.id, item_type="engineering_item")

    assert len(history_items) == 1
    assert history_items[0].item_id == str(engineering_item.id)
    assert history_items[0].item_type == "engineering_item"
    assert history_items[0].action == "create"
    assert history_items[0].metadata["title"] == "Test"


async def test_get_engineering_work_item(data_app):
    await create_organization(data_app)
    engineering_item = await create_engineering_item(data_app)

    engineering_item = await data_app.engineering_controller.get(id=engineering_item.id)

    assert engineering_item.id


async def test_get_engineering_work_item_raises_not_found_exception(data_app):
    await create_organization(data_app)

    with pytest.raises(ObjectNotFoundException):
        await data_app.engineering_controller.get(id="test")


async def test_get_all_engineering_work_item(data_app):
    await create_organization(data_app)
    await create_engineering_item(data_app)
    await create_engineering_item(data_app)

    items = await page_results(data_app.engineering_controller, item_type=EngineeringItemType.STORY, limit=1)

    assert len(items) == 2
    assert isinstance(items[0], EngineeringItem)
    assert isinstance(items[1], EngineeringItem)


async def test_get_all_engineering_work_item_filtered_by_stories(data_app):
    await create_organization(data_app)
    await create_engineering_item(data_app)
    await create_engineering_item(data_app)
    await create_engineering_item(data_app, item_type=EngineeringItemType.EPIC.value)

    items = await page_results(data_app.engineering_controller, item_type=EngineeringItemType.STORY, limit=1)

    assert len(items) == 2
    assert isinstance(items[0], EngineeringItem)
    assert isinstance(items[1], EngineeringItem)


async def test_get_all_engineering_work_item_paging(data_app):
    await create_organization(data_app)
    await create_engineering_item(data_app)
    await create_engineering_item(data_app)

    items = await page_results(data_app.engineering_controller, item_type=EngineeringItemType.STORY, limit=1)

    assert len(items) == 2
    assert isinstance(items[0], EngineeringItem)
    assert items[0].id != items[1].id


# NOTE This test is out of order right now because we don't have the sort param fully implemented
async def _test_get_all_engineering_work_item_paging_sorting(data_app):
    await create_organization(data_app)
    await create_engineering_item(data_app, title="Test2")
    await create_engineering_item(data_app, title="Test1")

    items = await page_results(data_app.engineering_controller, sort=WorkItemSortableField.TITLE, page_size=1)

    assert len(items) == 2
    assert items[0].title == "Test1"
    assert items[1].title == "Test2"


async def test_update_multiple_engineering_work_item(data_app):
    await create_organization(data_app)
    engineering_item = await create_engineering_item(data_app)
    engineering_item_2 = await create_engineering_item(data_app)

    assert engineering_item.modified_at
    old_modified_at = engineering_item.modified_at
    assert engineering_item_2.modified_at
    old_modified_at_2 = engineering_item_2.modified_at

    updated_items = [
        BaseEngineeringItem(id=engineering_item.id, title="Test Updated"),
        BaseEngineeringItem(id=engineering_item_2.id, description="Test description 2"),
    ]
    await data_app.engineering_controller.batch_update(
        updated_items=updated_items,
        current_user="test@test.com",
    )

    engineering_items = await data_app.engineering_controller.get_batch_by_id(
        ids=[engineering_item.id, engineering_item_2.id]
    )

    assert engineering_items[0].title == "Test Updated"
    assert engineering_items[0].modified_at > old_modified_at
    assert engineering_items[1].description == "Test description 2"
    assert engineering_items[1].modified_at > old_modified_at_2


async def test_update_engineering_work_item(data_app):
    await create_organization(data_app)
    engineering_item = await create_engineering_item(data_app)

    assert engineering_item.modified_at
    old_modified_at = engineering_item.modified_at

    update = BaseEngineeringItem(id=engineering_item.id, title="Test Updated")
    engineering_item = await data_app.engineering_controller.update(
        id=engineering_item.id,
        updated_item=update,
        current_user="test@test.com",
    )

    assert engineering_item.title == "Test Updated"
    # This should not change
    assert engineering_item.description == "Test description"
    assert engineering_item.modified_at > old_modified_at


async def test_update_engineering_work_item_creates_history(data_app):
    await create_organization(data_app)
    engineering_item = await create_engineering_item(data_app)

    update = BaseEngineeringItem(title="Test Updated")
    engineering_item = await data_app.engineering_controller.update(
        id=engineering_item.id,
        updated_item=update,
        current_user="test@test.com",
    )

    history_items = await data_app.history_controller.get_all(item_id=engineering_item.id, item_type="engineering_item")

    assert len(history_items) == 2
    assert history_items[1].item_id == str(engineering_item.id)
    assert history_items[1].item_type == "engineering_item"
    assert history_items[1].action == "update"
    assert history_items[1].metadata["title"] == "Test Updated"


async def test_delete_engineering_work_item(data_app):
    await create_organization(data_app)
    engineering_item = await create_engineering_item(data_app)

    result = await data_app.engineering_controller.delete(id=engineering_item.id, current_user="test@test.com")

    assert result is True


async def test_delete_engineering_work_item_fails_when_doesnt_exist(data_app):
    await create_organization(data_app)

    with pytest.raises(ObjectNotFoundException):
        await data_app.engineering_controller.delete(id="test", current_user="test@test.com")


async def test_delete_engineering_item_creates_history(data_app):
    await create_organization(data_app)
    engineering_item = await create_engineering_item(data_app)

    result = await data_app.engineering_controller.delete(id=engineering_item.id, current_user="test@test.com")

    assert result

    history_items = await data_app.history_controller.get_all(item_id=engineering_item.id, item_type="engineering_item")

    assert len(history_items) == 2
    assert history_items[1].item_id == str(engineering_item.id)
    assert history_items[1].item_type == "engineering_item"
    assert history_items[1].action == "delete"


async def test_create_engineering_item_with_iteration(data_app):
    await create_organization(data_app)
    iteration = await create_iteration(data_app)
    engineering_item = await create_engineering_item(data_app, iteration_id=iteration.id)

    assert engineering_item.iteration == iteration


async def test_assign_iteration_to_engineering_item(data_app):
    await create_organization(data_app)
    engineering_item = await create_engineering_item(data_app)
    iteration = await create_iteration(data_app)

    # Convert back to a base item, because this is what the API would be sending
    engineering_item = BaseEngineeringItem(**engineering_item.model_dump(exclude_unset=True))

    engineering_item.iteration_id = iteration.id
    engineering_item = await data_app.engineering_controller.update(
        id=engineering_item.id,
        updated_item=engineering_item,
        current_user="test@test.com",
    )

    assert engineering_item.iteration == iteration


async def test_get_engineering_item_with_iteration(data_app):
    await create_organization(data_app)
    iteration = await create_iteration(data_app)
    engineering_item = await create_engineering_item(data_app, iteration_id=iteration.id)

    engineering_item = await data_app.engineering_controller.get(id=engineering_item.id)

    assert engineering_item.iteration == iteration


async def test_get_engineering_item_with_deleted_iteration(data_app):
    await create_organization(data_app)
    iteration = await create_iteration(data_app)
    engineering_item = await create_engineering_item(data_app, iteration_id=iteration.id)

    engineering_item = await data_app.engineering_controller.get(id=engineering_item.id)

    assert engineering_item.iteration

    # Now delete the iteration
    await data_app.iteration_controller.delete(id=iteration.id, current_user="test@test.com")

    engineering_item = await data_app.engineering_controller.get(id=engineering_item.id)

    assert engineering_item.iteration is None


# FIXME: There's an issue in this where if you specify None for the iteration, it returns only ones without an
# iteration, this should ideally be able to return everything when iteration is not specified.
async def _test_get_all_engineering_work_item_with_iteration(data_app):
    await create_organization(data_app)
    iteration = await create_iteration(data_app)
    await create_engineering_item(data_app, iteration_id=iteration.id)
    await create_engineering_item(data_app)

    items = await page_results(data_app.engineering_controller, item_type=EngineeringItemType.STORY, limit=1)

    assert len(items) == 2

    assert items[0].iteration.id == iteration.id
    assert not items[1].iteration


async def test_get_all_engineering_work_item_filtered_by_iteration(data_app):
    await create_organization(data_app)
    iteration = await create_iteration(data_app)
    await create_engineering_item(data_app, iteration_id=iteration.id)
    await create_engineering_item(data_app)

    items = await page_results(
        data_app.engineering_controller,
        item_type=EngineeringItemType.STORY,
        iteration_id=iteration.id,
        limit=1,
    )

    assert len(items) == 1

    assert items[0].iteration.id == iteration.id


async def test_create_engineering_item_with_team(data_app):
    await create_organization(data_app)
    team = await create_team(data_app)
    engineering_item = await create_engineering_item(data_app, team_id=team.id)

    assert engineering_item.team == team


async def test_assign_team_to_engineering_item(data_app):
    await create_organization(data_app)
    engineering_item = await create_engineering_item(data_app)
    team = await create_team(data_app)

    engineering_item = BaseEngineeringItem(**engineering_item.model_dump(exclude_unset=True))

    engineering_item.team_id = team.id
    engineering_item = await data_app.engineering_controller.update(
        id=engineering_item.id,
        updated_item=engineering_item,
        current_user="test@test.com",
    )

    assert engineering_item.team == team


async def test_get_engineering_item_with_team(data_app):
    await create_organization(data_app)
    team = await create_team(data_app)
    engineering_item = await create_engineering_item(data_app, team_id=team.id)

    engineering_item = await data_app.engineering_controller.get(id=engineering_item.id)

    assert engineering_item.team == team


async def test_get_all_engineering_work_item_with_team(data_app):
    await create_organization(data_app)
    team = await create_team(data_app)
    await create_engineering_item(data_app, team_id=team.id)
    await create_engineering_item(data_app)

    items = await page_results(data_app.engineering_controller, item_type=EngineeringItemType.STORY, limit=1)

    assert len(items) == 2

    assert items[1].team.id == team.id
    assert not items[0].team


async def test_create_comment_on_engineering_item(data_app):
    await create_organization(data_app)
    engineering_item = await create_engineering_item(data_app)

    new_comment = BaseWorkItemComment(description="Testing 123")
    comment = await data_app.engineering_controller.create_comment(
        work_item_id=engineering_item.id, new_comment=new_comment, current_user="test@test.com"
    )

    assert comment.id


async def test_get_comment_on_engineering_item(data_app):
    await create_organization(data_app)
    engineering_item = await create_engineering_item(data_app)

    new_comment = BaseWorkItemComment(description="Testing 123")
    comment = await data_app.engineering_controller.create_comment(
        work_item_id=engineering_item.id, new_comment=new_comment, current_user="test@test.com"
    )

    comment = await data_app.engineering_controller.get_comment(work_item_id=engineering_item.id, id=comment.id)
    assert comment.id


async def test_update_comment_on_engineering_item(data_app):
    await create_organization(data_app)
    engineering_item = await create_engineering_item(data_app)

    new_comment = BaseWorkItemComment(description="Testing 123")
    comment = await data_app.engineering_controller.create_comment(
        work_item_id=engineering_item.id, new_comment=new_comment, current_user="test@test.com"
    )

    comment.description = "Test Updated 123"
    updated_comment = await data_app.engineering_controller.update_comment(
        work_item_id=engineering_item.id,
        id=comment.id,
        updated_comment=comment,
        current_user="test@test.com",
    )
    assert updated_comment.description == comment.description
    assert updated_comment.modified_at > comment.modified_at


async def test_delete_comment_on_engineering_item(data_app):
    await create_organization(data_app)
    engineering_item = await create_engineering_item(data_app)

    new_comment = BaseWorkItemComment(description="Testing 123")
    comment = await data_app.engineering_controller.create_comment(
        work_item_id=engineering_item.id, new_comment=new_comment, current_user="test@test.com"
    )

    result = await data_app.engineering_controller.delete_comment(
        work_item_id=engineering_item.id, id=comment.id, current_user="test@test.com"
    )
    assert result


async def test_delete_comments_on_engineering_item(data_app):
    await create_organization(data_app)
    engineering_item = await create_engineering_item(data_app)

    new_comment = BaseWorkItemComment(description="Testing 123")
    await data_app.engineering_controller.create_comment(
        work_item_id=engineering_item.id, new_comment=new_comment, current_user="test@test.com"
    )
    await data_app.engineering_controller.create_comment(
        work_item_id=engineering_item.id, new_comment=new_comment, current_user="test@test.com"
    )

    result = await data_app.engineering_controller.delete_comments(
        work_item_id=engineering_item.id, current_user="test@test.com"
    )
    assert result == "2"


async def test_should_link_epic_to_story(data_app):
    await create_organization(data_app)
    epic = await create_engineering_item(data_app, item_type=EngineeringItemType.EPIC.value)
    story = await create_engineering_item(data_app, item_type=EngineeringItemType.STORY.value)

    result = await data_app.engineering_controller.link(
        item_1=epic.id,
        item_2=story.id,
        link_type=EngineeringLinkType.BLOCKED,
        current_user="test@test.com",
    )

    assert result


async def test_should_get_all_unique_linked_items(data_app):
    await create_organization(data_app)
    epic = await create_engineering_item(data_app, item_type=EngineeringItemType.EPIC.value)
    story = await create_engineering_item(data_app, item_type=EngineeringItemType.STORY.value)
    story_2 = await create_engineering_item(data_app, item_type=EngineeringItemType.STORY.value)
    await create_engineering_item(data_app, item_type=EngineeringItemType.STORY.value)

    await data_app.engineering_controller.link(
        item_1=epic.id,
        item_2=story.id,
        link_type=EngineeringLinkType.RELATED,
        current_user="test@test.com",
    )
    await data_app.engineering_controller.link(
        item_1=epic.id,
        item_2=story_2.id,
        link_type=EngineeringLinkType.RELATED,
        current_user="test@test.com",
    )

    linked_items, _ = await data_app.engineering_controller.get_all(item_type=EngineeringItemType.EPIC)

    assert len(linked_items) == 1


async def test_should_get_all_linked_items(data_app):
    await create_organization(data_app)
    epic = await create_engineering_item(data_app, item_type=EngineeringItemType.EPIC.value)
    story = await create_engineering_item(data_app, item_type=EngineeringItemType.STORY.value)
    await create_engineering_item(data_app, item_type=EngineeringItemType.STORY.value)

    await data_app.engineering_controller.link(
        item_1=epic.id,
        item_2=story.id,
        link_type=EngineeringLinkType.BLOCKED,
        current_user="test@test.com",
    )

    linked_items, _ = await data_app.engineering_controller.get_all(related_item_id=epic.id)

    assert len(linked_items) == 1
