from pydantic import BaseModel, Field

MAX_ID_LENGTH = 64


class Model(BaseModel):
    id: int
    organization_id: str = Field(max_length=MAX_ID_LENGTH)
