"""Pydantic request and response schemas for OptiBuild API."""

from __future__ import annotations

import datetime
from typing import Any, Optional
from pydantic import BaseModel, Field, ConfigDict


# ---------------------------------------------------------
# Activity Schemas
# ---------------------------------------------------------

class ActivityBase(BaseModel):
    activity_code: str = Field(..., description="Unique code within project", json_schema_extra={"example": "A1"})
    name: str = Field(..., description="Activity name", json_schema_extra={"example": "Excavation"})
    duration_days: int = Field(..., ge=1, json_schema_extra={"example": 10})
    crash_duration_days: int = Field(..., ge=1, json_schema_extra={"example": 7})
    normal_cost_inr: float = Field(default=0.0, ge=0.0, json_schema_extra={"example": 280000.0})
    crash_cost_inr: float = Field(default=0.0, ge=0.0, json_schema_extra={"example": 400000.0})
    predecessors: list[str] = Field(default_factory=list, json_schema_extra={"example": ["A0"]})
    resource_demands: dict[str, int] = Field(
        default_factory=dict,
        json_schema_extra={"example": {"laborers": 15, "masons": 0}}
    )


class ActivityCreate(ActivityBase):
    pass


class ActivityResponse(ActivityBase):
    id: int
    project_id: int

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------
# Project Schemas
# ---------------------------------------------------------

class ProjectBase(BaseModel):
    name: str = Field(..., json_schema_extra={"example": "Sunshine Residency (G+4)"})
    location: str = Field(default="Pune, Maharashtra", json_schema_extra={"example": "Pune, Maharashtra"})
    built_up_area_sqft: float = Field(default=25000.0, ge=0.0)
    total_floors: int = Field(default=5, ge=1)
    total_flats: int = Field(default=20, ge=1)
    amount_collected_inr: float = Field(default=50000000.0, ge=0.0, description="INR collected from buyers")
    contractual_deadline_days: int = Field(default=180, ge=0, description="Target completion timeline in days")
    sbi_mclr_rate: float = Field(default=8.85, ge=0.0, description="Current SBI 1-yr MCLR rate in %")
    resource_limits: dict[str, Any] = Field(
        default_factory=lambda: {
            "masons": {"max_available": 12, "daily_rate_inr": 900},
            "carpenters": {"max_available": 8, "daily_rate_inr": 850},
            "laborers": {"max_available": 20, "daily_rate_inr": 500},
            "crane_hours": {"max_available": 8, "daily_rate_inr": 3500},
        }
    )


class ProjectCreate(ProjectBase):
    activities: Optional[list[ActivityCreate]] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    built_up_area_sqft: Optional[float] = None
    total_floors: Optional[int] = None
    total_flats: Optional[int] = None
    amount_collected_inr: Optional[float] = None
    contractual_deadline_days: Optional[int] = None
    sbi_mclr_rate: Optional[float] = None
    resource_limits: Optional[dict[str, Any]] = None


class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime.datetime
    activities: list[ActivityResponse] = []

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------
# Optimization & Benchmark Schemas
# ---------------------------------------------------------

class OptimizeRequest(BaseModel):
    solver_mode: str = Field(default="BENCHMARK", json_schema_extra={"example": "BENCHMARK"})  # "CPM", "GA", "CPSAT", "BENCHMARK"
    ga_population: int = Field(default=50, ge=10, le=500)
    ga_generations: int = Field(default=80, ge=10, le=1000)
    cpsat_timeout_sec: float = Field(default=30.0, ge=1.0, le=300.0)


class CrashDetail(BaseModel):
    activity_id: str
    name: str
    cost_slope_inr_per_day: float
    max_crash_days: int
    applied_crash_days: int
    applied_crash_cost_inr: float


class PenaltyBreakdown(BaseModel):
    delay_days: int
    sbi_mclr_rate: float
    interest_rate_pct: float
    amount_collected_inr: float
    penalty_amount_inr: float
    total_crash_cost_inr: float
    days_recoverable: int
    recommendation: str
    savings_inr: float
    crash_breakdown: list[CrashDetail] = []


class OptimizeResponse(BaseModel):
    project_id: int
    project_name: str
    solver_mode: str
    unconstrained_cpm_makespan_days: int
    ga_makespan_days: int
    cpsat_makespan_days: int
    optimality_gap_pct: float
    final_makespan_days: int
    critical_path: list[str]
    penalty_analysis: Optional[PenaltyBreakdown] = None
    schedule: dict[str, Any]
    ga_runtime_seconds: float = 0.0
    cpsat_runtime_seconds: float = 0.0


# ---------------------------------------------------------
# Site Progress & Computer Vision Schemas
# ---------------------------------------------------------

class SiteProgressCreate(BaseModel):
    week_number: int = Field(..., ge=1)
    notes: Optional[str] = None
    user_override_phase: Optional[str] = None


class SiteProgressResponse(BaseModel):
    id: int
    project_id: int
    week_number: int
    phase_detected: str
    confidence: float
    user_override_phase: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------
# MahaRERA PDF Extraction Schemas
# ---------------------------------------------------------

class MahaRERAPdfExtractResponse(BaseModel):
    project_name: Optional[str] = None
    promoter_name: Optional[str] = None
    location: Optional[str] = None
    proposed_completion_date: Optional[str] = None
    total_floors: Optional[int] = None
    total_flats: Optional[int] = None
    built_up_area_sqft: Optional[float] = None
    raw_text_snippet: Optional[str] = None
    is_confirmed: bool = False
    message: str = "Extracted data ready for user review and confirmation before optimizer run."
