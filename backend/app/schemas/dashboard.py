from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class BudgetVsActualCategory(BaseModel):
    category_name: str
    planned_budget: float
    actual_spent: float
    variance: float = Field(..., description="planned_budget - actual_spent")
    percentage_utilized: float


class MonthlySpendDataPoint(BaseModel):
    month: str  # e.g. "M01", "M02", ...
    planned_monthly: float
    actual_monthly: float
    planned_cumulative: float
    actual_cumulative: float


class CrashCostRecalibrationItem(BaseModel):
    task_id: str
    task_name: str
    baseline_crash_slope: float
    recalibrated_crash_slope: float
    material_factor_applied: float
    change_percent: float


class DashboardResponse(BaseModel):
    project_name: str
    total_planned_budget: float
    total_actual_spent: float
    total_variance: float
    is_over_budget: bool
    budget_utilization_percent: float
    categories: List[BudgetVsActualCategory]
    s_curve_data: List[MonthlySpendDataPoint]
    recalibration_available: bool
    recalibrated_tasks: List[CrashCostRecalibrationItem]
