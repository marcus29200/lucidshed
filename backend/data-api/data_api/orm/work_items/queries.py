from data_api.orm.common import MAX_ID_LENGTH

WORK_ITEM_QUERIES = {}

BASE_WORK_ITEM_FIELDS = f"""
    id SERIAL PRIMARY KEY,
    organization_id VARCHAR({MAX_ID_LENGTH}),
    title VARCHAR(40),
    description TEXT,
    status VARCHAR(15),
    priority VARCHAR(15),
    created_at timestamp without time zone DEFAULT NOW(),
    created_by_id VARCHAR({MAX_ID_LENGTH}),
    modified_at timestamp without time zone DEFAULT NOW(),
    modified_by_id VARCHAR({MAX_ID_LENGTH}),
    archived_at timestamp without time zone,
    archived_by_id VARCHAR({MAX_ID_LENGTH}),
    deleted_at timestamp without time zone,
    deleted_by_id VARCHAR({MAX_ID_LENGTH}),
    completed_at timestamp without time zone,
    completed_by_id VARCHAR({MAX_ID_LENGTH})
"""

WORK_ITEM_INIT_STATEMENTS = [
    f"""
CREATE TABLE IF NOT EXISTS engineering_items (
    {BASE_WORK_ITEM_FIELDS},
    item_type VARCHAR({10})
)
    """
]


WORK_ITEM_QUERIES[
    "CREATE_ENGINEERING_WORK_ITEM"
] = """
INSERT INTO engineering_items
(id, organization_id, title, description, status, priority, created_at, created_by_id, modified_at, modified_by_id, archived_at, archived_by_id, deleted_at, deleted_by_id, completed_at, completed_by_id)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
"""
