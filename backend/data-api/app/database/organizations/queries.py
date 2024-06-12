from app.database.common.models import MAX_ID_LENGTH
from app.database.common.shared_queries import BASE_MODEL_FIELDS

ORGANIZATION_QUERIES = {}

ORGANIZATION_INIT_STATEMENTS = [
    f"""
CREATE TABLE IF NOT EXISTS organizations (
    id VARCHAR({MAX_ID_LENGTH}) PRIMARY KEY,
    {BASE_MODEL_FIELDS},
    title VARCHAR({MAX_ID_LENGTH}),
    disabled BOOLEAN DEFAULT FALSE
)
    """
]


ORGANIZATION_QUERIES[
    "CREATE_ORGANIZATION"
] = """
INSERT INTO organizations
(
    id,
    title,
    disabled,
    created_by_id,
    modified_by_id
)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;
"""


ORGANIZATION_QUERIES[
    "GET_ORGANIZATION"
] = """
SELECT * FROM organizations WHERE id = $1 AND deleted_at IS NULL;
"""

ORGANIZATION_QUERIES[
    "UPDATE_ORGANIZATION"
] = """
UPDATE organizations
SET
    title = $2,
    disabled = $3,
    modified_at = NOW(),
    modified_by_id = $4,
    deleted_at = $5,
    deleted_by_id = $6
WHERE
    id = $1
RETURNING *;
"""

ORGANIZATION_QUERIES[
    "DELETE_ORGANIZATION"
] = """
UPDATE organizations
SET
    deleted_at = NOW(),
    deleted_by_id = $2
WHERE
    id = $1;
"""
