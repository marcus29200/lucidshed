from app.database.common.shared_queries import BASE_MODEL_FIELDS

TEAM_QUERIES = {}

TEAM_INIT_STATEMENTS = [
    f"""
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    {BASE_MODEL_FIELDS},
    title VARCHAR(256),
    description TEXT
)
    """
]


TEAM_QUERIES[
    "CREATE_TEAM"
] = """
INSERT INTO teams
(
    title,
    description,
    created_by_id,
    modified_by_id
)
VALUES ($1, $2, $3, $4)
RETURNING *;
"""


TEAM_QUERIES[
    "GET_TEAM"
] = """
SELECT * FROM teams WHERE id = $1 AND deleted_at IS NULL;
"""


TEAM_QUERIES[
    "GET_ALL_TEAMS"
] = """
SELECT * FROM teams
WHERE
    deleted_at IS NULL
ORDER BY $1
LIMIT $2
OFFSET $3;
"""


TEAM_QUERIES[
    "UPDATE_TEAM"
] = """
UPDATE teams
SET
    title = $2,
    description = $3,
    modified_at = NOW(),
    modified_by_id = $4,
    deleted_at = $5,
    deleted_by_id = $6
WHERE
    id = $1
RETURNING *;
"""

TEAM_QUERIES[
    "DELETE_TEAM"
] = """
UPDATE teams
SET
    deleted_at = NOW(),
    deleted_by_id = $2
WHERE
    id = $1
"""
