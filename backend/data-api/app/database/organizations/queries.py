from app.database.common.models import MAX_ID_LENGTH
from app.database.common.shared_queries import BASE_MODEL_FIELDS

ORGANIZATION_QUERIES = {}

USER_INIT_STATEMENTS = [
    f"""
CREATE TABLE IF NOT EXISTS organizations (
    {BASE_MODEL_FIELDS},
    title VARCHAR({MAX_ID_LENGTH})
)
    """
]


ORGANIZATION_QUERIES[
    "CREATE_ORGANIZATION"
] = """
INSERT INTO organizations
(
    organization_id,
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
SELECT * FROM organizations WHERE organization_id = $1;
"""

ORGANIZATION_QUERIES[
    "UPDATE_ORGANIZATION"
] = """
UPDATE organizations
SET
    title = $2
    modified_at = NOW(),
    modified_by_id = $3,
    deleted_at = $4,
    deleted_by_id = $5,
WHERE
    organization_id = $1
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
    organization_id = $1;
"""
