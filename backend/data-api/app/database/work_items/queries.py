from app.database.common.models import MAX_ID_LENGTH

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
    archived_at timestamp without time zone DEFAULT NULL,
    archived_by_id VARCHAR({MAX_ID_LENGTH}),
    deleted_at timestamp without time zone DEFAULT NULL,
    deleted_by_id VARCHAR({MAX_ID_LENGTH}),
    completed_at timestamp without time zone DEFAULT NULL,
    completed_by_id VARCHAR({MAX_ID_LENGTH})
"""

WORK_ITEM_INIT_STATEMENTS = [
    f"""
CREATE TABLE IF NOT EXISTS engineering_items (
    {BASE_WORK_ITEM_FIELDS},
    item_type VARCHAR(10),
    estimate INT,
    iteration_id VARCHAR({MAX_ID_LENGTH}),
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    related_tickets TEXT[] DEFAULT ARRAY[]::TEXT[],
    related_files TEXT[] DEFAULT ARRAY[]::TEXT[]
)
    """
]


WORK_ITEM_QUERIES[
    "CREATE_ENGINEERING_ITEM"
] = """
INSERT INTO engineering_items
(organization_id, title, description, status, priority, item_type, estimate, iteration_id, tags, related_tickets, related_files, created_by_id, modified_by_id)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
RETURNING *;
"""


WORK_ITEM_QUERIES[
    "GET_ENGINEERING_ITEM"
] = """
SELECT * FROM engineering_items WHERE organization_id = $1 AND id = $2;
"""

WORK_ITEM_QUERIES[
    "UPDATE_ENGINEERING_ITEM"
] = """
UPDATE engineering_items
SET
    title = $3,
    description = $4,
    status = $5,
    priority = $6,
    item_type = $7,
    estimate = $8,
    iteration_id = $9,
    tags = $10,
    related_tickets = $11,
    related_files = $12,
    created_by_id = $13,
    modified_at = NOW(),
    modified_by_id = $14,
    archived_at = $15,
    archived_by_id = $16,
    deleted_at = $17,
    deleted_by_id = $18,
    completed_at = $19,
    completed_by_id = $20
WHERE
    organization_id = $1 AND id = $2
RETURNING *;
"""

WORK_ITEM_QUERIES[
    "DELETE_ENGINEERING_ITEM"
] = """
UPDATE engineering_items
SET
    deleted_at = NOW(),
    deleted_by_id = $3
WHERE
    organization_id = $1 AND id = $2
"""
