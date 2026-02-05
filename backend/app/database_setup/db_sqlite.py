"""
SQLite database configuration for local testing.
Replace db.py imports with this file to run without Google Cloud.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Use SQLite for local testing
DATABASE_URL = "sqlite:///./test_database.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # Required for SQLite
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Create tables on import
def init_db():
    from app.database_setup import models
    Base.metadata.create_all(bind=engine)
