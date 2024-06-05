from pydantic import BaseModel, Field

MAX_ID_LENGTH = 64


class Model(BaseModel):
    id: str = Field(max_length=MAX_ID_LENGTH)
    organization_id: str = Field(max_length=MAX_ID_LENGTH)
