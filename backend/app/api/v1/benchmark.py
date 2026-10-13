from fastapi import APIRouter, HTTPException
from typing import Dict, List
from backend.app.schemas.benchmark import (
    BenchmarkRunRequest,
    BenchmarkComparisonResult,
)
from backend.app.engine.benchmark import (
    BenchmarkEngine,
    BENCHMARK_PRESETS,
)

router = APIRouter(prefix="/benchmark", tags=["OR-Tools CP-SAT Benchmark"])


@router.get("/presets")
def list_presets():
    """
    Returns available benchmark construction problem presets.
    """
    return {
        key: {
            "name": val["name"],
            "task_count": len(val["tasks"]),
            "resource_limits": val["resource_limits"],
            "tasks": [t.model_dump() for t in val["tasks"]],
        }
        for key, val in BENCHMARK_PRESETS.items()
    }


@router.post("/run", response_model=BenchmarkComparisonResult)
def run_benchmark(payload: BenchmarkRunRequest):
    """
    Runs both Genetic Algorithm and OR-Tools CP-SAT solver on the given project
    network and returns side-by-side metrics, makespans, runtimes, and markdown table.
    """
    try:
        tasks = payload.tasks
        limits = payload.resource_limits

        # If tasks not provided, default to medium benchmark preset
        if not tasks:
            preset = BENCHMARK_PRESETS.get("medium_superstructure")
            tasks = preset["tasks"]
            limits = preset["resource_limits"]
        elif limits is None:
            limits = {}

        result = BenchmarkEngine.run_benchmark(
            benchmark_name=payload.benchmark_name,
            tasks=tasks,
            resource_limits=limits,
            cpsat_time_limit=payload.cpsat_time_limit_seconds,
            ga_population=payload.ga_population_size,
            ga_generations=payload.ga_generations,
            random_seed=payload.random_seed or 42,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Benchmark execution failed: {str(e)}")
