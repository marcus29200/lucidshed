from contextvars import ContextVar

from typing import Optional
from fastapi import APIRouter, FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.api.routers.engineering_item import router as engineering_item_router
from app.api.settings import Settings
from app.database.database import DatabaseController
from app.database.organizations.controllers.organization import OrganizationController
from app.database.users.controllers.user import UserController
from app.database.users.controllers.user_permission import UserPermissionController
from app.database.work_items.controllers.engineering_item import EngineeringController
from app.exceptions.common import AbortDBTransaction, ObjectNotFoundException

router = APIRouter()


db_context: ContextVar = ContextVar("db_context")


class DBMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = None
        async with request.app.db.pool.acquire() as conn:
            try:
                db_context.set(conn)

                async with conn.transaction():
                    response = await call_next(request)

                    if not str(response.status_code).startswith("2"):
                        raise AbortDBTransaction()
            except AbortDBTransaction:
                pass
            finally:
                db_context.set(None)

        return response


class DataApplication(FastAPI):
    def __init__(self, settings, *args, **kwargs):
        super().__init__(title="LucidShed Data API")

        self.settings = settings

        self.include_router(router)
        self.include_router(engineering_item_router)

        self.add_middleware(DBMiddleware)

        self.add_exception_handler(ObjectNotFoundException, self.not_found_handler)

    async def __aenter__(self):
        await self.init()

        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()

    async def init(self, reinit: Optional[bool] = False) -> None:
        self.db = DatabaseController(self.settings.database_dsn)
        await self.db.init(reinit=reinit)

        self.engineering_controller = EngineeringController(self.db)
        self.user_controller = UserController(self.db)
        self.organization_controller = OrganizationController(self.db)
        self.user_permissions_controller = UserPermissionController(self.db)

    async def close(self) -> None:
        await self.db.close()

    async def not_found_handler(self, request: Request, exc: ObjectNotFoundException):
        return JSONResponse(status_code=404, content={"detail": f"Object {exc.object_id} not found"})


app = DataApplication(Settings())
