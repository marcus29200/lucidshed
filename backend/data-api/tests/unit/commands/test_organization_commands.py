import asyncio
from unittest.mock import AsyncMock, Mock, patch, MagicMock

import pytest
from asyncpg import create_pool

from app.commands.organizations.vacuum import VacuumCommand

pytestmark = pytest.mark.asyncio


async def test_vacuum_command():
    with patch("app.commands.organizations.vacuum.connect"):

        command = VacuumCommand()
        remove_count = await command.perform("test_organization")

        assert remove_count == 0
