from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field, model_validator


class TaskItem(BaseModel):
    id: str = Field(..., description="Unique task identifier, e.g. 'T01'")
    name: str = Field(..., description="Task title / WBS element description")
    duration: int = Field(..., ge=0, description="Task duration in days")
    predecessors: List[str] = Field(default_factory=list, description="List of predecessor task IDs")
    resource_demands: Dict[str, int] = Field(
        default_factory=dict,
        description="Daily resource requirements, e.g. {'labor': 8, 'crane': 1}"
    )
    cost_normal: Optional[float] = Field(default=None, description="Normal execution cost (INR)")
    cost_crash: Optional[float] = Field(default=None, description="Crashed execution cost (INR)")
    normal_cost: Optional[float] = Field(default=None, description="Normal cost alias")
    crash_cost: Optional[float] = Field(default=None, description="Crash cost alias")
    crash_duration: Optional[int] = Field(default=None, description="Minimum possible duration if crashed")


TaskInputItem = TaskItem


class CPMTaskOutput(BaseModel):
    id: str
    name: str
    duration: int
    es: int = Field(..., description="Early Start day")
    ef: int = Field(..., description="Early Finish day")
    ls: int = Field(..., description="Late Start day")
    lf: int = Field(..., description="Late Finish day")
    total_float: int = Field(..., description="Total Float in days")
    free_float: int = Field(..., description="Free Float in days")
    is_critical: bool = Field(..., description="True if Total Float is zero")
    predecessors: List[str]


class CPMResponse(BaseModel):
    project_makespan: int = Field(..., description="Unconstrained minimum project completion time in days")
    critical_path: List[str] = Field(..., description="Ordered list of task IDs on the critical path")
    tasks: List[CPMTaskOutput]
    adjacency_list: Dict[str, List[str]]


class GATaskOutput(BaseModel):
    id: str
    name: str
    duration: int
    start_day: int
    finish_day: int
    is_critical: bool
    resource_demands: Dict[str, int]
    predecessors: List[str]


class GAResponse(BaseModel):
    makespan: int = 0
    project_makespan: int = 0
    cpm_unconstrained_makespan: int = 0
    resource_delay_days: int = 0
    schedule: List[GATaskOutput] = Field(default_factory=list)
    scheduled_tasks: List[GATaskOutput] = Field(default_factory=list)
    daily_resource_usage: Dict[str, List[int]] = Field(default_factory=dict)
    resource_load_profile: Dict[str, List[int]] = Field(default_factory=dict)
    generation_history: List[int] = Field(default_factory=list)
    convergence_history: List[int] = Field(default_factory=list)
    execution_time_ms: float = 0.0
    runtime_ms: float = 0.0

    @model_validator(mode="before")
    @classmethod
    def sync_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Sync makespan and project_makespan
            ms = data.get("makespan") or data.get("project_makespan") or 0
            data["makespan"] = ms
            data["project_makespan"] = ms

            # Sync schedule and scheduled_tasks
            sched = data.get("schedule") or data.get("scheduled_tasks") or []
            data["schedule"] = sched
            data["scheduled_tasks"] = sched

            # Sync daily_resource_usage and resource_load_profile
            res = data.get("daily_resource_usage") or data.get("resource_load_profile") or {}
            data["daily_resource_usage"] = res
            data["resource_load_profile"] = res

            # Sync generation_history and convergence_history
            gen = data.get("generation_history") or data.get("convergence_history") or []
            data["generation_history"] = gen
            data["convergence_history"] = gen

            # Sync execution_time_ms and runtime_ms
            rt = data.get("execution_time_ms") or data.get("runtime_ms") or 0.0
            data["execution_time_ms"] = float(rt)
            data["runtime_ms"] = float(rt)
        return data


class ScheduleRequest(BaseModel):
    project_name: str = "Construction Project"
    tasks: List[TaskItem]
    resource_limits: Dict[str, int] = Field(
        default_factory=lambda: {"labor": 32, "crane": 1},
        description="Daily limits per resource type"
    )
    ga_population_size: int = 40
    ga_generations: int = 80
    ga_crossover_prob: float = 0.85
    ga_mutation_prob: float = 0.15
    random_seed: Optional[int] = 42


class CombinedScheduleResponse(BaseModel):
    status: str = "success"
    cpm: CPMResponse
    ga: GAResponse
    resource_limits: Dict[str, int]
