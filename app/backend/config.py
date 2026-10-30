"""Application configuration loaded via Pydantic Settings."""

from __future__ import annotations

import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """OptiBuild Backend Environment & Settings."""
    PROJECT_NAME: str = "OptiBuild Construction Scheduling & Penalty Engine"
    VERSION: str = "0.1.0"
    API_PREFIX: str = "/api"

    # Server binding
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./optibuild.db")

    # Financial / RERA Defaults
    DEFAULT_SBI_MCLR: float = 8.85  # Current 1-yr SBI MCLR rate (%)
    RERA_PREMIUM: float = 2.0       # Section 18 statutory premium (%)

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "*"
    ]

    # CV Model Weights
    CV_MODEL_WEIGHTS_PATH: str = os.getenv(
        "CV_MODEL_WEIGHTS_PATH", "./weights/mobilenetv2_structural_finishing.pth"
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
