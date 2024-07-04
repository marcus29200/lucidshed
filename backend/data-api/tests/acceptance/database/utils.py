from typing import Any, Dict, Optional

from app.database.iterations.models.iteration import BaseIteration, Iteration


async def page_results(
    controller: Any,
    organization_id: Optional[str] = None,
    sort: Optional[str] = None,
    limit: Optional[int] = 1000,
):
    page_limit = 100
    pages = 0
    items = []
    cursor = None

    while True:
        if organization_id:
            page, cursor = await controller.get_all(
                organization_id=organization_id, sort=sort, limit=limit, cursor=cursor
            )
        else:
            page, cursor = await controller.get_all(sort=sort, limit=limit, cursor=cursor)

        items.extend(page)

        if pages > page_limit:
            raise Exception("Too many pages, possible issue with cursor/paging")

        if not cursor:
            break

    return items


async def create_iteration(data_app, org_id, overrides: Optional[Dict[str, Any]] = {}) -> Iteration:
    data = {"title": "Test"}
    data.update(**overrides)

    iteration = BaseIteration(**data)

    iteration = await data_app.iteration_controller.create(
        organization_id=org_id, iteration=iteration, current_user="test@test.com"
    )

    assert iteration.id

    return iteration
