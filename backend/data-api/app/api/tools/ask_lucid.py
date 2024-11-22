import json
import logging
from typing import List, Tuple

from openai import Client, RateLimitError
from openai.types.chat import ChatCompletion
from pydantic import BaseModel

from app.api.settings import settings
from app.database.work_items.controllers.engineering_item import EngineeringController
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

User's question:
"""


ENGINEERING_ITEM_BASE_QUERY = """
You are an assistant that can answer questions based on engineering items (also known as stories)

Provide two things, a very short text summary of the different titles and a comma separated list of relevant item
ids to this question

If nothing is related, it's acceptable to return an empty list and a summary of "No relevant items found"
"""

logger = logging.getLogger(__name__)


class AskLucidRawResponse(BaseModel):
    summary: str
    related_items: List[int]


async def perform_engineering_item_request(
    engineering_controller: EngineeringController, opensearch_client, organization_id: str, user_query: str
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
        result = opensearch_client.search(index=organization_id, body=query)

        # Generate the text for the context
        context_text = "\n".join(
            [
                f"id={hit['_source']['id']} title={hit['_source']['title']} description={hit['_source']['description']}"
                for hit in result["hits"]["hits"]
            ]
        )

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

    # Convert the str to a list
    parsed_message = message.parsed  # type: ignore
    if len(parsed_message.related_items) > 0:
        # Load the relevant items using those ids
        related_items = await engineering_controller.get_batch_by_id(ids=parsed_message.related_items)

    return parsed_message.summary, related_items
