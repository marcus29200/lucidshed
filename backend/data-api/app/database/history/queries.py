from app.database.common.models import MAX_ID_LENGTH
from app.database.common.shared_queries import BASE_MODEL_FIELDS

HISTORY_QUERIES = {}

HISTORY_INIT_STATEMENTS = [
    f"""
CREATE TABLE IF NOT EXISTS history (
    id VARCHAR({MAX_ID_LENGTH}) UNIQUE,
    organization_id VARCHAR({MAX_ID_LENGTH}),
    {BASE_MODEL_FIELDS},
    item_id VARCHAR({MAX_ID_LENGTH}),
    item_type VARCHAR(32),
    message VARCHAR(255),
    action VARCHAR(16),
    metadata JSON,
    PRIMARY KEY (id, item_id, item_type)
)
    """,
    """
CREATE INDEX IF NOT EXISTS idx_item_id_item_type ON history (item_id, item_type);
    """,
]


HISTORY_QUERIES[
    "CREATE_HISTORY"
] = """
INSERT INTO history
(
    id,
    organization_id,
    item_id,
    item_type,
    message,
    action,
    metadata,
    created_by_id,
    modified_by_id
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING *;
"""


HISTORY_QUERIES[
    "GET_HISTORY"
] = """
SELECT * FROM history WHERE organization_id = $1 AND id = $2 AND deleted_at IS NULL;
"""


HISTORY_QUERIES[
    "GET_ALL_HISTORIES"
] = """
SELECT * FROM history
WHERE
    organization_id = $1
    AND deleted_at IS NULL
    AND item_id = $2
    AND item_type = $3;
"""
