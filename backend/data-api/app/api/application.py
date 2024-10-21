import logging

from asyncpg.exceptions import UniqueViolationError
from fastapi import APIRouter, FastAPI, Request
from sendgrid import SendGridAPIClient
from starlette.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.api.dependencies.database import close_pool, get_pool
from app.api.routers.engineering_item import router as engineering_item_router
from app.api.routers.iteration import router as iteration_router
from app.api.routers.organization import router as organization_router
from app.api.routers.support_item import router as support_item_router
from app.api.routers.team import router as team_router
from app.api.routers.user import router as user_router
from app.api.settings import database_pools, settings
from app.database.common.queries import USER_INIT_STATEMENTS
from app.database.history.controllers.history import HistoryController
from app.database.iterations.controllers.iteration import IterationController
from app.database.organizations.controllers.organization import OrganizationController
from app.database.teams.controllers.team import TeamController
from app.database.users.controllers.user import UserController
from app.database.users.controllers.user_permission import UserPermissionController
from app.database.users.controllers.user_session import UserSessionController
from app.database.utils import init_database_tables
from app.database.work_items.controllers.engineering_item import EngineeringController
from app.database.work_items.controllers.support_item import SupportController
from app.exceptions.common import ObjectNotFoundException

router = APIRouter()

logger = logging.getLogger(__name__)


@router.get("/health")
async def health(request: Request):
    return {"status": "ok"}


class DataApplication(FastAPI):
    def __init__(self, *args, **kwargs):
        super().__init__(title="LucidShed API")

        self.include_router(router)
        self.include_router(user_router, prefix="/users")
        self.include_router(organization_router, prefix="")
        self.include_router(engineering_item_router, prefix="/{organization_id}/engineering")
        self.include_router(support_item_router, prefix="/{organization_id}/support")
        self.include_router(iteration_router, prefix="/{organization_id}/iterations")
        self.include_router(team_router, prefix="/{organization_id}/teams")

        self.add_exception_handler(ObjectNotFoundException, self.not_found_handler)
        self.add_exception_handler(UniqueViolationError, self.duplicate_handler)
        self.add_exception_handler(Exception, self.generic_handler)

        self.add_middleware(
            CORSMiddleware,
            allow_origins=["http://localhost:8080", "https://lucidshed.github.io"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        if settings.sendgrid_api_key:
            self.sendgrid_client = SendGridAPIClient(settings.sendgrid_api_key)
        else:
            self.sendgrid_client = None

        database_pools.set({})

    async def __aenter__(self):
        await self.init()

        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()

    async def init(self) -> None:
        await init_database_tables(await get_pool(settings.user_db_name), USER_INIT_STATEMENTS)
        close_pool(settings.user_db_name)

        self.engineering_controller = EngineeringController()
        self.support_controller = SupportController()
        self.user_controller = UserController()
        self.organization_controller = OrganizationController()
        self.user_permission_controller = UserPermissionController()
        self.user_session_controller = UserSessionController()
        self.iteration_controller = IterationController()
        self.team_controller = TeamController()
        self.history_controller = HistoryController()

    async def close(self) -> None:
        pass

    async def duplicate_handler(self, request: Request, exc: UniqueViolationError):
        return JSONResponse(status_code=412, content={"detail": "Unable to create object"})

    async def not_found_handler(self, request: Request, exc: ObjectNotFoundException):
        return JSONResponse(status_code=404, content={"detail": f"Object {exc.object_id} not found"})

    async def generic_handler(self, request: Request, exc: Exception):
        logger.exception(exc)

        return JSONResponse(status_code=424, content={"detail": "Unable to process request at this time"})


app = DataApplication(settings)
