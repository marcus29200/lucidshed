from app.database.common.models import MAX_ID_LENGTH
from app.database.common.shared_queries import BASE_MODEL_FIELDS
from app.database.work_items.queries import BASE_WORK_ITEM_FIELDS

FEATURE_REQUEST_QUERIES = {}

FEATURE_REQUEST_UPGRADE_STATEMENTS = [
    # This shoujld only be run once before the first migration
    """
DROP TABLE IF EXISTS feature_requests;
DROP TABLE IF EXISTS feature_request_comments;
DROP TABLE IF EXISTS features;
DROP TABLE IF EXISTS feature_list;
DROP TABLE IF EXISTS feature_list_feature_request;
    """,
]

FEATURE_REQUEST_INIT_STATEMENTS = [
    f"""
CREATE TABLE IF NOT EXISTS feature_requests (
    submitted_by_id VARCHAR({MAX_ID_LENGTH}),
    submitted_date TIMESTAMP with time zone DEFAULT NULL,
    feature_assigned VARCHAR({MAX_ID_LENGTH}),
    company_id INT REFERENCES companies(id) ON DELETE SET NULL,
    {BASE_WORK_ITEM_FIELDS}
);
    """,
    f"""
CREATE TABLE IF NOT EXISTS feature_request_comments (
    id VARCHAR({MAX_ID_LENGTH}),
    feature_request_id INT NOT NULL,
    {BASE_MODEL_FIELDS},
    description TEXT
);
    """,
    f"""
CREATE TABLE IF NOT EXISTS feature_request_relationships (
    item_1 INT REFERENCES feature_requests(id) ON DELETE CASCADE,
    item_2 INT REFERENCES features(id) ON DELETE CASCADE,
    created_at TIMESTAMP with time zone DEFAULT NOW(),
    created_by_id VARCHAR({MAX_ID_LENGTH}),
    PRIMARY KEY (item_1, item_2)
);
    """,
]
FEATURE_REQUEST_QUERIES[
    "CREATE_FEATURE_REQUEST"
] = """
INSERT INTO feature_requests
(
    title,
    submitted_by_id,
    submitted_date,
    feature_assigned,
    description,
    company_id,
    created_by_id,
    modified_by_id
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *;
"""

FEATURE_REQUEST_QUERIES[
    "UPDATE_FEATURE_REQUEST"
] = """
UPDATE feature_requests
SET
    title = $2,
    submitted_by_id = $3,
    submitted_date = $4,
    feature_assigned = $5,
    description = $6,
    company_id = $7,
    created_by_id = $8,
    modified_at = NOW(),
    modified_by_id = $9,
    deleted_at = $10,
    deleted_by_id = $11
WHERE
    id = $1
RETURNING *;
"""

FEATURE_REQUEST_QUERIES[
    "GET_FEATURE_REQUEST_ITEM"
] = """
SELECT * FROM feature_requests WHERE id = $1 AND deleted_at IS NULL;
"""

FEATURE_REQUEST_QUERIES[
    "GET_ALL_FEATURE_REQUESTS"
] = """
SELECT * FROM feature_requests
WHERE
    deleted_at IS NULL
ORDER BY $1
LIMIT $2
OFFSET $3;
"""

FEATURE_REQUEST_QUERIES[
    "DELETE_FEATURE_REQUEST_ITEM"
] = """
UPDATE feature_requests
SET
    deleted_at = NOW(),
    deleted_by_id = $2
WHERE
    id = $1
"""

FEATURE_REQUEST_QUERIES[
    "CREATE_FEATURE_REQUEST_COMMENT"
] = """
INSERT INTO feature_request_comments
(
    id,
    feature_request_id,
    description,
    created_by_id,
    modified_by_id
)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;
"""

FEATURE_REQUEST_QUERIES[
    "GET_FEATURE_REQUEST_COMMENT"
] = """
SELECT *
FROM feature_request_comments
WHERE
    feature_request_id = $1
    AND id = $2
    AND deleted_at IS NULL;
"""

FEATURE_REQUEST_QUERIES[
    "GET_FEATURE_REQUEST_COMMENTS"
] = """
SELECT *
FROM feature_request_comments
WHERE
    feature_request_id = $1
    AND deleted_at IS NULL;
"""

FEATURE_REQUEST_QUERIES[
    "UPDATE_FEATURE_REQUEST_COMMENT"
] = """
UPDATE feature_request_comments
SET
    description = $3,
    modified_at = NOW(),
    modified_by_id = $4,
    deleted_at = $5,
    deleted_by_id = $6
WHERE
    feature_request_id = $1
    AND id = $2
RETURNING *;
"""

FEATURE_REQUEST_QUERIES[
    "DELETE_FEATURE_REQUEST_COMMENT"
] = """
UPDATE feature_request_comments
SET
    deleted_at = NOW(),
    deleted_by_id = $3
WHERE
    feature_request_id = $1
    AND id = $2;
"""

FEATURE_REQUEST_QUERIES[
    "DELETE_FEATURE_REQUEST_COMMENTS"
] = """
UPDATE feature_request_comments
SET
    deleted_at = NOW(),
    deleted_by_id = $2
WHERE
    feature_request_id = $1;
"""

FEATURE_REQUEST_QUERIES[
    "LINK_FEATURE_REQUEST_FEATURE"
] = """
INSERT INTO feature_request_relationships
(
    item_1,
    item_2,
    created_by_id
)
VALUES ($1, $2, $3)
RETURNING *;
"""

FEATURE_REQUEST_QUERIES[
    "UNLINK_FEATURE_REQUEST_FEATURE"
] = """
DELETE FROM feature_request_relationships
WHERE
    item_1 = $1
    AND item_2 = $2;
"""


FEATURE_QUERIES = {}

FEATURE_INIT_STATEMENTS = [
    f"""
CREATE TABLE IF NOT EXISTS features (
    {BASE_WORK_ITEM_FIELDS},
    requests INT,
    reach INT,
    impact INT,
    confidence INT,
    effort INT,
    growth INT
);
    """,
]

FEATURE_QUERIES[
    "CREATE_FEATURE"
] = """
INSERT INTO features
(
    title,
    description,
    requests,
    reach,
    impact,
    confidence,
    effort,
    growth,
    created_by_id,
    modified_by_id
)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING id, title, description, requests, reach, impact, confidence, effort,
    growth, created_by_id, modified_by_id, created_at, modified_at;
"""
FEATURE_QUERIES[
    "GET_FEATURE_ITEM"
] = """
SELECT
    id, title, description, requests, reach, impact, confidence, effort,
    growth, created_by_id, modified_by_id, created_at, modified_at
    FROM features
    WHERE id = $1 AND deleted_at IS NULL;
"""
FEATURE_QUERIES[
    "GET_ALL_FEATURES"
] = """
SELECT
    id, title, description, requests, reach, impact, confidence, effort,
    growth, created_by_id, modified_by_id, created_at, modified_at
    FROM features
    WHERE deleted_at IS NULL
ORDER BY $1
LIMIT $2
OFFSET $3;
"""
FEATURE_QUERIES[
    "UPDATE_FEATURE_ITEM"
] = """
UPDATE features
SET
    title = $2,
    description = $3,
    requests = $4,
    reach = $5,
    impact = $6,
    confidence = $7,
    effort = $8,
    growth = $9,
    modified_by_id = $10,
    modified_at = NOW()
WHERE id = $1
RETURNING id, title, description, requests, reach, impact, confidence, effort,
growth, created_by_id, modified_by_id, created_at, modified_at;
"""
FEATURE_QUERIES[
    "DELETE_FEATURE_ITEM"
] = """
UPDATE features
SET
    deleted_at = NOW(),
    deleted_by_id = $2
WHERE
    id = $1
"""


FEATURE_LIST_QUERIES = {}

FEATURE_LIST_INIT_STATEMENTS = [
    f"""
CREATE TABLE IF NOT EXISTS feature_list (
    {BASE_WORK_ITEM_FIELDS},
    features INT[]
);
""",
    f"""
CREATE TABLE IF NOT EXISTS feature_list_relationships (
item_1 INT REFERENCES feature_list(id) ON DELETE CASCADE,
item_2 INT REFERENCES features(id) ON DELETE CASCADE,
created_at TIMESTAMP with time zone DEFAULT NOW(),
created_by_id VARCHAR({MAX_ID_LENGTH}),
PRIMARY KEY (item_1, item_2)
);
""",
]

FEATURE_LIST_QUERIES[
    "CREATE_FEATURE_LIST"
] = """
INSERT INTO feature_list
(
    title,
    description,
    created_by_id,
    modified_by_id
)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
"""

FEATURE_LIST_QUERIES[
    "GET_FEATURE_LIST_BY_ID"
] = """
SELECT *
    FROM feature_list
    WHERE id = $1 AND deleted_at IS NULL;
"""


FEATURE_LIST_QUERIES[
    "GET_ALL_FEATURE_LISTS"
] = """
SELECT
id, title, description, created_by_id, modified_by_id, created_at, modified_at
FROM feature_list
WHERE
    deleted_at IS NULL
ORDER BY $1
LIMIT $2
OFFSET $3;
    """

FEATURE_LIST_QUERIES[
    "UPDATE_FEATURE_LIST"
] = """
UPDATE feature_list
SET
    title = $2,
    description = $3,
    modified_by_id = $4
    modified_at = NOW()
WHERE id = $1
RETURNING id, title, description, created_by_id, modified_by_id, created_at, modified_at;
    """

FEATURE_LIST_QUERIES[
    "LINK_FEATURE_LIST_FEATURE"
] = """
    INSERT INTO feature_list_relationships (item_1, item_2, created_by_id)
    VALUES ($1, $2, $3)
    RETURNING *;
    """

FEATURE_LIST_QUERIES[
    "UNLINK_FEATURE_LIST_FEATURE"
] = """
    DELETE FROM feature_list_relationships
    WHERE
        item_1 = $1
        AND item_2 = $2;
"""


FEATURE_LIST_QUERIES[
    "GET_FEATURES_FOR_FEATURE_LIST"
] = """
SELECT item_2
FROM feature_list_relationships
WHERE item_1 = $1;
"""

FEATURE_LIST_QUERIES[
    "GET UNASSIGNED_FEATURES"
] = """
    SELECT f.*
    FROM features f
    WHERE f.id NOT IN (SELECT item_2 FROM feature_list_relationships WHERE item_1 = $1);
    """

FEATURE_LIST_QUERIES[
    "DELETE_FEATURE_LIST"
] = """
UPDATE feature_list
SET
    deleted_at = NOW(),
    deleted_by_id = $2
WHERE
    id = $1
"""
