from asyncpg.exceptions import UniqueViolationError
from fastapi import APIRouter, FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.api.dependencies.database import get_pool
from app.api.routers.auth import router as auth_router
from app.api.routers.engineering_item import router as engineering_item_router
from app.api.routers.iteration import router as iteration_router
from app.api.routers.organization import router as organization_router
from app.api.routers.support_item import router as support_item_router
from app.api.routers.team import router as team_router
from app.api.routers.user import router as user_router
from app.api.settings import Settings, user_db
from app.database.common.queries import USER_INIT_STATEMENTS
from app.database.iterations.controllers.iteration import IterationController
from app.database.organizations.controllers.organization import OrganizationController
from app.database.teams.controllers.team import TeamController
from app.database.users.controllers.user import UserController
from app.database.users.controllers.user_permission import UserPermissionController
from app.database.utils import init_database_tables
from app.database.work_items.controllers.engineering_item import EngineeringController
from app.database.work_items.controllers.support_item import SupportController
from app.exceptions.common import AbortDBTransaction, ObjectNotFoundException

router = APIRouter()


class DBMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = None
        # Setup user database connection
        async with request.app.user_pool.acquire() as user_conn:
            try:
                user_db.set(user_conn)

                async with user_conn.transaction():
                    response = await call_next(request)

                    if not str(response.status_code).startswith("2"):
                        raise AbortDBTransaction()
            except AbortDBTransaction:
                pass
            finally:
                user_db.set(None)

        return response


class DataApplication(FastAPI):
    def __init__(self, settings, *args, **kwargs):
        super().__init__(title="LucidShed API")

        self.settings = settings

        self.include_router(router)
        self.include_router(auth_router, prefix="/auth")
        self.include_router(user_router, prefix="/users")
        self.include_router(organization_router, prefix="")
        self.include_router(engineering_item_router, prefix="/{organization_id}/engineering")
        self.include_router(support_item_router, prefix="/{organization_id}/support")
        self.include_router(iteration_router, prefix="/{organization_id}/iterations")
        self.include_router(team_router, prefix="/{organization_id}/teams")

        self.add_middleware(DBMiddleware)

        self.add_exception_handler(ObjectNotFoundException, self.not_found_handler)
        self.add_exception_handler(UniqueViolationError, self.duplicate_handler)

    async def __aenter__(self):
        await self.init()

        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()

    async def init(self) -> None:
        self.user_pool = await get_pool(self.settings.database_name)
        async with self.user_pool.acquire() as conn:
            await init_database_tables(conn, USER_INIT_STATEMENTS)

        self.engineering_controller = EngineeringController()
        self.support_controller = SupportController()
        self.user_controller = UserController()
        self.organization_controller = OrganizationController()
        self.user_permission_controller = UserPermissionController()
        self.iteration_controller = IterationController()
        self.team_controller = TeamController()

    async def close(self) -> None:
        await self.user_pool.close()

    async def duplicate_handler(self, request: Request, exc: UniqueViolationError):
        return JSONResponse(status_code=412, content={"detail": "Unable to create object"})

    async def not_found_handler(self, request: Request, exc: ObjectNotFoundException):
        return JSONResponse(status_code=404, content={"detail": f"Object {exc.object_id} not found"})


app = DataApplication(Settings())
