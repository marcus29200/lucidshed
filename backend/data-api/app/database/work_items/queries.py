from app.database.common.models import MAX_ID_LENGTH
from app.database.common.shared_queries import BASE_MODEL_FIELDS

WORK_ITEM_QUERIES = {}

BASE_WORK_ITEM_FIELDS = f"""
    id SERIAL PRIMARY KEY,
    {BASE_MODEL_FIELDS},
    title VARCHAR(256),
    description TEXT,
    status VARCHAR(15),
    priority VARCHAR(15),
    estimated_completion_date timestamp with time zone DEFAULT NULL,
    starred BOOLEAN DEFAULT FALSE,
    assigned_to_id VARCHAR({MAX_ID_LENGTH}),
    archived_at timestamp with time zone DEFAULT NULL,
    archived_by_id VARCHAR({MAX_ID_LENGTH}),
    completed_at timestamp with time zone DEFAULT NULL,
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
    team_id INT REFERENCES teams(id) ON DELETE SET NULL,
    due_date timestamp with time zone DEFAULT NULL,
    acceptance_criteria TEXT[]
);
    """,
    f"""
CREATE TABLE IF NOT EXISTS support_items (
    {BASE_WORK_ITEM_FIELDS},
    owner VARCHAR({MAX_ID_LENGTH}),
    customer VARCHAR(30),
    primary_contact VARCHAR(30),
    secondary_contact TEXT[],
    next_response_due timestamp with time zone DEFAULT NULL
);
    """,
    f"""
CREATE TABLE IF NOT EXISTS work_item_comments (
    id VARCHAR({MAX_ID_LENGTH}),
    work_item_id INT NOT NULL,
    {BASE_MODEL_FIELDS},
    description TEXT,
    PRIMARY KEY (id, work_item_id)
);
    """,
    f"""
CREATE TABLE IF NOT EXISTS work_item_relationships (
    item_1 INT REFERENCES engineering_items(id) ON DELETE CASCADE,
    item_2 INT REFERENCES engineering_items(id) ON DELETE CASCADE,
    link_type VARCHAR(30) NOT NULL,
    created_at timestamp with time zone DEFAULT NOW(),
    created_by_id VARCHAR({MAX_ID_LENGTH}),
    PRIMARY KEY (item_1, item_2)
);
    """,
]


LOAD_ITERATION = """
(
    SELECT to_jsonb(iterations)
    FROM iterations
    WHERE
        iterations.id = engineering_items.iteration_id
        AND iterations.deleted_at IS NULL
    LIMIT 1
) AS iteration
"""


LOAD_TEAM = """
(
    SELECT to_jsonb(teams)
    FROM teams
    WHERE
        teams.id = engineering_items.team_id
        AND teams.deleted_at IS NULL
    LIMIT 1
) AS team
"""


WORK_ITEM_QUERIES[
    "CREATE_ENGINEERING_ITEM"
] = f"""
INSERT INTO engineering_items
(
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
    team_id,
    due_date,
    acceptance_criteria,
    assigned_to_id,
    created_by_id,
    modified_by_id
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
RETURNING *, {LOAD_ITERATION}, {LOAD_TEAM};
"""


WORK_ITEM_QUERIES[
    "GET_ENGINEERING_ITEM"
] = f"""
SELECT
    *,
    {LOAD_ITERATION},
    {LOAD_TEAM}
FROM engineering_items WHERE id = $1 AND deleted_at IS NULL;
"""


WORK_ITEM_QUERIES[
    "GET_ALL_ENGINEERING_ITEM"
] = f"""
SELECT DISTINCT
    $1,
    engineering_items.*,
    {LOAD_ITERATION},
    {LOAD_TEAM}
FROM engineering_items
LEFT JOIN work_item_relationships
    ON engineering_items.id = work_item_relationships.item_1
    OR engineering_items.id = work_item_relationships.item_2
WHERE
    engineering_items.deleted_at IS NULL
    $FILTER_CONDITIONS
ORDER BY $1
LIMIT $2
OFFSET $3;
"""


WORK_ITEM_QUERIES[
    "GET_ASK_LUCID_ENGINEERING_ITEM"
] = f"""
SELECT
    engineering_items.*,
    {LOAD_ITERATION},
    {LOAD_TEAM}
FROM engineering_items
WHERE
    engineering_items.deleted_at IS NULL
    AND engineering_items.description IS NOT NULL
    AND engineering_items.description != ''
"""


WORK_ITEM_QUERIES[
    "GET_ENGINEERING_ITEMS_BY_IDS"
] = f"""
SELECT
    engineering_items.*,
    {LOAD_ITERATION},
    {LOAD_TEAM}
FROM engineering_items
WHERE
    engineering_items.deleted_at IS NULL
    AND engineering_items.id = ANY($1)
"""


WORK_ITEM_QUERIES[
    "UPDATE_ENGINEERING_ITEM"
] = f"""
UPDATE engineering_items
SET
    title = $2,
    description = $3,
    status = $4,
    priority = $5,
    estimated_completion_date = $6,
    starred = $7,
    item_type = $8,
    item_sub_type = $9,
    estimate = $10,
    iteration_id = $11,
    team_id = $12,
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
    completed_by_id = $22,
    assigned_to_id = $23
WHERE
    id = $1
RETURNING *, {LOAD_ITERATION}, {LOAD_TEAM};
"""

WORK_ITEM_QUERIES[
    "DELETE_ENGINEERING_ITEM"
] = """
UPDATE engineering_items
SET
    deleted_at = NOW(),
    deleted_by_id = $2
WHERE
    id = $1
"""


WORK_ITEM_QUERIES[
    "CREATE_SUPPORT_ITEM"
] = """
INSERT INTO support_items
(
    title,
    description,
    status,
    priority,
    estimated_completion_date,
    starred,
    owner,
    customer,
    primary_contact,
    secondary_contact,
    next_response_due,
    created_by_id,
    modified_by_id
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
RETURNING *;
"""

WORK_ITEM_QUERIES[
    "UPDATE_SUPPORT_ITEM"
] = """
UPDATE support_items
SET
    title = $2,
    description = $3,
    status = $4,
    priority = $5,
    estimated_completion_date = $6,
    starred = $7,
    owner = $8,
    customer = $9,
    primary_contact = $10,
    secondary_contact = $11,
    next_response_due = $12,
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
    id = $1
RETURNING *;
"""

WORK_ITEM_QUERIES[
    "GET_SUPPORT_ITEM"
] = """
SELECT * FROM support_items WHERE id = $1 AND deleted_at IS NULL;
"""

WORK_ITEM_QUERIES[
    "GET_ALL_SUPPORT_ITEM"
] = """
SELECT * FROM support_items
WHERE
    deleted_at IS NULL
ORDER BY $1
LIMIT $2
OFFSET $3;
"""

WORK_ITEM_QUERIES[
    "DELETE_SUPPORT_ITEM"
] = """
UPDATE support_items
SET
    deleted_at = NOW(),
    deleted_by_id = $2
WHERE
    id = $1
"""


WORK_ITEM_QUERIES[
    "CREATE_WORK_ITEM_COMMENT"
] = """
INSERT INTO work_item_comments
(
    id,
    work_item_id,
    description,
    created_by_id,
    modified_by_id
)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;
"""


WORK_ITEM_QUERIES[
    "GET_WORK_ITEM_COMMENT"
] = """
SELECT *
FROM work_item_comments
WHERE
    work_item_id = $1
    AND id = $2
    AND deleted_at IS NULL;
"""


WORK_ITEM_QUERIES[
    "GET_WORK_ITEM_COMMENTS"
] = """
SELECT *
FROM work_item_comments
WHERE
    work_item_id = $1
    AND deleted_at IS NULL;
"""


WORK_ITEM_QUERIES[
    "UPDATE_WORK_ITEM_COMMENT"
] = """
UPDATE work_item_comments
SET
    description = $3,
    modified_at = NOW(),
    modified_by_id = $4,
    deleted_at = $5,
    deleted_by_id = $6
WHERE
    work_item_id = $1
    AND id = $2
RETURNING *;
"""

WORK_ITEM_QUERIES[
    "DELETE_WORK_ITEM_COMMENT"
] = """
UPDATE work_item_comments
SET
    deleted_at = NOW(),
    deleted_by_id = $3
WHERE
    work_item_id = $1
    AND id = $2
"""


WORK_ITEM_QUERIES[
    "DELETE_WORK_ITEM_COMMENTS"
] = """
UPDATE work_item_comments
SET
    deleted_at = NOW(),
    deleted_by_id = $2
WHERE
    work_item_id = $1
"""


WORK_ITEM_QUERIES[
    "LINK_ENGINEERING_ITEMS"
] = """
INSERT INTO work_item_relationships
(
    item_1,
    item_2,
    link_type,
    created_by_id
)
VALUES ($1, $2, $3, $4)
RETURNING *;
"""


WORK_ITEM_QUERIES[
    "UNLINK_ENGINEERING_ITEMS"
] = """
DELETE FROM work_item_relationships
WHERE
    item_1 = $1
    AND item_2 = $2;
"""
