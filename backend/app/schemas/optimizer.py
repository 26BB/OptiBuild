from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class CrashableTaskItem(BaseModel):
    id: str = Field(..., description="Unique task identifier, e.g. 'T01'")
    name: str = Field(..., description="Task title")
    normal_duration: int = Field(..., ge=1, description="Standard duration in days")
    crash_duration: int = Field(..., ge=1, description="Minimum compressed duration in days")
    normal_cost: float = Field(..., ge=0, description="Cost under standard shift (INR)")
    crash_cost: float = Field(..., ge=0, description="Cost under 2-shift / expedited work (INR)")
    predecessors: List[str] = Field(default_factory=list)


class RERAPenaltyParams(BaseModel):
    total_allottee_investment: float = Field(
        ...,
        gt=0,
        description="Total money collected from home buyers across all sold units (INR)"
    )
    sbi_mclr_rate: float = Field(
        default=8.85,
        ge=1.0,
        le=25.0,
        description="Current State Bank of India MCLR rate (annual %)"
    )
    rera_spread: float = Field(
        default=2.00,
        ge=0.0,
        le=10.0,
        description="MahaRERA prescribed spread above MCLR (statutory default is 2%)"
    )
    delay_days: int = Field(
        ...,
        ge=0,
        description="Number of calendar days the project is behind contractual handover"
    )


class CrashAction(BaseModel):
    task_id: str
    task_name: str
    original_duration: int
    new_duration: int
    days_shortened: int
    cost_per_day: float
    total_additional_cost: float
    reason: str


class OptimizationResult(BaseModel):
    delay_days: int
    days_recovered: int
    effective_annual_rate: float
    rera_daily_penalty: float
    total_rera_penalty: float
    total_crash_cost: float
    net_savings: float
    recommendation: str  # "CRASH_SCHEDULE" or "ACCEPT_PENALTY"
    recommendation_title: str
    rationale: str
    crashing_actions: List[CrashAction]


class OptimizerEvaluateRequest(BaseModel):
    rera_params: RERAPenaltyParams
    tasks: List[CrashableTaskItem]
    target_recovery_days: Optional[int] = None
