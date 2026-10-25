from fastapi import APIRouter, HTTPException, Depends
from backend.app.core.auth import get_current_user, require_roles
from backend.app.db.models import User
from backend.app.schemas.wbs import (
    BuildingParametersInput,
    ParametricWbsResponse,
)
from backend.app.engine.wbs_generator import (
    WBSGenerator,
    STANDARD_WBS_TEMPLATE,
)

router = APIRouter(prefix="/wbs", tags=["Parametric WBS & Cost Estimation"])


@router.get("/default-ratios")
def get_default_ratios(current_user: User = Depends(get_current_user)):
    """
    Returns the standard ratio and rate distribution table.
    """
    return {"template": STANDARD_WBS_TEMPLATE}


@router.post("/generate", response_model=ParametricWbsResponse)
def generate_wbs(
    payload: BuildingParametersInput,
    current_user: User = Depends(require_roles("project_manager", "admin")),
):
    """
    Generates a parametric Work Breakdown Structure (WBS), itemized costs,
    and DAG tasks from building parameters (built-up area, floors, rate/sqft).
    Permitted for Project Managers and Admins.
    """
    try:
        return WBSGenerator.generate(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"WBS generation failed: {str(e)}")
