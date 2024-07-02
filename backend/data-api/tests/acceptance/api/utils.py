from typing import Optional


async def page_results(
    data_api,
    endpoint,
    sort: Optional[str] = None,
    limit: Optional[int] = 1000,
):
    page_limit = 100
    pages = 0
    items = []
    cursor = None

    while True:
        response = await data_api.get(
            f"{endpoint}?sort={sort if sort else 'id'}&limit={limit}&cursor={cursor if cursor else ''}"
        )
        assert response.status_code == 200

        data = response.json()

        assert len(data["items"]) <= limit
        items.extend(data.get("items") or [])

        cursor = data.get("cursor")

        if not cursor and len(data["items"]) >= limit:
            raise Exception("Expected cursor when length of items is greater/equal to limit")

        if pages > page_limit:
            raise Exception("Too many pages, possible issue with cursor/paging")

        if not cursor:
            break

    return items
