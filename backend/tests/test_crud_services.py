"""Tests for CRUD_services.py bugs."""
import pytest
import ast


def test_type_hint_any_vs_Any():
    """Test that type hints use 'Any' from typing module, not lowercase 'any'."""
    # This test checks line 100: criteria: Dict[str,any] should be Dict[str, Any]

    with open("backend/app/services/CRUD_services.py", "r") as f:
        content = f.read()

    # Parse the file to check type annotations
    tree = ast.parse(content)

    # Check imports
    has_Any_import = False
    for node in ast.walk(tree):
        if isinstance(node, ast.ImportFrom):
            if node.module == "typing":
                for alias in node.names:
                    if alias.name == "Any":
                        has_Any_import = True

    # Check for lowercase 'any' in type hints
    lowercase_any_found = False
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef) and node.name == "get_multiple_criteria":
            for arg in node.args.args:
                if arg.annotation:
                    annotation_str = ast.unparse(arg.annotation)
                    if "any" in annotation_str.lower() and "Any" not in annotation_str:
                        lowercase_any_found = True

    assert not lowercase_any_found or has_Any_import, \
        "Bug: Type hint uses lowercase 'any' instead of 'Any' from typing module"

    # Also do a simple string check
    assert "Dict[str,any]" not in content and "Dict[str, any]" not in content, \
        "Bug: Found 'Dict[str,any]' or 'Dict[str, any]' - should use 'Any' with capital A"
