import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

# Automatically load .env from project root or working directory
env_path = Path(__file__).resolve().parent.parent.parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()


class Settings:
    PROJECT_NAME: str = "OptiBuild Construction Scheduling & Resource Optimization Engine"
    API_V1_STR: str = "/api/v1"

    def __init__(self):
        jwt_secret = os.getenv("JWT_SECRET")
        if not jwt_secret or len(jwt_secret.strip()) < 32:
            raise RuntimeError(
                "JWT_SECRET environment variable is missing or shorter than 32 characters. "
                "Please configure a secure JWT_SECRET with at least 32 characters."
            )
        self.JWT_SECRET: str = jwt_secret.strip()
        self.JWT_ALGORITHM: str = "HS256"
        self.ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 hours

    @property
    def CORS_ORIGINS(self) -> List[str]:
        origins = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:8000",
            "http://127.0.0.1:8000",
        ]
        frontend_url = os.getenv("FRONTEND_URL")
        if frontend_url:
            for url in frontend_url.split(","):
                cleaned = url.strip().rstrip("/")
                if cleaned and cleaned not in origins:
                    origins.append(cleaned)
        return origins


settings = Settings()
