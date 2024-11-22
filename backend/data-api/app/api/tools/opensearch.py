import asyncio
from typing import Any, Dict, Optional

from opensearchpy import OpenSearch

from app.api.settings import settings


async def index_object(
    opensearch_client: OpenSearch,
    index: str,
    item_id: Any,
    document: Optional[Dict[str, Any]] = None,
    mode: Optional[str] = "create",
) -> bool:
    if not settings.opensearch_enabled:
        return False

    if settings.opensearch_async_indexing:
        asyncio.create_task(_index_object(opensearch_client, index, item_id, document, mode))

        return True
    else:
        result = await _index_object(opensearch_client, index, item_id, document, mode)

        if result["result"] in ["created", "updated", "deleted"]:
            return True

    return False


async def _index_object(
    opensearch_client: OpenSearch,
    index: str,
    item_id: Any,
    document: Optional[Dict[str, Any]] = None,
    mode: Optional[str] = "create",
) -> Dict[str, Any]:
    match mode:
        case "create":
            return opensearch_client.index(index=index, id=item_id, body=document)
        case "update":
            return opensearch_client.update(index=index, id=item_id, body=document)
        case "delete":
            return opensearch_client.delete(index=index, id=item_id)
        case _:
            raise ValueError(f"Unable to index using {mode}")
