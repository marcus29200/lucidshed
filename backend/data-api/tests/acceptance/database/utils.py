from typing import Any, Optional


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
