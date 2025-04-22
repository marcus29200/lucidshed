import base64
import json
import logging
from typing import Any, Dict, List, Optional, Tuple

from python_http_client.exceptions import BadRequestsError
from sendgrid import From, Mail, SendGridAPIClient

from app.exceptions.common import SendgridException
from app.settings import settings

logger = logging.getLogger(__name__)


def generate_cursor(
    sort_field: Optional[str] = None, offset: Optional[int] = 0, extra: Optional[Dict[str, Any]] = None
) -> str:
    # Encode the sort field and offset as a JSON string
    cursor_dict = {"sort_field": sort_field, "offset": offset, "extra": extra}
    cursor_str = json.dumps(cursor_dict)

    # Encode the JSON string to base64
    cursor_bytes = cursor_str.encode("utf-8")
    cursor_base64 = base64.urlsafe_b64encode(cursor_bytes)

    return cursor_base64.decode("utf-8")


def parse_cursor(cursor: str) -> Tuple[Any | None, int, Dict[str, Any]]:
    if cursor is None:
        return None, 0

    # Decode the base64 string to JSON
    cursor_bytes = base64.urlsafe_b64decode(cursor)
    cursor_str = cursor_bytes.decode("utf-8")
    cursor_dict = json.loads(cursor_str)

    return cursor_dict["sort_field"], cursor_dict["offset"], cursor_dict["extra"]


def send_mail(to_emails: List[str], subject: str, content: str):
    if not settings.sendgrid_api_key:
        logger.warning(f"Sendgrid not configured, sent '{content}' to {to_emails}")
        return

    try:
        sendgrid_client = SendGridAPIClient(settings.sendgrid_api_key)

        sendgrid_client.send(
            Mail(
                from_email=From(settings.from_email, name=settings.from_name),
                to_emails=",".join(to_emails),
                subject=subject,
                html_content=content,
            )
        )
    except Exception as e:
        logger.exception(f"Unable to send emails to {to_emails}")

        if isinstance(e, BadRequestsError):
            logger.error(f"Sendgrid response content {e.body}")

        raise SendgridException()
