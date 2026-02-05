"""Pytest configuration and fixtures."""
import pytest


@pytest.fixture
def mock_db():
    """Mock database session for testing."""
    # TODO: Implement SQLite test database
    pass


@pytest.fixture
def test_client():
    """Test client for FastAPI application."""
    # TODO: Implement test client
    pass
