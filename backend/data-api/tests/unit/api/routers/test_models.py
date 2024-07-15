import pytest

from app.api.routers.user import ResetPassword
from tests.acceptance.api.utils import DEFAULT_PASSWORD

pytestmark = pytest.mark.asyncio


async def test_check_user_password_valid():
    try:
        payload = ResetPassword(reset_code="test", password=DEFAULT_PASSWORD)

        assert payload.password
    except Exception:
        pytest.fail()


async def test_check_user_password_fails_because_of_length():
    try:
        ResetPassword(reset_code="test", password="test")

        pytest.fail()
    except ValueError as ve:
        assert "Password should be at least 8 characters long" in str(ve)


async def test_check_user_password_fails_because_of_missing_uppercase():
    try:
        ResetPassword(reset_code="test", password="test123456!")

        pytest.fail()
    except ValueError as ve:
        assert "one uppercase letter" in str(ve)


async def test_check_user_password_fails_because_of_missing_lowercase():
    try:
        ResetPassword(reset_code="test", password="TEST123456!")

        pytest.fail()
    except ValueError as ve:
        assert "one lowercase letter" in str(ve)


async def test_check_user_password_fails_because_of_missing_special():
    try:
        ResetPassword(reset_code="test", password="TEST123456")

        pytest.fail()
    except ValueError as ve:
        assert "one special" in str(ve)
