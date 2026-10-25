from fastapi import APIRouter, HTTPException, Depends
from backend.app.core.auth import get_current_user, require_roles
from backend.app.db.models import User
from backend.app.schemas.schedule import (
    ScheduleRequest,
    CombinedScheduleResponse,
    CPMResponse,
)
from backend.app.engine.cpm import CPMEngine, CycleDetectedException, InvalidDependencyException
from backend.app.engine.ga import RCPSPGeneticAlgorithm

router = APIRouter(prefix="/schedule", tags=["Schedule Optimization"])


@router.post("/cpm", response_model=CPMResponse)
def compute_cpm(
    payload: ScheduleRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Computes unconstrained Critical Path Method (CPM) timeline, float values, and critical path.
    """
    try:
        engine = CPMEngine(payload.tasks)
        return engine.compute()
    except CycleDetectedException as e:
        raise HTTPException(status_code=400, detail=f"Circular dependency error: {str(e)}")
    except InvalidDependencyException as e:
        raise HTTPException(status_code=400, detail=f"Invalid dependency: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CPM engine failure: {str(e)}")


@router.post("/optimize", response_model=CombinedScheduleResponse)
def compute_optimized_schedule(
    payload: ScheduleRequest,
    current_user: User = Depends(require_roles("project_manager", "admin")),
):
    """
    Computes both unconstrained CPM and resource-constrained GA schedule.
    Returns side-by-side analysis, Gantt timeline, and daily resource load profiles.
    Permitted for Project Managers and Admins.
    """
    try:
        # 1. Unconstrained CPM baseline
        cpm_engine = CPMEngine(payload.tasks)
        cpm_result = cpm_engine.compute()

        # 2. Resource-Constrained Project Scheduling via Genetic Algorithm
        ga_engine = RCPSPGeneticAlgorithm(
            tasks=payload.tasks,
            resource_limits=payload.resource_limits,
            population_size=payload.ga_population_size,
            generations=payload.ga_generations,
            crossover_prob=payload.ga_crossover_prob,
            mutation_prob=payload.ga_mutation_prob,
            seed=payload.random_seed,
        )
        ga_result = ga_engine.solve()

        return CombinedScheduleResponse(
            cpm=cpm_result,
            ga=ga_result,
            resource_limits=payload.resource_limits,
        )
    except CycleDetectedException as e:
        raise HTTPException(status_code=400, detail=f"Circular dependency: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")
