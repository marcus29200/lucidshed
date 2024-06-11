from app.database.organizations.models.organization import BaseOrganization, Organization
from app.database.common.queries import QUERIES


class OrganizationController:
    async def create(self, *, user: BaseOrganization, current_user: str):
        # Create db record
        record = await self.db.fetchrow(
            QUERIES["CREATE_ORGANIZATION"],
            "test",  # TODO Org id, needs to come from the jwt token, and also, might need to control the db we access
            user.first_name,
            user.last_name,
            user.disabled,
            current_user,
            current_user,
        )

        # TODO Create history entry

        return Organization(**record)

    async def get(self, *, organization_id: str):
        record = await super().get(organization_id=organization_id)

        return Organization(**record)

    async def update(self, *, organization_id: str, updated_user: Organization, current_user: str):
        old_user = await self.get(organization_id=organization_id)

        new_item_json = updated_user.model_dump(exclude_unset=True)
        old_item_json = old_user.model_dump()

        old_item_json.update(**new_item_json)

        record = await self.db.fetchrow(
            QUERIES["UPDATE_ORGANIZATION"], organization_id, old_item_json["title"], current_user
        )

        # TODO Create history entry on new user changes

        return Organization(**record)
