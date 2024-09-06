import json

from app.api.settings import data_db
from app.database.common.queries import QUERIES
from app.database.organizations.models.organization import BaseOrganization, Organization
from app.exceptions.common import ObjectNotFoundException


class OrganizationController:
    async def create(self, *, organization: BaseOrganization, current_user: str):
        # Create db record
        record = await data_db.get().fetchrow(
            QUERIES["CREATE_ORGANIZATION"],
            organization.id,
            organization.title,
            organization.disabled,
            json.dumps(organization.settings),
            current_user,
            current_user,
        )

        # TODO Create history entry

        return Organization(**record)

    async def get(self, *, id: str):
        # Get item record here
        record = await data_db.get().fetchrow(QUERIES["GET_ORGANIZATION"], id)

        if not record:
            raise ObjectNotFoundException(organization_id=id, object_id=id)

        return Organization(**record)

    async def update(self, *, id: str, updated_organization: Organization, current_user: str):
        old_user = await self.get(id=id)

        new_item_json = updated_organization.model_dump(exclude_unset=True)
        old_item_json = old_user.model_dump()

        old_item_json.update(**new_item_json)

        record = await data_db.get().fetchrow(
            QUERIES["UPDATE_ORGANIZATION"],
            id,
            old_item_json["title"],
            old_item_json["disabled"],
            json.dumps(old_item_json["settings"]),
            current_user,
            old_item_json["deleted_at"],
            old_item_json["deleted_by_id"],
        )

        return Organization(**record)

    async def delete(self, *, id: str, current_user: str) -> bool:
        result = await data_db.get().execute(
            QUERIES["DELETE_ORGANIZATION"],
            id,
            current_user,
        )

        if result != "UPDATE 1":
            raise ObjectNotFoundException(organization_id=id, object_id=id)

        return True
