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
    team_id INT REFERENCES teams(id) ON DELETE SET NULL,
    due_date timestamp without time zone DEFAULT NULL,
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
    next_response_due timestamp without time zone DEFAULT NULL
);
    """,
    f"""
CREATE TABLE IF NOT EXISTS work_item_comments (
    id VARCHAR({MAX_ID_LENGTH}),
    organization_id VARCHAR({MAX_ID_LENGTH}) REFERENCES organizations(id) ON DELETE CASCADE,
    work_item_id INT NOT NULL,
    {BASE_MODEL_FIELDS},
    description TEXT,
    PRIMARY KEY (organization_id, id, work_item_id)
);
    """,
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


LOAD_TEAM = """
(
    SELECT to_jsonb(teams)
    FROM teams
    WHERE
        teams.id = engineering_items.team_id
        AND teams.organization_id = $1
        AND teams.deleted_at IS NULL
    LIMIT 1
) AS team
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
    team_id,
    due_date,
    acceptance_criteria,
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
FROM engineering_items WHERE organization_id = $1 AND id = $2 AND deleted_at IS NULL;
"""


# TODO Need to add iteration and team loading here
WORK_ITEM_QUERIES[
    "GET_ALL_ENGINEERING_ITEM"
] = f"""
SELECT
    *,
    {LOAD_ITERATION},
    {LOAD_TEAM}
FROM engineering_items
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
    team_id = $13,
    due_date = $14,
    acceptance_criteria = $15,
    created_by_id = $16,
    modified_at = NOW(),
    modified_by_id = $17,
    archived_at = $18,
    archived_by_id = $19,
    deleted_at = $20,
    deleted_by_id = $21,
    completed_at = $22,
    completed_by_id = $23
WHERE
    organization_id = $1 AND id = $2
RETURNING *, {LOAD_ITERATION}, {LOAD_TEAM};
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


WORK_ITEM_QUERIES[
    "CREATE_SUPPORT_ITEM"
] = """
INSERT INTO support_items
(
    organization_id,
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
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
RETURNING *;
"""

WORK_ITEM_QUERIES[
    "UPDATE_SUPPORT_ITEM"
] = """
UPDATE support_items
SET
    title = $3,
    description = $4,
    status = $5,
    priority = $6,
    estimated_completion_date = $7,
    starred = $8,
    owner = $9,
    customer = $10,
    primary_contact = $11,
    secondary_contact = $12,
    next_response_due = $13,
    created_by_id = $14,
    modified_at = NOW(),
    modified_by_id = $15,
    archived_at = $16,
    archived_by_id = $17,
    deleted_at = $18,
    deleted_by_id = $19,
    completed_at = $20,
    completed_by_id = $21
WHERE
    organization_id = $1 AND id = $2
RETURNING *;
"""

WORK_ITEM_QUERIES[
    "GET_SUPPORT_ITEM"
] = """
SELECT * FROM support_items WHERE organization_id = $1 AND id = $2 AND deleted_at IS NULL;
"""

WORK_ITEM_QUERIES[
    "GET_ALL_SUPPORT_ITEM"
] = """
SELECT * FROM support_items
WHERE
    organization_id = $1
    AND deleted_at IS NULL
ORDER BY $2
LIMIT $3
OFFSET $4;
"""

WORK_ITEM_QUERIES[
    "DELETE_SUPPORT_ITEM"
] = """
UPDATE support_items
SET
    deleted_at = NOW(),
    deleted_by_id = $3
WHERE
    organization_id = $1 AND id = $2
"""


WORK_ITEM_QUERIES[
    "CREATE_WORK_ITEM_COMMENT"
] = """
INSERT INTO work_item_comments
(
    id,
    organization_id,
    work_item_id,
    description,
    created_by_id,
    modified_by_id
)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;
"""


WORK_ITEM_QUERIES[
    "GET_WORK_ITEM_COMMENT"
] = """
SELECT *
FROM work_item_comments
WHERE
    organization_id = $1
    AND work_item_id = $2
    AND id = $3
    AND deleted_at IS NULL;
"""


WORK_ITEM_QUERIES[
    "GET_ALL_WORK_ITEM_COMMENTS"
] = """
SELECT *
FROM work_item_comments
WHERE
    organization_id = $1
    AND work_item_id = $2
    AND deleted_at IS NULL
ORDER BY $3
LIMIT $4
OFFSET $5;
"""


WORK_ITEM_QUERIES[
    "UPDATE_WORK_ITEM_COMMENT"
] = """
UPDATE work_item_comments
SET
    description = $4,
    modified_at = NOW(),
    modified_by_id = $5,
    deleted_at = $6,
    deleted_by_id = $7
WHERE
    organization_id = $1
    AND work_item_id = $2
    AND id = $3
RETURNING *;
"""

WORK_ITEM_QUERIES[
    "DELETE_WORK_ITEM_COMMENT"
] = """
UPDATE work_item_comments
SET
    deleted_at = NOW(),
    deleted_by_id = $4
WHERE
    organization_id = $1
    AND work_item_id = $2
    AND id = $3
"""


WORK_ITEM_QUERIES[
    "DELETE_WORK_ITEM_COMMENTS"
] = """
UPDATE work_item_comments
SET
    deleted_at = NOW(),
    deleted_by_id = $3
WHERE
    organization_id = $1
    AND work_item_id = $2
"""
