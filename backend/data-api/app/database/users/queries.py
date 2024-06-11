from app.database.common.models import MAX_ID_LENGTH
from app.database.common.shared_queries import BASE_MODEL_FIELDS

USER_QUERIES = {}

USER_INIT_STATEMENTS = [
    f"""
CREATE TABLE IF NOT EXISTS users (
    {BASE_MODEL_FIELDS},
    email VARCHAR({MAX_ID_LENGTH}) UNIQUE,
    first_name VARCHAR({MAX_ID_LENGTH}),
    last_name VARCHAR({MAX_ID_LENGTH}),
    disabled BOOLEAN DEFAULT FALSE
)
    """
]


USER_QUERIES[
    "CREATE_USER"
] = """
INSERT INTO users
(
    organization_id,
    email,
    first_name,
    last_name,
    disabled,
    created_by_id,
    modified_by_id
)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;
"""


USER_QUERIES[
    "GET_USER"
] = """
SELECT * FROM users WHERE organization_id = $1 AND id = $2;
"""

USER_QUERIES[
    "UPDATE_USER"
] = """
UPDATE users
SET
    first_name = $3,
    last_name = $4,
    disabled = $5,
    created_by_id = $6,
    modified_at = NOW(),
    modified_by_id = $7,
    deleted_at = $8,
    deleted_by_id = $9,
WHERE
    organization_id = $1 AND id = $2
RETURNING *;
"""

USER_QUERIES[
    "DELETE_USER"
] = """
UPDATE users
SET
    deleted_at = NOW(),
    deleted_by_id = $3
WHERE
    organization_id = $1 AND id = $2
"""
