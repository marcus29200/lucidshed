from typing import Optional, Union


class AbortDBTransaction(Exception):
    pass


class ObjectNotFoundException(Exception):
    def __init__(
        self,
        organization_id: Optional[str] = None,
        object_id: Optional[Union[str]] = None,
    ):
        self.object_id = object_id
        self.organization_id = organization_id

    def __str__(self):
        if self.organization_id:
            return f"Object [organization_id={self.organization_id} object_id={self.object_id}] not found"
        else:
            return f"Object object_id={self.object_id}] not found"


class SendgridException(Exception):
    pass
