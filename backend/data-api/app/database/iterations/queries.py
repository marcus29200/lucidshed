from app.database.common.shared_queries import BASE_MODEL_FIELDS

ITERATION_QUERIES = {}

ITERATION_INIT_STATEMENTS = [
    f"""
CREATE TABLE IF NOT EXISTS iterations (
    id SERIAL PRIMARY KEY,
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
    title,
    description,
    status,
    start_date,
    end_date,
    created_by_id,
    modified_by_id
)
VALUES ($1, $2, $3, $4, $5, $6, $7)
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
    title = $2,
    description = $3,
    status = $4,
    start_date = $5,
    end_date = $6,
    modified_at = NOW(),
    modified_by_id = $7,
    deleted_at = $8,
    deleted_by_id = $9
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
