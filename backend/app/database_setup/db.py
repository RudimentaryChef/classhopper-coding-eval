import os
import certifi
import sqlalchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from google.cloud.sql.connector import Connector, IPTypes

# =====================
#    ENV & CONNECT
# =====================

# Pull from environment variables (or provide defaults).
DATABASE_USER = os.getenv("DB_USER", "adiKrish")
DATABASE_PASSWORD = os.getenv("DB_PASSWORD", "20T;(8j^v:NTPb/H")
#Uncomment this line and comment out the next line to switch between test and prod databases
DATABASE_NAME = "TestDataBase"
#DATABASE_NAME = os.getenv("DB_NAME", "Spring2025Refactor")
INSTANCE_CONNECTION_NAME = os.getenv(
    "INSTANCE_CONNECTION_NAME",
    "golden-memory-427416-s4:us-east1:classhoppy"
)

os.environ['SSL_CERT_FILE'] = certifi.where()

connector = Connector()

def getconn() -> sqlalchemy.engine.base.Connection:
    """Helper function for the Google Cloud SQL connector."""
    conn = connector.connect(
        INSTANCE_CONNECTION_NAME,
        "pymysql",
        user=DATABASE_USER,
        password=DATABASE_PASSWORD,
        db=DATABASE_NAME,
        ip_type=IPTypes.PUBLIC
    )
    return conn

DATABASE_URL = "mysql+mysqlconnector://"
engine = create_engine(DATABASE_URL, creator=getconn)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
