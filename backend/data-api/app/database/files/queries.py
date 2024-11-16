from app.database.common.models import MAX_ID_LENGTH
from app.database.common.shared_queries import BASE_MODEL_FIELDS

FILE_QUERIES = {}

FILE_INIT_STATEMENTS = [
    f"""
CREATE TABLE IF NOT EXISTS files (
    id VARCHAR({MAX_ID_LENGTH}) PRIMARY KEY,
    {BASE_MODEL_FIELDS},
    file_name VARCHAR(255) NOT NULL,
    path VARCHAR(255) NOT NULL
)
    """
]


FILE_QUERIES[
    "CREATE_FILE"
] = """
INSERT INTO files
(
    id,
    file_name,
    path,
    created_by_id,
    modified_by_id
)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;
"""


FILE_QUERIES[
    "GET_FILE"
] = """
SELECT * FROM files WHERE id = $1 AND deleted_at IS NULL;
"""


FILE_QUERIES[
    "GET_ALL_FILES"
] = """
SELECT * FROM files
WHERE
    deleted_at IS NULL
ORDER BY $1
LIMIT $2
OFFSET $3;
"""


FILE_QUERIES[
    "DELETE_FILE"
] = """
UPDATE files
SET
    deleted_at = NOW(),
    deleted_by_id = $2
WHERE
    id = $1
"""
