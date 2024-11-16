#TODO: update this for companies
import json

from app.api.settings import data_db
from app.database.common.queries import QUERIES
from app.database.companies.models.company import BaseCompany, Company
from app.exceptions.common import ObjectNotFoundException


class CompanyController:
    async def create(self, *, company: BaseCompany, current_user: str):
        # Create db record
        record = await data_db.get().fetchrow(
            QUERIES["CREATE_COMPANY"],
            company.id,
            company.title,
            company.disabled,
            json.dumps(company.settings),
            current_user,
            current_user,
        )

        # TODO Create history entry

        return Company(**record)

    async def get(self, *, id: str):
        # Get item record here
        record = await data_db.get().fetchrow(QUERIES["GET_COMPANY"], id)

        if not record:
            raise ObjectNotFoundException(company_id=id, object_id=id)

        return Company(**record)

    async def update(self, *, id: str, updated_company: Company, current_user: str):
        old_user = await self.get(id=id)

        new_item_json = updated_company.model_dump(exclude_unset=True)
        old_item_json = old_user.model_dump()

        old_item_json.update(**new_item_json)

        record = await data_db.get().fetchrow(
            QUERIES["UPDATE_COMPANY"],
            id,
            old_item_json["title"],
            old_item_json["disabled"],
            json.dumps(old_item_json["settings"]),
            current_user,
            old_item_json["deleted_at"],
            old_item_json["deleted_by_id"],
        )

        return Company(**record)

    async def delete(self, *, id: str, current_user: str) -> bool:
        result = await data_db.get().execute(
            QUERIES["DELETE_COMPANY"],
            id,
            current_user,
        )

        if result != "UPDATE 1":
            raise ObjectNotFoundException(company_id=id, object_id=id)

        return True

