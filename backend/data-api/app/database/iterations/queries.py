from app.database.common.shared_queries import BASE_MODEL_FIELDS
from app.database.common.models import MAX_ID_LENGTH

ITERATION_QUERIES = {}

ITERATION_INIT_STATEMENTS = [
    f"""
CREATE TABLE IF NOT EXISTS iterations (
    id VARCHAR({MAX_ID_LENGTH}) PRIMARY KEY,
    {BASE_MODEL_FIELDS},
    title VARCHAR(256),
    description TEXT,
    status VARCHAR(30),
    start_date timestamp with time zone DEFAULT NULL,
    end_date timestamp with time zone DEFAULT NULL
)
    """
]


ITERATION_QUERIES[
    "CREATE_ITERATION"
] = """
INSERT INTO iterations
(
    {}
)
VALUES ({})
RETURNING *;
"""


ITERATION_QUERIES[
    "GET_ITERATION"
] = """
SELECT * FROM iterations WHERE id = $1 AND deleted_at IS NULL;
"""


ITERATION_QUERIES[
    "GET_ALL_ITERATIONS"
] = """
SELECT * FROM iterations
WHERE
    deleted_at IS NULL
ORDER BY $1
LIMIT $2
OFFSET $3;
"""


ITERATION_QUERIES[
    "UPDATE_ITERATION"
] = """
UPDATE iterations
SET
    {fields}
WHERE
    id = $1
RETURNING *;
"""

ITERATION_QUERIES[
    "DELETE_ITERATION"
] = """
UPDATE iterations
SET
    deleted_at = NOW(),
    deleted_by_id = $2
WHERE
    id = $1
"""
