from app.database.common.models import MAX_ID_LENGTH, MAX_IMAGE_SIZE
from app.database.common.shared_queries import BASE_MODEL_FIELDS

USER_QUERIES = {}

USER_INIT_STATEMENTS = [
    f"""
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR({MAX_ID_LENGTH}) PRIMARY KEY,
    {BASE_MODEL_FIELDS},
    email VARCHAR({MAX_ID_LENGTH}) UNIQUE NOT NULL,
    first_name VARCHAR({MAX_ID_LENGTH}),
    last_name VARCHAR({MAX_ID_LENGTH}),
    disabled BOOLEAN DEFAULT FALSE,
    title VARCHAR({MAX_ID_LENGTH}),
    team VARCHAR({MAX_ID_LENGTH}),
    phone VARCHAR({MAX_ID_LENGTH}),
    location VARCHAR({MAX_ID_LENGTH}),
    timezone VARCHAR({MAX_ID_LENGTH}),
    bio VARCHAR({MAX_ID_LENGTH}),
    picture BYTEA CHECK (OCTET_LENGTH(picture) <= {MAX_IMAGE_SIZE}),
    password VARCHAR(256),
    super_admin BOOLEAN DEFAULT FALSE,
    verified BOOLEAN DEFAULT FALSE,
    reset_code VARCHAR(256),
    created_org_count INT,
    created_org_limit INT
)
    """,
    f"""
CREATE TABLE IF NOT EXISTS user_permissions (
    id VARCHAR({MAX_ID_LENGTH}),
    organization_id VARCHAR({MAX_ID_LENGTH}),
    {BASE_MODEL_FIELDS},
    user_id VARCHAR({MAX_ID_LENGTH}) REFERENCES users(id) ON DELETE CASCADE,
    disabled BOOLEAN DEFAULT FALSE,
    role VARCHAR({MAX_ID_LENGTH}),
    org_admin BOOLEAN DEFAULT FALSE,
    UNIQUE (organization_id, user_id),
    PRIMARY KEY (organization_id, user_id)
)
    """,
]


USER_QUERIES[
    "CREATE_USER"
] = """
INSERT INTO users
(
    id,
    email,
    first_name,
    last_name,
    disabled,
    created_by_id,
    modified_by_id,
    title,
    team,
    phone,
    location,
    timezone,
    bio,
    picture,
    reset_code,
    created_org_count,
    created_org_limit
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
RETURNING *;
"""


USER_QUERIES[
    "GET_USER"
] = """
SELECT * FROM users WHERE (id = $1 OR email = $1) AND deleted_at IS NULL;
"""

USER_QUERIES[
    "GET_USERS"
] = """
SELECT * FROM users
WHERE
    deleted_at IS NULL
ORDER BY $1
LIMIT $2
OFFSET $3;
"""

USER_QUERIES[
    "GET_ORGANIZATION_USER"
] = """
SELECT
    *,
    (
        SELECT to_jsonb(user_permissions)
        FROM user_permissions
        WHERE user_permissions.user_id = users.id AND user_permissions.organization_id = $1 AND deleted_at IS NULL
        LIMIT 1
    ) AS permissions
FROM
    users
WHERE
    (id = $2 or email = $2)
    AND deleted_at IS NULL
    AND EXISTS (
        SELECT 1
        FROM user_permissions
        WHERE
            user_permissions.user_id = users.id
            AND user_permissions.organization_id = $1
            AND user_permissions.deleted_at IS NULL
        LIMIT 1
    );
"""


USER_QUERIES[
    "GET_ORGANIZATION_USERS"
] = """
SELECT
    users.*,
    to_jsonb (up) AS permissions
FROM
    users
    LEFT JOIN user_permissions AS up ON users.id = up.user_id
WHERE
    up.organization_id = $1
    AND users.deleted_at IS NULL
ORDER BY $2
LIMIT $3
OFFSET $4;
"""


USER_QUERIES[
    "UPDATE_USER"
] = """
UPDATE users
SET
    first_name = $2,
    last_name = $3,
    disabled = $4,
    created_by_id = $5,
    modified_at = NOW(),
    modified_by_id = $6,
    deleted_at = $7,
    deleted_by_id = $8,
    title = $9,
    team = $10,
    phone = $11,
    location = $12,
    timezone = $13,
    bio = $14,
    picture = $15,
    super_admin = $16,
    password = $17,
    reset_code = $18
WHERE id = $1
RETURNING *;
"""


USER_QUERIES[
    "SET_USER_PASSWORD"
] = """
UPDATE users
SET
    reset_code = NULL,
    password = $2
WHERE reset_code = $1
RETURNING *;
"""


USER_QUERIES[
    "DELETE_USER"
] = """
UPDATE users
SET
    deleted_at = NOW(),
    deleted_by_id = $2
WHERE id = $1;
"""


USER_QUERIES[
    "CREATE_USER_PERMISSION"
] = """
INSERT INTO user_permissions
(
    organization_id,
    id,
    user_id,
    disabled,
    role,
    created_by_id,
    modified_by_id
)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;
"""


USER_QUERIES[
    "GET_USER_PERMISSION"
] = """
SELECT * FROM user_permissions WHERE organization_id = $1 AND user_id = $2;
"""


USER_QUERIES[
    "GET_USER_ORGANIZATIONS"
] = """
SELECT organization_id FROM user_permissions WHERE user_id = $1;
"""


USER_QUERIES[
    "UPDATE_USER_PERMISSION"
] = """
UPDATE user_permissions
SET
    disabled = $3,
    role = $4,
    modified_at = NOW(),
    modified_by_id = $5,
    deleted_at = $6,
    deleted_by_id = $7
WHERE organization_id = $1 AND user_id = $2
RETURNING *;
"""

USER_QUERIES[
    "DELETE_USER_PERMISSION"
] = """
UPDATE user_permissions
SET
    deleted_at = NOW(),
    deleted_by_id = $3
WHERE organization_id = $1 AND user_id = $2;
"""
