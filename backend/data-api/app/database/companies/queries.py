from app.database.common.shared_queries import BASE_MODEL_FIELDS

COMPANY_QUERIES = {}

COMPANY_INIT_STATEMENTS = [
    f"""
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    {BASE_MODEL_FIELDS},
    name VARCHAR(256),
    description TEXT
);
"""
]

COMPANY_QUERIES[
    "CREATE_COMPANY"
] = """
INSERT INTO companies
(
    name,
    description,
    created_by_id,
    modified_by_id
)
VALUES ($1, $2, $3, $4)
RETURNING *;
"""

COMPANY_QUERIES[
    "UPDATE_COMPANY"
] = """
UPDATE companies
SET
    name = $2,
    description = $3,
    modified_at = NOW(),
    modified_by_id = $4,
    deleted_at = $5,
    deleted_by_id = $6
WHERE
    id = $1
RETURNING *;
"""

COMPANY_QUERIES[
    "GET_COMPANY"
] = """
SELECT * FROM companies WHERE id = $1 AND deleted_at IS NULL;
"""

COMPANY_QUERIES[
    "GET_COMPANY_BY_NAME"
] = """
SELECT *
FROM companies
WHERE LOWER(name) = LOWER($1) AND deleted_at IS NULL;
"""

COMPANY_QUERIES[
    "GET_ALL_COMPANIES"
] = """
SELECT * FROM companies
WHERE
    deleted_at IS NULL
ORDER BY $1
"""

COMPANY_QUERIES[
    "DELETE_COMPANY"
] = """
UPDATE companies
SET
    deleted_at = NOW(),
    deleted_by_id = $2
WHERE
    id = $1
"""
