from fastapi import APIRouter, HTTPException
from backend.app.schemas.optimizer import (
    OptimizerEvaluateRequest,
    OptimizationResult,
    CrashableTaskItem,
    RERAPenaltyParams,
)
from backend.app.engine.optimizer import DelayRecoveryOptimizer

router = APIRouter(prefix="/optimizer", tags=["Penalty vs Crash Cost Optimizer"])


@router.post("/evaluate", response_model=OptimizationResult)
def evaluate_delay_recovery(payload: OptimizerEvaluateRequest):
    """
    Evaluates statutory MahaRERA delay penalty against schedule crashing costs.
    Recommends the lower-cost recovery option and details the exact crashing actions.
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
