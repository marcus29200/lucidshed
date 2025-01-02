from app.api.settings import data_db
from app.database.work_items.controllers.work_item import WorkItemController
from app.database.work_items.models.feature_list import BaseFeatureList, FeatureList
from app.database.work_items.queries import FEATURE_LIST_QUERIES as QUERIES
from app.decorators import serialize_enum_values
from app.exceptions.common import ObjectNotFoundException


class FeatureListController(WorkItemController):
    @serialize_enum_values
    async def create(self, *, new_item: BaseFeatureList, current_user: str) -> FeatureList:
        record = await data_db.get().fetchrow(
            QUERIES["CREATE_FEATURE_LIST"],
            new_item.requests,
            new_item.reach,
            new_item.impact,
            new_item.confidence,
            new_item.effort,
            new_item.growth,
            current_user,
            current_user,
        )
        feature_list = FeatureList(**record)

        # Associate feature list with feature requests
        for feature_request_id in new_item.feature_requests:
            await data_db.get().execute(
                QUERIES["ASSOCIATE_FEATURE_LIST_WITH_FEATURE_REQUEST"], feature_list.id, feature_request_id
            )

        # Populate feature_list with associated feature requests
        feature_requests = await data_db.get().fetch(QUERIES["GET_FEATURE_REQUESTS_FOR_FEATURE_LIST"], feature_list.id)
        feature_list.feature_requests = [fr["feature_request_id"] for fr in feature_requests]

        return feature_list

    async def get_one(self) -> FeatureList:
        record = await data_db.get().fetchrow(QUERIES["GET_FEATURE_LIST"])

        if not record:
            raise ObjectNotFoundException(object_id=id)

        feature_list = FeatureList(**record)

        # Get associated feature requests
        feature_requests = await data_db.get().fetch(QUERIES["GET_FEATURE_REQUESTS_FOR_FEATURE_LIST"], id)
        feature_list.feature_requests = [fr["feature_request_id"] for fr in feature_requests]

        return feature_list

    async def get(self, *, id: int) -> FeatureList:
        record = await data_db.get().fetchrow(
            QUERIES["GET_FEATURE_LIST_BY_ID"],
            id,
        )

        if not record:
            raise ObjectNotFoundException(object_id=id)

        feature_list = FeatureList(**record)

        # Get associated feature requests
        feature_requests = await data_db.get().fetch(QUERIES["GET_FEATURE_REQUESTS_FOR_FEATURE_LIST"], id)
        feature_list.feature_requests = [fr["feature_request_id"] for fr in feature_requests]

        return feature_list

    async def get_all(
        self,
    ) -> list[FeatureList]:
        query: str = QUERIES["GET_ALL_FEATURE_LISTS"]
        records = await data_db.get().fetch(query)
        feature_lists = [FeatureList(**record) for record in records]

        for feature_list in feature_lists:
            feature_requests = await data_db.get().fetch(
                QUERIES["GET_FEATURE_REQUESTS_FOR_FEATURE_LIST"], feature_list.id
            )
            feature_list.feature_requests = [fr["feature_request_id"] for fr in feature_requests]

        return feature_lists

    @serialize_enum_values
    async def update(self, *, id: int, updated_item: BaseFeatureList, current_user: str) -> FeatureList:
        old_feature_list = await self.get(id=id)

        new_item_json = updated_item.model_dump(exclude_unset=True)
        old_item_json = old_feature_list.model_dump()

        old_item_json.update(**new_item_json)

        record = await data_db.get().fetchrow(
            QUERIES["UPDATE_FEATURE_LIST"],
            id,
            updated_item.requests,
            updated_item.reach,
            updated_item.impact,
            updated_item.confidence,
            updated_item.effort,
            updated_item.growth,
            current_user,
        )
        feature_list = FeatureList(**record)

        # Update associations with feature requests
        await data_db.get().execute(QUERIES["DELETE_FEATURE_LIST_ASSOCIATIONS"], id)
        for feature_request_id in updated_item.feature_requests:
            await data_db.get().execute(QUERIES["ASSOCIATE_FEATURE_LIST_WITH_FEATURE_REQUEST"], id, feature_request_id)

        return feature_list

    async def delete(self, *, id: int) -> None:
        await data_db.get().execute(
            QUERIES["DELETE_FEATURE_LIST"],
            id,
        )
