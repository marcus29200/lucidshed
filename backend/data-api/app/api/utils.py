import base64
import json
import logging
from typing import Any, Dict, Optional, Tuple
from os import getenv

from python_http_client.exceptions import BadRequestsError
from sendgrid import From, Mail, SendGridAPIClient

from app.api.settings import settings
from app.exceptions.common import SendgridException

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


def send_mail(to_email: str, subject: str, content: str):
    if not settings.sendgrid_api_key:
        logger.warning(f"Sendgrid not configured, sent '{content}' to {to_email}")
        return

    try:
        sendgrid_client = SendGridAPIClient(settings.sendgrid_api_key)

        sendgrid_client.send(
            Mail(
                from_email=From(settings.from_email, name=settings.from_name),
                to_emails=to_email,
                subject=subject,
                html_content=content,
            )
        )
    except Exception as e:
        logger.exception("Unable to send email")

        if isinstance(e, BadRequestsError):
            logger.error(f"Sendgrid response content {e.body}")

        raise SendgridException()


def load_bool_env_var(env_var: str, default: Any = None) -> bool:
    return True if (getenv(env_var) or default).lower() == "true" else False