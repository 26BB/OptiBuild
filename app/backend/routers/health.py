"""Health check and system diagnostics endpoint."""

from __future__ import annotations

import datetime
from fastapi import APIRouter
from app.backend.config import settings

router = APIRouter(tags=["System Health"])


@router.get("/health")
def get_health() -> dict[str, str]:
    """Check API server status and version."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }
