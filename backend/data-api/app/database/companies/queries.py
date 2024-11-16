from app.database.common.models import MAX_ID_LENGTH
from app.database.common.shared_queries import BASE_MODEL_FIELDS

COMPANY_QUERIES = {}

COMPANY_INIT_STATEMENTS = [
    f"""
CREATE TABLE IF NOT EXISTS companies (
    id VARCHAR({MAX_ID_LENGTH}) PRIMARY KEY,
    {BASE_MODEL_FIELDS},
    title VARCHAR(256),
    disabled BOOLEAN DEFAULT FALSE,
    settings JSONB
)
    """
]


COMPANY_QUERIES[
    "CREATE_COMPANY"
] = """
INSERT INTO companies
(
    id,
    title,
    disabled,
    settings,
    created_by_id,
    modified_by_id
)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;
"""


COMPANY_QUERIES[
    "GET_COMPANY"
] = """
SELECT * FROM companies WHERE id = $1 AND deleted_at IS NULL;
"""

COMPANY_QUERIES[
    "UPDATE_COMPANY"
] = """
UPDATE companies
SET
    title = $2,
    disabled = $3,
    settings = $4,
    modified_at = NOW(),
    modified_by_id = $5,
    deleted_at = $6,
    deleted_by_id = $7
WHERE
    id = $1
RETURNING *;
"""

COMPANY_QUERIES[
    "DELETE_COMPANY"
] = """
UPDATE companies
SET
    deleted_at = NOW(),
    deleted_by_id = $2
WHERE
    id = $1;
"""
