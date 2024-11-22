import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, Request, Security
from pydantic import BaseModel

from app.api.dependencies.authorization import get_current_user
from app.api.dependencies.database import data_db_conn

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="",
    tags=["search"],
)


class SearchPayload(BaseModel):
    query: Dict[str, Any]
    cursor: Optional[str] = ""
    size: Optional[int] = 1000


class SearchResponse(BaseModel):
    items: List[Any] = []
    total: int = 0
    cursor: Optional[str] = None


@router.post(
    "",
    status_code=200,
    response_model=SearchResponse,
    dependencies=[Security(get_current_user, scopes=["member"]), Depends(data_db_conn)],
)
async def search(request: Request, organization_id: str, body: SearchPayload) -> SearchResponse:
    try:
        result = request.app.opensearch_client.search(index=organization_id, body=body.model_dump(exclude_unset=True))

        items = [hit["_source"] for hit in result["hits"]["hits"]]
        cursor = result.get("cursor", None)
    except Exception:
        logger.exception("Unable to perform search")

        return SearchResponse(items=[], cursor=None, total=0)

    return SearchResponse(items=items, cursor=cursor, total=result["hits"]["total"]["value"])
