import asyncio
from logging.config import dictConfig

import uvicorn

from app.api.application import DataApplication
from app.api.settings import settings

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,  # Keep existing loggers
    "formatters": {
        "default": {
            "format": "%(asctime)s - %(name)s:%(lineno)d - %(levelname)s - %(message)s",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "default",
        },
    },
    "loggers": {
        "uvicorn": {
            "level": settings.log_level,
            "handlers": ["console"],
            "propagate": False,
        },
        "uvicorn.error": {
            "level": settings.log_level,
            "handlers": ["console"],
            "propagate": False,
        },
        "uvicorn.access": {
            "level": settings.log_level,
            "handlers": ["console"],
            "propagate": False,
        },
    },
    "root": {
        "level": settings.log_level,
        "handlers": ["console"],
    },
}


def configure_logging():
    # Define a custom logging configuration
    dictConfig(LOGGING_CONFIG)


def run_api():
    asyncio.run(_run_api())


async def _run_api():
    configure_logging()

    app = DataApplication(settings)

    await app.init()

    await app.migrate_existing_databases()

    server = uvicorn.Server(
        config=uvicorn.Config(app, port=settings.port, host=settings.host, log_level="info", log_config=LOGGING_CONFIG)
    )

    await server.serve()
