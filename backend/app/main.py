from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.api.v1.schedule import router as schedule_router
from backend.app.api.v1.benchmark import router as benchmark_router
from backend.app.api.v1.optimizer import router as optimizer_router
from backend.app.api.v1.wbs import router as wbs_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Penalty-Aware Construction Scheduling & Resource Optimization Engine",
    version="1.0.0",
    docs_url="/docs",
    openapi_url="/openapi.json",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(schedule_router, prefix=settings.API_V1_STR)
app.include_router(benchmark_router, prefix=settings.API_V1_STR)
app.include_router(optimizer_router, prefix=settings.API_V1_STR)
app.include_router(wbs_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "OptiBuild Backend Engine",
        "version": "1.0.0",
    }
