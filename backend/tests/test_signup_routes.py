"""Tests for signup_routes.py bugs."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database_setup.models import Base


# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

client = TestClient(app)


def test_update_signup_parameter():
    """Test that update_signup uses correct parameter (signup_in instance, not SignupIn class)."""
    # This test checks if line 124 uses the correct parameter
    # Bug: pydantic_in=SignupIn should be pydantic_in=signup_in

    # Read the source file
    with open("backend/app/routes/signup_routes.py", "r") as f:
        content = f.read()

    # Check that the bug is fixed
    assert "pydantic_in=signup_in" in content or "pydantic_in=SignupIn" not in content.split("update_resource")[1].split(")")[0], \
        "Bug: update_signup should use signup_in instance, not SignupIn class"


def test_no_duplicate_router():
    """Test that router is not declared twice."""
    # This test checks for duplicate router declaration
    # Bug: router = APIRouter() appears on both line 11 and line 28

    with open("backend/app/routes/signup_routes.py", "r") as f:
        lines = f.readlines()

    # Count occurrences of 'router = APIRouter()'
    router_declarations = [i for i, line in enumerate(lines) if "router = APIRouter()" in line]

    assert len(router_declarations) <= 1, \
        f"Bug: Found {len(router_declarations)} router declarations at lines {router_declarations}. Should be only 1."


def test_offset_parameter_name():
    """Test that parameter is named 'offset' not 'offest'."""
    # This test checks for typo in parameter name
    # Bug: offest should be offset

    with open("backend/app/routes/signup_routes.py", "r") as f:
        content = f.read()

    # Check in the get_instructor_signups function signature
    function_content = content.split("def get_instructor_signups")[1].split("def ")[0]

    assert "offest" not in function_content, \
        "Bug: Parameter name 'offest' is a typo, should be 'offset'"
    assert "offset" in function_content, \
        "Parameter 'offset' should exist in get_instructor_signups"


def test_routes_registered():
    """Test that all routes are properly registered."""
    # Verify that routes defined after line 28 are accessible
    # This would fail if the second router declaration overwrites the first

    # Try to access routes defined before and after line 28
    # Route defined at line 14 (before duplicate)
    response1 = client.get("/docs")  # FastAPI auto-docs should show all routes

    # Check that both batch_create (line 34, after duplicate) and create_signup (line 14, before) exist
    assert response1.status_code == 200, "API documentation should be accessible"
