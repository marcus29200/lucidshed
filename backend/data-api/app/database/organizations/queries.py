from app.database.common.models import MAX_ID_LENGTH
from app.database.common.shared_queries import BASE_MODEL_FIELDS

ORGANIZATION_QUERIES = {}

ORGANIZATION_INIT_STATEMENTS = [
    f"""
CREATE TABLE IF NOT EXISTS organizations (
    id VARCHAR({MAX_ID_LENGTH}) PRIMARY KEY,
    {BASE_MODEL_FIELDS},
    title VARCHAR(256),
    disabled BOOLEAN DEFAULT FALSE,
    settings JSONB
)
    """
]


ORGANIZATION_QUERIES[
    "CREATE_ORGANIZATION"
] = """
INSERT INTO organizations
({})
VALUES ({})
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
    {fields}
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
