"""Optimization & Benchmark endpoints — The Hero Module REST interface."""

from __future__ import annotations

import logging
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.backend.database import get_db
from app.backend.models import ProjectModel, ActivityModel, OptimizationResultModel
from app.backend.schemas import OptimizeRequest, OptimizeResponse, PenaltyBreakdown, CrashDetail
from app.engine.cpm.cpm_engine import CPMEngine
from app.engine.ga.ga_scheduler import GAScheduler
from app.engine.cpsat.cpsat_solver import CPSATSolver
from app.engine.penalty.penalty_engine import PenaltyEngine
from app.engine.benchmark.benchmark_runner import BenchmarkRunner

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/optimize", tags=["Optimization Engine"])


def _format_db_activities(activities: list[ActivityModel]) -> list[dict[str, Any]]:
    """Convert DB Activity models to standard engine input dicts."""
    return [
        {
            "id": a.activity_code,
            "name": a.name,
            "duration": a.duration_days,
            "crash_duration": a.crash_duration_days,
            "normal_cost": a.normal_cost_inr,
            "crash_cost": a.crash_cost_inr,
            "predecessors": a.predecessors or [],
            "resources": a.resource_demands or {},
        }
        for a in activities
    ]


@router.post("/{project_id}", response_model=OptimizeResponse)
def run_optimization(
    project_id: int,
    payload: OptimizeRequest = OptimizeRequest(),
    db: Session = Depends(get_db),
):
    """Trigger schedule optimization and MahaRERA Section 18 statutory advisory."""
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project {project_id} not found",
        )

    activities_db = db.query(ActivityModel).filter(ActivityModel.project_id == project_id).all()
    if not activities_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project has no activities to schedule. Add activities or load sample tasks first.",
        )

    engine_activities = _format_db_activities(activities_db)
    resource_limits = {
        k: (v["max_available"] if isinstance(v, dict) else int(v))
        for k, v in (project.resource_limits or {}).items()
    }

    try:
        # Default to full Benchmark mode (GA + CP-SAT + CPM + Penalty)
        runner = BenchmarkRunner(
            ga_population=payload.ga_population,
            ga_generations=payload.ga_generations,
            cpsat_timeout_sec=payload.cpsat_timeout_sec,
        )

        report = runner.run_benchmark(
            activities=engine_activities,
            resources=project.resource_limits or {},
            project_name=project.name,
            amount_collected=project.amount_collected_inr,
            contractual_deadline_days=project.contractual_deadline_days,
            sbi_mclr_rate=project.sbi_mclr_rate,
        )

        # Parse penalty details for response
        penalty_resp = None
        delay_days = 0
        penalty_amt = 0.0
        crash_cost_total = 0.0
        recom = "ON_SCHEDULE"
        savings_val = 0.0
        crash_breakdown_raw = []

        if report.penalty_analysis:
            p = report.penalty_analysis
            delay_days = p.get("delay_days", 0)
            penalty_amt = p.get("penalty_amount_inr", 0.0)
            crash_cost_total = p.get("total_crash_cost_inr", 0.0)
            recom = p.get("recommendation", "ON_SCHEDULE")
            savings_val = p.get("savings_inr", 0.0)
            crash_breakdown_raw = p.get("crash_breakdown", [])

            penalty_resp = PenaltyBreakdown(
                delay_days=delay_days,
                sbi_mclr_rate=p.get("sbi_mclr_rate", project.sbi_mclr_rate),
                interest_rate_pct=p.get("interest_rate_pct", project.sbi_mclr_rate + 2.0),
                amount_collected_inr=p.get("amount_collected_inr", project.amount_collected_inr),
                penalty_amount_inr=penalty_amt,
                total_crash_cost_inr=crash_cost_total,
                days_recoverable=p.get("days_recoverable", 0),
                recommendation=recom,
                savings_inr=savings_val,
                crash_breakdown=[
                    CrashDetail(
                        activity_id=cb["activity_id"],
                        name=cb["name"],
                        cost_slope_inr_per_day=cb["cost_slope_inr_per_day"],
                        max_crash_days=cb["max_crash_days"],
                        applied_crash_days=cb["applied_crash_days"],
                        applied_crash_cost_inr=cb["applied_crash_cost_inr"],
                    )
                    for cb in crash_breakdown_raw
                ],
            )

        final_makespan = (
            report.cpsat_makespan
            if report.cpsat_makespan > 0 and report.cpsat_makespan <= report.ga_makespan
            else report.ga_makespan
        )

        # Persist optimization result
        opt_record = OptimizationResultModel(
            project_id=project.id,
            solver_mode=payload.solver_mode,
            unconstrained_cpm_makespan=report.unconstrained_cpm_makespan,
            ga_makespan=report.ga_makespan,
            cpsat_makespan=report.cpsat_makespan,
            optimality_gap_pct=report.optimality_gap_pct,
            final_makespan_days=final_makespan,
            delay_days=delay_days,
            penalty_amount_inr=penalty_amt,
            total_crash_cost_inr=crash_cost_total,
            recommendation=recom,
            savings_inr=savings_val,
            schedule_json=report.best_schedule,
            crash_breakdown_json=crash_breakdown_raw,
        )
        db.add(opt_record)
        db.commit()

        return OptimizeResponse(
            project_id=project.id,
            project_name=project.name,
            solver_mode=payload.solver_mode,
            unconstrained_cpm_makespan_days=report.unconstrained_cpm_makespan,
            ga_makespan_days=report.ga_makespan,
            cpsat_makespan_days=report.cpsat_makespan,
            optimality_gap_pct=report.optimality_gap_pct,
            final_makespan_days=final_makespan,
            critical_path=report.critical_path,
            penalty_analysis=penalty_resp,
            schedule=report.best_schedule,
            ga_runtime_seconds=report.ga_runtime_seconds,
            cpsat_runtime_seconds=report.cpsat_runtime_seconds,
        )

    except Exception as e:
        logger.exception("Optimization failure: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Optimization engine error: {str(e)}",
        )


@router.get("/{project_id}/latest")
def get_latest_optimization(project_id: int, db: Session = Depends(get_db)):
    """Retrieve the most recent optimization result for a project."""
    res = (
        db.query(OptimizationResultModel)
        .filter(OptimizationResultModel.project_id == project_id)
        .order_by(OptimizationResultModel.created_at.desc())
        .first()
    )
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No optimization results found for this project",
        )

    return {
        "id": res.id,
        "project_id": res.project_id,
        "solver_mode": res.solver_mode,
        "unconstrained_cpm_makespan": res.unconstrained_cpm_makespan,
        "ga_makespan": res.ga_makespan,
        "cpsat_makespan": res.cpsat_makespan,
        "optimality_gap_pct": res.optimality_gap_pct,
        "final_makespan_days": res.final_makespan_days,
        "delay_days": res.delay_days,
        "penalty_amount_inr": res.penalty_amount_inr,
        "total_crash_cost_inr": res.total_crash_cost_inr,
        "recommendation": res.recommendation,
        "savings_inr": res.savings_inr,
        "schedule": res.schedule_json,
        "crash_breakdown": res.crash_breakdown_json,
        "created_at": res.created_at.isoformat(),
    }
