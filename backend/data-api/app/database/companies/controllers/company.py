from typing import List, Optional, Tuple

from app.api.settings import data_db
from app.api.utils import generate_cursor, parse_cursor
from app.database.companies.models.company import BaseCompany, Company
from app.database.companies.queries import COMPANY_QUERIES as QUERIES
from app.exceptions.common import ObjectNotFoundException
from app.database.work_items.models.work_item import WorkItemSortableField


class CompanyController:
    async def create(self, *, new_item: BaseCompany, current_user: str) -> Company:
        company = await self.get_by_name(name=new_item.name)
        if not company:
            record = await data_db.get().fetchrow(
                QUERIES["CREATE_COMPANY"], new_item.name, new_item.description, current_user, current_user
            )
            return Company(**record)

    async def get(self, *, id: int) -> Optional[Company]:
        record = await data_db.get().fetchrow(
            QUERIES["GET_COMPANY"],
            id,
        )

        if not record:
            raise ObjectNotFoundException(object_id=id)

        return Company(**record)

    async def get_by_name(self, *, name: str) -> Optional[Company]:
        record = await data_db.get().fetchrow(
            QUERIES["GET_COMPANY_BY_NAME"],
            name.strip(),
        )
        if not record:
            return None

        return Company(**record)

    async def get_all(
        self,
        *,
        sort: Optional[WorkItemSortableField] = WorkItemSortableField.ID,
        limit: Optional[int] = 1000,
        cursor: Optional[str] = None,
    ) -> Tuple[List[Company], str | None]:
        if (
            sort and sort not in WorkItemSortableField
        ):  # TODO: add fields to WorkItemSortableField or make a new one for FeatureRequest
            raise Exception(f"Invalid sort field: {sort}")

        # TODO: implement determine_get_all_filter_conditions for FeatureRequest
        # filter_conditions = determine_get_all_filter_conditions(company_id=company_id)
        filter_conditions = None
        query: str = QUERIES["GET_ALL_COMPANIES"]
        if filter_conditions:
            query = query.replace("$FILTER_CONDITIONS", " AND " + " AND ".join(filter_conditions))
        else:
            query = query.replace("$FILTER_CONDITIONS", "")

        offset = 0
        if cursor:
            sort, offset, extra = parse_cursor(cursor)

            # item_type = extra.get("item_type") or item_type

        records = await data_db.get().fetch(
            query,
            sort if sort else WorkItemSortableField.ID.value,
            limit,
            offset,
        )

        cursor = None
        if len(records) == limit:
            # cursor = generate_cursor(sort, offset + limit, {"item_type": item_type})
            cursor = generate_cursor(sort, offset + limit)

        return [Company(**record) for record in records], cursor

    async def update(self, *, id: int, updated_item: BaseCompany, current_user: str) -> Company:
        old_item = await self.get(id=id)
        new_item_json = updated_item.model_dump(exclude_unset=True)
        old_item_json = old_item.model_dump(exclude_unset=True)
        old_item_json.update(**new_item_json)

        record = await data_db.get().fetchrow(
            QUERIES["UPDATE_COMPANY"],
            id,
            old_item_json["name"],
            old_item_json["description"],
            current_user,
            old_item_json["deleted_at"],
            old_item_json["deleted_by_id"],
        )
        return Company(**record)

    async def delete(self, *, id: int, current_user: str) -> bool:
        result = await data_db.get().execute(
            QUERIES["DELETE_COMPANY"],
            id,
            current_user,
        )

        if result != "UPDATE 1":
            raise ObjectNotFoundException(object_id=id)

        return True
