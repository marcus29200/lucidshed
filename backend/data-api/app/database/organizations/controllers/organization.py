from app.database.common.queries import QUERIES
from app.database.database import DatabaseController
from app.database.organizations.models.organization import BaseOrganization, Organization
from app.exceptions.common import ObjectNotFoundException


class OrganizationController:
    def __init__(self, db: DatabaseController):
        self.db: DatabaseController = db

    async def create(self, *, organization: BaseOrganization, current_user: str):
        # Create db record
        record = await self.db.fetchrow(
            QUERIES["CREATE_ORGANIZATION"],
            organization.id,
            organization.title,
            organization.disabled,
            current_user,
            current_user,
        )

        # TODO Create history entry

        return Organization(**record)

    async def get(self, *, id: str):
        # Get item record here
        record = await self.db.fetchrow(QUERIES["GET_ORGANIZATION"], id)

        if not record:
            raise ObjectNotFoundException(organization_id=id, object_id=id)

        # TODO Create history

        return Organization(**record)

    async def update(self, *, id: str, updated_organization: Organization, current_user: str):
        old_user = await self.get(id=id)

        new_item_json = updated_organization.model_dump(exclude_unset=True)
        old_item_json = old_user.model_dump()

        old_item_json.update(**new_item_json)

        record = await self.db.fetchrow(
            QUERIES["UPDATE_ORGANIZATION"],
            id,
            old_item_json["title"],
            old_item_json["disabled"],
            current_user,
            old_item_json["deleted_at"],
            old_item_json["deleted_by_id"],
        )

        # TODO Create history entry on new user changes

        return Organization(**record)

    async def delete(self, *, id: int, current_user: str) -> bool:
        result = await self.db.execute(
            QUERIES["DELETE_ORGANIZATION"],
            id,
            current_user,
        )

        # TODO Create history entry

        if result != "UPDATE 1":
            raise ObjectNotFoundException(organization_id=id, object_id=id)

        return True
