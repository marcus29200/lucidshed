from app.database.common.models import MAX_ID_LENGTH


BASE_MODEL_FIELDS = f"""
    id SERIAL PRIMARY KEY,
    organization_id VARCHAR({MAX_ID_LENGTH}),
    created_at timestamp without time zone DEFAULT NOW(),
    created_by_id VARCHAR({MAX_ID_LENGTH}),
    modified_at timestamp without time zone DEFAULT NOW(),
    modified_by_id VARCHAR({MAX_ID_LENGTH}),
    deleted_at timestamp without time zone DEFAULT NULL,
    deleted_by_id VARCHAR({MAX_ID_LENGTH}),
"""
