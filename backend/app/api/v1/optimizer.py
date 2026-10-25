from fastapi import APIRouter, HTTPException, Depends
from backend.app.core.auth import get_current_user, require_roles
from backend.app.db.models import User
from backend.app.schemas.optimizer import (
    OptimizerEvaluateRequest,
    OptimizationResult,
)
from backend.app.engine.optimizer import DelayRecoveryOptimizer

router = APIRouter(prefix="/optimizer", tags=["Penalty vs Crash Cost Optimizer"])


@router.post("/evaluate", response_model=OptimizationResult)
def evaluate_delay_recovery(
    payload: OptimizerEvaluateRequest,
    current_user: User = Depends(require_roles("project_manager", "admin")),
):
    """
    Evaluates statutory MahaRERA delay penalty against schedule crashing costs.
    Recommends the lower-cost recovery option and details the exact crashing actions.
    Permitted for Project Managers and Admins.
    """
    try:
        result = DelayRecoveryOptimizer.evaluate(
            rera_params=payload.rera_params,
            tasks=payload.tasks,
            target_recovery_days=payload.target_recovery_days,
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Delay recovery optimization calculation failed: {str(e)}",
        )
