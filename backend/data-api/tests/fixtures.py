import random
import string
from unittest.mock import Mock, patch

import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.api.application import DataApplication
from app.api.settings import settings


@pytest_asyncio.fixture
async def data_app() -> DataApplication:  # type: ignore
    settings.testing = True
    async with DataApplication(settings) as app:
        app.test_org_id = "".join(random.choice(string.ascii_lowercase) for _ in range(10))

        yield app


@pytest_asyncio.fixture
async def data_api(data_app) -> AsyncClient:  # type: ignore
    async with AsyncClient(transport=ASGITransport(app=data_app), base_url="http://localhost:8080") as test_client:
        test_client.test_org_id = data_app.test_org_id
        yield test_client


@pytest_asyncio.fixture()
async def mock_sendgrid():
    settings.sendgrid_api_key = "test"

    with patch("app.api.utils.SendGridAPIClient") as mock_sendgrid:
        mock_sendgrid.send = Mock()

        yield mock_sendgrid
