from app.database.common.models import MAX_ID_LENGTH
from app.database.common.shared_queries import BASE_MODEL_FIELDS

HISTORY_QUERIES = {}

HISTORY_INIT_STATEMENTS = [
    f"""
CREATE TABLE IF NOT EXISTS history (
    id VARCHAR({MAX_ID_LENGTH}) UNIQUE,
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
    {}
)
VALUES ({})
RETURNING *;
"""


HISTORY_QUERIES[
    "GET_HISTORY"
] = """
SELECT * FROM history WHERE id = $2 AND deleted_at IS NULL;
"""


HISTORY_QUERIES[
    "GET_ALL_HISTORIES"
] = """
SELECT * FROM history
WHERE
    deleted_at IS NULL
    AND item_id = $1
    AND item_type = $2;
"""
