from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from backend.app.schemas.schedule import TaskItem


class SolverMetrics(BaseModel):
    solver_name: str
    status: str
    makespan_days: int
    runtime_ms: float
    schedule: Dict[str, Dict[str, int]]  # {task_id: {"start": s, "finish": f}}


class BenchmarkComparisonResult(BaseModel):
    benchmark_name: str
    task_count: int
    resource_limits: Dict[str, int]
    ga_metrics: SolverMetrics
    cpsat_metrics: SolverMetrics
    optimality_gap_percent: float = Field(
        ...,
        description="(GA Makespan - CPSAT Makespan) / CPSAT Makespan * 100",
    )
    cpsat_is_optimal: bool
    markdown_table: str


class BenchmarkRunRequest(BaseModel):
    benchmark_name: str = "SPPU Superstructure Construction Benchmark"
    tasks: Optional[List[TaskItem]] = None
    resource_limits: Optional[Dict[str, int]] = None
    cpsat_time_limit_seconds: float = Field(default=5.0, ge=1.0, le=60.0)
    ga_population_size: int = Field(default=50, ge=10, le=200)
    ga_generations: int = Field(default=80, ge=10, le=300)
    random_seed: Optional[int] = Field(default=42)
