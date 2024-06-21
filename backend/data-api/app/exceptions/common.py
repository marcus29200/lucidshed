from typing import Optional, Union


class AbortDBTransaction(Exception):
    pass


class ObjectNotFoundException(Exception):
    def __init__(
        self,
        organization_id: Optional[str] = None,
        object_id: Optional[Union[str, int]] = None,
    ):
        self.object_id = object_id
        self.organization_id = organization_id

    def __str__(self):
        return f"Object [organization_id={self.organization_id} object_id={self.object_id}] not found"

class FileNotFoundException(Exception):
    def __init__(
        self,
        file_path: Optional[str] = None
    ):
        self.file_path = file_path

    def __str__(self):
        return f"File [file_path={self.file_path}] not found"

class FileTooLargeException(Exception):
    def __init__(
        self,
        file_path: Optional[str] = None,
        file_size: Optional[int] = None
    ):
        self.file_path = file_path
        self.file_size = file_size

    def __str__(self):
        return f"File [file_path={self.file_path} with size {self.file_size}] is too large to upload."