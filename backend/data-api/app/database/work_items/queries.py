from app.database.common.models import MAX_ID_LENGTH
from app.database.common.shared_queries import BASE_MODEL_FIELDS

WORK_ITEM_QUERIES = {}

BASE_WORK_ITEM_FIELDS = f"""
    id SERIAL PRIMARY KEY,
    organization_id VARCHAR({MAX_ID_LENGTH}) REFERENCES organizations(id) ON DELETE CASCADE,
    {BASE_MODEL_FIELDS},
    title VARCHAR(40),
    description TEXT,
    status VARCHAR(15),
    priority VARCHAR(15),
    estimated_completion_date timestamp without time zone DEFAULT NULL,
    starred BOOLEAN DEFAULT FALSE,
    archived_at timestamp without time zone DEFAULT NULL,
    archived_by_id VARCHAR({MAX_ID_LENGTH}),
    completed_at timestamp without time zone DEFAULT NULL,
    completed_by_id VARCHAR({MAX_ID_LENGTH})
"""

WORK_ITEM_INIT_STATEMENTS = [
    f"""
CREATE TABLE IF NOT EXISTS engineering_items (
    {BASE_WORK_ITEM_FIELDS},
    item_type VARCHAR(30),
    item_sub_type VARCHAR(30),
    estimate INT,
    iteration_id INT REFERENCES iterations(id) ON DELETE SET NULL,
    due_date timestamp without time zone DEFAULT NULL,
    acceptance_criteria TEXT[]
)
    """
]

LOAD_ITERATION = """
(
    SELECT to_jsonb(iterations)
    FROM iterations
    WHERE
        iterations.id = engineering_items.iteration_id
        AND iterations.organization_id = $1
        AND iterations.deleted_at IS NULL
    LIMIT 1
) AS iteration
"""


WORK_ITEM_QUERIES[
    "CREATE_ENGINEERING_ITEM"
] = f"""
INSERT INTO engineering_items
(
    organization_id,
    title,
    description,
    status,
    priority,
    estimated_completion_date,
    starred,
    item_type,
    item_sub_type,
    estimate,
    iteration_id,
    due_date,
    acceptance_criteria,
    created_by_id,
    modified_by_id
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
RETURNING *, {LOAD_ITERATION};
"""


WORK_ITEM_QUERIES[
    "GET_ENGINEERING_ITEM"
] = f"""
SELECT
    *,
    {LOAD_ITERATION}
FROM engineering_items WHERE organization_id = $1 AND id = $2 AND deleted_at IS NULL;
"""


WORK_ITEM_QUERIES[
    "GET_ALL_ENGINEERING_ITEM"
] = """
SELECT * FROM engineering_items
WHERE
    organization_id = $1
    AND deleted_at IS NULL
ORDER BY $2
LIMIT $3
OFFSET $4;
"""


WORK_ITEM_QUERIES[
    "UPDATE_ENGINEERING_ITEM"
] = f"""
UPDATE engineering_items
SET
    title = $3,
    description = $4,
    status = $5,
    priority = $6,
    estimated_completion_date = $7,
    starred = $8,
    item_type = $9,
    item_sub_type = $10,
    estimate = $11,
    iteration_id = $12,
    due_date = $13,
    acceptance_criteria = $14,
    created_by_id = $15,
    modified_at = NOW(),
    modified_by_id = $16,
    archived_at = $17,
    archived_by_id = $18,
    deleted_at = $19,
    deleted_by_id = $20,
    completed_at = $21,
    completed_by_id = $22
WHERE
    organization_id = $1 AND id = $2
RETURNING *, {LOAD_ITERATION};
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
