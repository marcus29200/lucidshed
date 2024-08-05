from unittest.mock import patch

import pytest

from app.commands.organizations.vacuum import VacuumCommand

pytestmark = pytest.mark.asyncio


async def test_vacuum_command():
    with patch("app.commands.organizations.vacuum.connect"):

        command = VacuumCommand()
        remove_count = await command.perform("test_organization")

        assert remove_count == 0
