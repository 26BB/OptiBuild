"""FastAPI Application Entry Point for OptiBuild."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.backend.config import settings
from app.backend.database import Base, engine
from app.backend.routers import (
    health,
    projects,
    activities,
    optimize,
    ingestion,
    progress,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("optibuild")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle event handler for DB table creation and cleanup."""
    logger.info("Initializing OptiBuild database schema...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialized successfully.")
    yield
    logger.info("Shutting down OptiBuild API.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "OptiBuild: Resource-Constrained Construction Schedule Optimizer "
        "with MahaRERA Section 18 Statutory Penalty vs. Crash Cost Engine."
    ),
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers under prefix
app.include_router(health.router, prefix=settings.API_PREFIX)
app.include_router(projects.router, prefix=settings.API_PREFIX)
app.include_router(activities.router, prefix=settings.API_PREFIX)
app.include_router(optimize.router, prefix=settings.API_PREFIX)
app.include_router(ingestion.router, prefix=settings.API_PREFIX)
app.include_router(progress.router, prefix=settings.API_PREFIX)


@app.get("/")
def root():
    """Root redirect / discovery."""
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "api_prefix": settings.API_PREFIX,
        "status": "online",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.backend.main.py:app", host="0.0.0.0", port=8000, reload=True)
