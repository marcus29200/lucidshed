from app.database.common.models import MAX_ID_LENGTH
from app.database.common.shared_queries import BASE_MODEL_FIELDS

ITERATION_QUERIES = {}

ITERATION_INIT_STATEMENTS = [
    f"""
CREATE TABLE IF NOT EXISTS iterations (
    id SERIAL PRIMARY KEY,
    organization_id VARCHAR({MAX_ID_LENGTH}) REFERENCES organizations(id) ON DELETE CASCADE,
    {BASE_MODEL_FIELDS},
    title VARCHAR({MAX_ID_LENGTH}),
    description TEXT,
    status VARCHAR(30),
    start_date timestamp without time zone DEFAULT NULL,
    end_date timestamp without time zone DEFAULT NULL
)
    """
]


ITERATION_QUERIES[
    "CREATE_ITERATION"
] = """
INSERT INTO iterations
(
    organization_id,
    title,
    description,
    status,
    start_date,
    end_date,
    created_by_id,
    modified_by_id
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *;
"""


ITERATION_QUERIES[
    "GET_ITERATION"
] = """
SELECT * FROM iterations WHERE organization_id = $1 AND id = $2 AND deleted_at IS NULL;
"""


ITERATION_QUERIES[
    "GET_ALL_ITERATIONS"
] = """
SELECT * FROM iterations
WHERE
    organization_id = $1
    AND deleted_at IS NULL
ORDER BY $2
LIMIT $3
OFFSET $4;
"""


ITERATION_QUERIES[
    "UPDATE_ITERATION"
] = """
UPDATE iterations
SET
    title = $3,
    description = $4,
    status = $5,
    start_date = $6,
    end_date = $7,
    modified_at = NOW(),
    modified_by_id = $8,
    deleted_at = $9,
    deleted_by_id = $10
WHERE
    organization_id = $1 AND id = $2
RETURNING *;
"""

ITERATION_QUERIES[
    "DELETE_ITERATION"
] = """
UPDATE iterations
SET
    deleted_at = NOW(),
    deleted_by_id = $3
WHERE
    organization_id = $1 AND id = $2
"""
