from app.database.common.models import MAX_ID_LENGTH
from app.database.common.shared_queries import BASE_MODEL_FIELDS

TEAM_QUERIES = {}

TEAM_INIT_STATEMENTS = [
    f"""
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    organization_id VARCHAR({MAX_ID_LENGTH}) REFERENCES organizations(id) ON DELETE CASCADE,
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
    organization_id,
    title,
    description,
    created_by_id,
    modified_by_id
)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;
"""


TEAM_QUERIES[
    "GET_TEAM"
] = """
SELECT * FROM teams WHERE organization_id = $1 AND id = $2 AND deleted_at IS NULL;
"""


TEAM_QUERIES[
    "GET_ALL_TEAMS"
] = """
SELECT * FROM teams
WHERE
    organization_id = $1
    AND deleted_at IS NULL
ORDER BY $2
LIMIT $3
OFFSET $4;
"""


TEAM_QUERIES[
    "UPDATE_TEAM"
] = """
UPDATE teams
SET
    title = $3,
    description = $4,
    modified_at = NOW(),
    modified_by_id = $5,
    deleted_at = $6,
    deleted_by_id = $7
WHERE
    organization_id = $1 AND id = $2
RETURNING *;
"""

TEAM_QUERIES[
    "DELETE_TEAM"
] = """
UPDATE teams
SET
    deleted_at = NOW(),
    deleted_by_id = $3
WHERE
    organization_id = $1 AND id = $2
"""
