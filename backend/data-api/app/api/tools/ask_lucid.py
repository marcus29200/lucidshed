from typing import List, Tuple
import logging

from openai import Client, RateLimitError
from openai.types.chat import ChatCompletion
from pydantic import BaseModel

from app.api.settings import settings
from app.database.work_items.controllers.engineering_item import EngineeringController
from app.database.work_items.models.engineering_item import EngineeringItem

ENGINEERING_ITEM_BASE_QUERY = """
You are an assistant that can answer questions based on engineering items (also known as stories)

Provide two things, a text summary based on title and a comma separated list of relevant item ids to this user's
question
"""

logger = logging.getLogger(__name__)


class AskLucidRawResponse(BaseModel):
    summary: str
    related_items: List[int]


async def perform_engineering_item_request(
    engineering_controller: EngineeringController, query: str
) -> Tuple[str, List[EngineeringItem]]:
    openai_client = Client(api_key=settings.openai_api_key)

    context = await engineering_controller.get_ask_lucid_info()

    # Build context text
    context_text = "\n".join([item.ai_format() for item in context])

    # Send the info to the model
    try:
        completion: ChatCompletion = openai_client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": ENGINEERING_ITEM_BASE_QUERY},
                {"role": "system", "content": f"Context: {context_text}"},
                {"role": "user", "content": query},
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
