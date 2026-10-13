from typing import Dict, List, Optional
from pydantic import BaseModel, Field


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
    crash_duration: Optional[int] = Field(default=None, description="Minimum possible duration if crashed")


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
    makespan: int = Field(..., description="Resource-constrained makespan in days")
    cpm_unconstrained_makespan: int = Field(..., description="CPM benchmark without resource limits")
    resource_delay_days: int = Field(..., description="Delay caused purely by resource constraints")
    schedule: List[GATaskOutput]
    daily_resource_usage: Dict[str, List[int]]
    generation_history: List[int]
    execution_time_ms: float


class ScheduleRequest(BaseModel):
    project_name: str = "OptiBuild Construction Schedule"
    tasks: List[TaskItem]
    resource_limits: Dict[str, int] = Field(
        default_factory=dict,
        description="Daily capacity limits for renewable resources, e.g. {'labor': 25, 'crane': 1}"
    )
    ga_population_size: int = Field(default=60, ge=10, le=300)
    ga_generations: int = Field(default=100, ge=10, le=500)
    ga_crossover_prob: float = Field(default=0.8, ge=0.1, le=1.0)
    ga_mutation_prob: float = Field(default=0.2, ge=0.0, le=1.0)
    random_seed: Optional[int] = Field(default=42)


class CombinedScheduleResponse(BaseModel):
    project_name: str
    cpm: CPMResponse
    ga: GAResponse
    status: str = "success"
