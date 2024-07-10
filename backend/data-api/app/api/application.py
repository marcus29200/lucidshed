from contextvars import ContextVar
from typing import Optional

from asyncpg import create_pool
from asyncpg.exceptions import UniqueViolationError
from fastapi import APIRouter, FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.api.routers.auth import router as auth_router
from app.api.routers.engineering_item import router as engineering_item_router
from app.api.routers.support_item import router as support_item_router
from app.api.routers.iteration import router as iteration_router
from app.api.routers.organization import router as organization_router
from app.api.routers.team import router as team_router
from app.api.routers.user import router as user_router
from app.api.settings import Settings
from app.database.database import DatabaseController
from app.database.iterations.controllers.iteration import IterationController
from app.database.organizations.controllers.organization import OrganizationController
from app.database.teams.controllers.team import TeamController
from app.database.users.controllers.user import UserController
from app.database.users.controllers.user_permission import UserPermissionController
from app.database.work_items.controllers.engineering_item import EngineeringController
from app.database.work_items.controllers.support_item import SupportController
from app.exceptions.common import AbortDBTransaction, ObjectNotFoundException

router = APIRouter()


data_db_context: ContextVar = ContextVar("data_db_context")
user_db_context: ContextVar = ContextVar("user_db_context")


class DBMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = None
        db_name = request.path_params.get("organization_id")
        if db_name:
            async with create_pool(
                host="localhost", port="5432", name=db_name, user="postgres", password="password"
            ) as data_pool, data_pool.acquire() as data_conn, create_pool(
                host="localhost", port="5432", name="users", user="postgres", password="password"
            ) as user_pool, user_pool.acquire() as user_conn:
                try:
                    data_db_context.set(data_conn)
                    user_db_context.set(user_conn)

                    async with data_conn.transaction(), user_conn.transaction():
                        response = await call_next(request)

                        if not str(response.status_code).startswith("2"):
                            raise AbortDBTransaction()
                except AbortDBTransaction:
                    pass
                finally:
                    data_db_context.set(None)
                    user_db_context.set(None)
        else:
            async with create_pool(
                host="localhost", port="5432", name="users", user="postgres", password="password"
            ) as user_pool, user_pool.acquire() as user_conn:
                try:
                    user_db_context.set(user_conn)

                    async with user_conn.transaction():
                        response = await call_next(request)

                        if not str(response.status_code).startswith("2"):
                            raise AbortDBTransaction()
                except AbortDBTransaction:
                    pass
                finally:
                    user_db_context.set(None)

        return response


class DataApplication(FastAPI):
    def __init__(self, settings, *args, **kwargs):
        super().__init__(title="LucidShed Data API")

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

    async def init(self, reinit: Optional[bool] = False) -> None:
        self.db = DatabaseController(self.settings.database_dsn)
        await self.db.init(reinit=reinit)

        self.engineering_controller = EngineeringController(self.db)
        self.support_controller = SupportController(self.db)
        self.user_controller = UserController(self.db)
        self.organization_controller = OrganizationController(self.db)
        self.user_permission_controller = UserPermissionController(self.db)
        self.iteration_controller = IterationController(self.db)
        self.team_controller = TeamController(self.db)

    async def close(self) -> None:
        await self.db.close()

    async def duplicate_handler(self, request: Request, exc: UniqueViolationError):
        return JSONResponse(status_code=412, content={"detail": "Unable to create object"})

    async def not_found_handler(self, request: Request, exc: ObjectNotFoundException):
        return JSONResponse(status_code=404, content={"detail": f"Object {exc.object_id} not found"})


app = DataApplication(Settings())
