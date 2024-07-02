import base64
import json
from typing import Tuple


def generate_cursor(sort_field: str, offset: int) -> str:
    # Encode the sort field and offset as a JSON string
    cursor_dict = {"sort_field": sort_field, "offset": offset}
    cursor_str = json.dumps(cursor_dict)

    # Encode the JSON string to base64
    cursor_bytes = cursor_str.encode("utf-8")
    cursor_base64 = base64.urlsafe_b64encode(cursor_bytes)

    return cursor_base64.decode("utf-8")


def parse_cursor(cursor: str) -> Tuple[str, int]:
    if cursor is None:
        return None, 0

    # Decode the base64 string to JSON
    cursor_bytes = base64.urlsafe_b64decode(cursor)
    cursor_str = cursor_bytes.decode("utf-8")
    cursor_dict = json.loads(cursor_str)

    return cursor_dict["sort_field"], cursor_dict["offset"]
