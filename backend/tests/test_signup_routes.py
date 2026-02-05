"""Tests for signup_routes.py bugs."""
import pytest
import os


def test_update_signup_parameter():
    """Test that update_signup uses correct parameter (signup_in instance, not SignupIn class)."""
    # This test checks if line 124 uses the correct parameter
    # Bug: pydantic_in=SignupIn should be pydantic_in=signup_in

    file_path = os.path.join(os.path.dirname(__file__), "../app/routes/signup_routes.py")
    with open(file_path, "r") as f:
        content = f.read()

    # Find the update_signup function
    update_signup_section = content.split("def update_signup")[1].split("def ")[0]

    # Check that it uses signup_in (the instance), not SignupIn (the class)
    assert "pydantic_in=signup_in" in update_signup_section, \
        "Bug: update_signup should use pydantic_in=signup_in (instance), not pydantic_in=SignupIn (class)"

    # Make sure SignupIn as parameter is not present
    assert "pydantic_in=SignupIn," not in update_signup_section, \
        "Bug detected: using SignupIn class instead of signup_in instance"


def test_no_duplicate_router():
    """Test that router is not declared twice."""
    # This test checks for duplicate router declaration
    # Bug: router = APIRouter() appears on both line 11 and line 28

    file_path = os.path.join(os.path.dirname(__file__), "../app/routes/signup_routes.py")
    with open(file_path, "r") as f:
        lines = f.readlines()

    # Count occurrences of 'router = APIRouter()'
    router_declarations = [i + 1 for i, line in enumerate(lines) if "router = APIRouter()" in line]

    assert len(router_declarations) == 1, \
        f"Bug: Found {len(router_declarations)} router declarations at lines {router_declarations}. Should be only 1."


def test_offset_parameter_name():
    """Test that parameter is named 'offset' not 'offest'."""
    # This test checks for typo in parameter name
    # Bug: offest should be offset

    file_path = os.path.join(os.path.dirname(__file__), "../app/routes/signup_routes.py")
    with open(file_path, "r") as f:
        content = f.read()

    # Check in the get_instructor_signups function signature
    function_content = content.split("def get_instructor_signups")[1].split("def ")[0]

    assert "offest" not in function_content, \
        "Bug: Parameter name 'offest' is a typo, should be 'offset'"
    assert "offset:" in function_content or "offset :" in function_content, \
        "Parameter 'offset' should exist in get_instructor_signups"
