from fastapi import APIRouter, HTTPException
from backend.app.schemas.schedule import (
    ScheduleRequest,
    CombinedScheduleResponse,
    CPMResponse,
    GAResponse,
)
from backend.app.engine.cpm import CPMEngine, CycleDetectedException, InvalidDependencyException
from backend.app.engine.ga import RCPSPGeneticAlgorithm

router = APIRouter(prefix="/schedule", tags=["Schedule Optimization"])


@router.post("/cpm", response_model=CPMResponse)
def compute_cpm(payload: ScheduleRequest):
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
def compute_optimized_schedule(payload: ScheduleRequest):
    """
    Computes both unconstrained CPM and resource-constrained GA schedule.
    Returns side-by-side analysis, Gantt timeline, and daily resource load profiles.
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
            project_name=payload.project_name,
            cpm=cpm_result,
            ga=ga_result,
            status="success",
        )
    except CycleDetectedException as e:
        raise HTTPException(status_code=400, detail=f"Circular dependency error: {str(e)}")
    except InvalidDependencyException as e:
        raise HTTPException(status_code=400, detail=f"Invalid dependency: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization engine failure: {str(e)}")
