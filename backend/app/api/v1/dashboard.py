from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.schemas.dashboard import DashboardResponse
from backend.app.engine.recalibrate import CrashCostRecalibrator
from backend.app.core.auth import get_current_user, require_roles
from backend.app.db.session import get_db
from backend.app.db.models import User, Project, MaterialLogModel, TaskModel

router = APIRouter(prefix="/dashboard", tags=["Budget vs Actual Analytics"])


@router.get("/budget-vs-actual", response_model=DashboardResponse)
def get_budget_vs_actual_dashboard(
    project_id: Optional[str] = Query(None, description="Project ID to evaluate Budget vs Actual"),
    current_user: User = Depends(require_roles("accountant", "owner", "admin", "project_manager")),
    db: Session = Depends(get_db),
):
    """
    Returns comprehensive Budget vs Actual metrics, cumulative S-Curve spend series,
    package-level cost variance, and recalibrated crash costs based on real database records.
    """
    project: Optional[Project] = None
    if project_id:
        project = db.query(Project).filter(Project.id == project_id).first()
    else:
        project = db.query(Project).order_by(Project.created_at.desc()).first()

    if not project:
        # Return empty state if no projects exist in the database
        return CrashCostRecalibrator.get_dashboard_metrics(
            project_name="No Active Project",
            total_planned=0.0,
            wbs_categories=[],
            material_logs=[],
            tasks=[],
        )

    # Fetch materials and tasks for project
    material_logs = (
        db.query(MaterialLogModel)
        .filter(MaterialLogModel.project_id == project.id)
        .all()
    )
    material_dicts = [
        {
            "material_category": m.material_category,
            "unit_rate": m.unit_rate,
            "total_amount": m.total_amount,
            "wbs_code": m.wbs_code,
        }
        for m in material_logs
    ]

    tasks = db.query(TaskModel).filter(TaskModel.project_id == project.id).all()
    task_dicts = [
        {
            "id": t.id,
            "name": t.name,
            "duration": t.duration,
            "crash_duration": t.crash_duration,
            "normal_cost": t.normal_cost,
            "crash_cost": t.crash_cost,
            "is_critical": t.is_critical,
        }
        for t in tasks
    ]

    wbs_cats = []
    total_planned = project.total_project_cost or 0.0
    if project.wbs_data and "categories" in project.wbs_data:
        wbs_cats = project.wbs_data["categories"]
        if "total_estimated_cost" in project.wbs_data:
            total_planned = float(project.wbs_data["total_estimated_cost"])

    return CrashCostRecalibrator.get_dashboard_metrics(
        project_name=project.name,
        total_planned=total_planned,
        wbs_categories=wbs_cats,
        material_logs=material_dicts,
        tasks=task_dicts,
    )


@router.post("/recalibrate-crash-costs")
def trigger_crash_cost_recalibration(
    project_id: Optional[str] = Query(None),
    current_user: User = Depends(require_roles("accountant", "project_manager", "admin")),
    db: Session = Depends(get_db),
):
    """
    Recalibrates critical path task crash-cost slopes based on latest material log unit rates.
    """
    project: Optional[Project] = None
    if project_id:
        project = db.query(Project).filter(Project.id == project_id).first()
    else:
        project = db.query(Project).order_by(Project.created_at.desc()).first()

    material_logs = []
    tasks = []
    if project:
        material_logs = [
            {"material_category": m.material_category, "unit_rate": m.unit_rate}
            for m in db.query(MaterialLogModel).filter(MaterialLogModel.project_id == project.id).all()
        ]
        tasks = [
            {
                "id": t.id,
                "name": t.name,
                "duration": t.duration,
                "crash_duration": t.crash_duration,
                "normal_cost": t.normal_cost,
                "crash_cost": t.crash_cost,
                "is_critical": t.is_critical,
            }
            for t in db.query(TaskModel).filter(TaskModel.project_id == project.id).all()
        ]

    recalibrated = CrashCostRecalibrator.recalibrate_tasks(
        tasks=tasks if tasks else None,
        material_logs=material_logs if material_logs else None,
    )
    variance_factors = CrashCostRecalibrator.compute_material_variance_factors(
        material_logs if material_logs else None
    )

    return {
        "status": "RECALIBRATED",
        "material_inflation_factors": variance_factors,
        "recalibrated_tasks": recalibrated,
        "message": "Crash-cost slopes updated based on actual site material invoices.",
    }
