from app.database.common.controllers import BaseController
from app.database.organizations.models.organization import Organization


class OrganizationController(BaseController):
    _type = "ORGANIZATION"
    _create_history = True
    RETURN_MODEL = Organization
