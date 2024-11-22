import asyncio
import logging

from opensearchpy import OpenSearch

from app.api.dependencies.database import data_db, get_pool
from app.api.settings import settings
from app.commands.organizations.base import BaseOrganizationCommand
from app.database.work_items.controllers.engineering_item import EngineeringController

logger = logging.getLogger(__name__)


class ReindexCommand(BaseOrganizationCommand):
    async def perform(self, organization_id):
        try:
            pool = await get_pool(organization_id)

            controller = EngineeringController()
            opensearch_client = OpenSearch(
                hosts=[f"{settings.opensearch_host}"],
                http_auth=(settings.opensearch_username, settings.opensearch_password),
            )

            try:
                opensearch_client.indices.delete(index=organization_id)
            except Exception:
                pass

            cursor = None
            async with pool.acquire() as data_conn:
                data_db.set(data_conn)

                while True:
                    items, cursor = await controller.get_all(cursor=cursor)

                    for item in items:
                        logger.warning(f"[org_id={organization_id}] Indexing item {item.id}")
                        result = opensearch_client.index(
                            index=organization_id, id=item.id, body=item.get_indexable_doc()
                        )

                        if result["result"] == "created":
                            logger.warning(f"[org_id={organization_id}] Indexed item {item.id}")
                        else:
                            logger.error(f"[org_id={organization_id}] Failed to index item {item.id} {result}")

                    if not cursor:
                        break
        except Exception as e:
            logger.exception(f"Failed to reindex organization {organization_id}: {e}")


def run_command():
    command = ReindexCommand()
    asyncio.run(command.run())
