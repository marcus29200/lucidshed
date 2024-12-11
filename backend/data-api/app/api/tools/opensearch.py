import asyncio
import logging
from typing import Any, Dict, Optional

from opensearchpy import OpenSearch

from app.api.settings import settings

logger = logging.getLogger(__name__)

async def index_object(
    opensearch_client: OpenSearch,
    index: str,
    item_id: Any,
    document: Optional[Dict[str, Any]] = None,
    mode: Optional[str] = "create",
) -> bool:
    if settings.opensearch_enabled:
        logger.info(f"Indexing object {item_id} in index {index}")
        if settings.opensearch_async_indexing:
            asyncio.create_task(_index_object(opensearch_client, index, item_id, document, mode))

            return True
        else:
            result = await _index_object(opensearch_client, index, item_id, document, mode)

            if result["result"] in ["created", "updated", "deleted"]:
                return True
    else:
        logger.warning(f"OpenSearch is not enabled, unable to index object {item_id}")

    return False


async def _index_object(
    opensearch_client: OpenSearch,
    index: str,
    item_id: Any,
    document: Optional[Dict[str, Any]] = None,
    mode: Optional[str] = "create",
) -> Dict[str, Any]:
    try:
        match mode:
            case "create":
                return opensearch_client.index(index=index, id=item_id, body=document)
            case "update":
                return opensearch_client.update(index=index, id=item_id, body=document)
            case "delete":
                return opensearch_client.delete(index=index, id=item_id)
            case _:
                raise ValueError(f"Unable to index using {mode}")
    except Exception:
        logger.exception("Unable to index object")
