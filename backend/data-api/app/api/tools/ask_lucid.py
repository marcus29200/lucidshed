import json
import logging
from typing import List, Tuple

from openai import Client, RateLimitError
from openai.types.chat import ChatCompletion
from opensearchpy import OpenSearch
from pydantic import BaseModel

from app.api.settings import settings
from app.database.work_items.models.engineering_item import EngineeringItem

FILTERING_BASE_QUERY = """
You are an expert at constructing OpenSearch queries in valid JSON format. The response should strictly adhere to the
following example:

{
    "query": {
        "match": {
            "title": "New Story"
        }
    }
}

Generate an OpenSearch query in JSON format that filters based on the following database columns:
[title, description, status, priority, estimated_completion_date, starred, item_type, item_sub_type, estimate,
iteration_id, team_id, due_date, acceptance_criteria, assigned_to_id, created_by_id].

The query should dynamically match the structure of the user's question while ensuring it is valid JSON syntax.

Do not provide anything other than the query, no aggs for example.

User's question:
"""


ENGINEERING_ITEM_BASE_QUERY = """
You are an assistant that can answer questions based on engineering items (also known as stories)

Provide a short, but intelligent answer and or summary of the engineering items provided in the context below to the
user's question. Also do not answer the question with information from outside sources, everything you need should be
in the context given.
"""

logger = logging.getLogger(__name__)


class OSEngineeringItems(BaseModel):
    hits: List[EngineeringItem] = []
    total: int

    def __init__(self, **data):
        super().__init__(hits=[hit["_source"] for hit in data["hits"]["hits"]], total=data["hits"]["total"]["value"])


class AskLucidRawResponse(BaseModel):
    summary: str


# How can we deal with users, in the query we'll likely have names, not ids. How can we map the names to ids?
# Use a postgres query based on the user permissions table?
# Include user's name data in the indexed documents? But then we have to have a way to deal with stale data.
# - Could be a background process that updates documents with the latest user data, but that seems heavy.
# - Would need to be some sort of a event driven system
# Could we redefine how these queries are done? Maybe instead of just accepting anything, we need to have a context first.
# - Like for example the user has to do a search to narrow down results first, like what iteration they are looking in, or
# what users are being filtered on, and then they can ask a question based on that data.
async def perform_engineering_item_request(
    opensearch_client: OpenSearch, organization_id: str, user_query: str
) -> Tuple[str, List[EngineeringItem]]:
    openai_client = Client(api_key=settings.openai_api_key)

    try:
        # Try to get an Opensearch query to filter data down a bit
        completion: ChatCompletion = openai_client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": FILTERING_BASE_QUERY},
                {"role": "user", "content": user_query},
            ],
        )
        query = json.loads(completion.choices[0].message.content)

        # Run the query against Opensearch
        os_result = OSEngineeringItems(
            **opensearch_client.search(index=organization_id, body=query, sort=query.get("sort"))
        )

        if len(os_result.hits) == 0:
            return "Unfortunately there was nothing related to your question", []

        # Generate the text for the context
        context_text = "\n".join([item.ai_text for item in os_result.hits])

        # Now run the user query against the AI model again with the paired down context
        completion: ChatCompletion = openai_client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": ENGINEERING_ITEM_BASE_QUERY},
                {"role": "system", "content": f"Context: {context_text}"},
                {"role": "user", "content": user_query},
            ],
            response_format=AskLucidRawResponse,
        )
    except RateLimitError as rle:
        logger.exception("Rate limit error")

        if rle.message.startswith("Request too large"):
            return "Sorry, that query is too large", []

        return "Sorry, I'm having trouble answering that question. Please try again later", []
    except Exception:
        logger.exception("Failed to get completion from OpenAI")

        return "Sorry, I'm having trouble answering that question. Please try again later", []

    message = completion.choices[0].message
    if message.refusal:
        return "Unable to generate a summary", []

    return message.parsed.summary, os_result.hits
