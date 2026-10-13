class Settings:
    PROJECT_NAME: str = "OptiBuild Construction Scheduling & Resource Optimization Engine"
    API_V1_STR: str = "/api/v1"
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]


settings = Settings()
