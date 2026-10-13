from fastapi import APIRouter
from backend.app.schemas.dashboard import DashboardResponse
from backend.app.engine.recalibrate import CrashCostRecalibrator

router = APIRouter(prefix="/dashboard", tags=["Budget vs Actual Analytics"])


@router.get("/budget-vs-actual", response_model=DashboardResponse)
def get_budget_vs_actual_dashboard():
    """
    Returns comprehensive Budget vs Actual metrics, cumulative S-Curve spend series,
    package-level cost variance, and recalibrated crash costs based on real material purchase rates.
    """
    return CrashCostRecalibrator.get_dashboard_metrics()


@router.post("/recalibrate-crash-costs")
def trigger_crash_cost_recalibration():
    """
    Recalibrates critical path task crash-cost slopes based on latest material log unit rates.
    """
    recalibrated = CrashCostRecalibrator.recalibrate_tasks()
    variance_factors = CrashCostRecalibrator.compute_material_variance_factors()
    return {
        "status": "RECALIBRATED",
        "material_inflation_factors": variance_factors,
        "recalibrated_tasks": recalibrated,
        "message": "Crash-cost slopes updated based on actual site material invoices.",
    }
