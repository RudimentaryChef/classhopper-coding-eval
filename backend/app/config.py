import os
from typing import List

class Settings:
    ALLOWED_ORIGINS: List[str] = [
        "*"
    ]

    GOOGLE_APPLICATION_CREDENTIALS: str = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "app/golden-memory-427416-s4-a1214d1197e4.json")

settings = Settings()
