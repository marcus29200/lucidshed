import asyncio

import uvicorn

from app.api.application import DataApplication
from app.api.settings import Settings


def run_api():
    asyncio.run(_run_api())


async def _run_api():
    app = DataApplication(Settings())

    server = uvicorn.Server(config=uvicorn.Config(app, port=app.settings.port, host=app.settings.host))

    await server.serve()
