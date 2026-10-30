"""Benchmark Runner: GA vs CP-SAT Optimality Gap Analysis.

Academic & Practical Role (OptiBuild SPPU BE Project):
    - Evaluates the metaheuristic Genetic Algorithm (DEAP) against the
      exact Constraint Programming solver (Google OR-Tools CP-SAT).
    - Computes the Optimality Gap:
        Gap (%) = ((Makespan_GA - Makespan_CPSAT) / Makespan_CPSAT) * 100
    - Compares execution latency (seconds) and memory trade-offs.
"""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from app.engine.cpm.cpm_engine import CPMEngine, CPMResult
from app.engine.cpsat.cpsat_solver import CPSATResult, CPSATSolver
from app.engine.ga.ga_scheduler import GAResult, GAScheduler
from app.engine.penalty.penalty_engine import PenaltyEngine, PenaltyResult

logger = logging.getLogger(__name__)


@dataclass
class BenchmarkReport:
    """Consolidated benchmark and optimization report."""
    project_name: str = ""
    activity_count: int = 0
    unconstrained_cpm_makespan: int = 0
    ga_makespan: int = 0
    cpsat_makespan: int = 0
    optimality_gap_pct: float = 0.0
    ga_runtime_seconds: float = 0.0
    cpsat_runtime_seconds: float = 0.0
    cpsat_optimal: bool = False
    critical_path: list[str] = field(default_factory=list)
    penalty_analysis: dict[str, Any] | None = None
    best_schedule: dict[str, dict[str, Any]] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return {
            "project_name": self.project_name,
            "activity_count": self.activity_count,
            "unconstrained_cpm_makespan_days": self.unconstrained_cpm_makespan,
            "ga_makespan_days": self.ga_makespan,
            "cpsat_makespan_days": self.cpsat_makespan,
            "optimality_gap_pct": round(self.optimality_gap_pct, 2),
            "ga_runtime_seconds": round(self.ga_runtime_seconds, 4),
            "cpsat_runtime_seconds": round(self.cpsat_runtime_seconds, 4),
            "cpsat_optimal": self.cpsat_optimal,
            "critical_path": self.critical_path,
            "penalty_analysis": self.penalty_analysis,
            "best_schedule": self.best_schedule,
        }


class BenchmarkRunner:
    """Runs comparative benchmarks across CPM, GA, and CP-SAT solvers."""

    def __init__(
        self,
        ga_population: int = 60,
        ga_generations: int = 100,
        cpsat_timeout_sec: float = 30.0,
    ) -> None:
        self.ga_population = ga_population
        self.ga_generations = ga_generations
        self.cpsat_timeout_sec = cpsat_timeout_sec

    def run_benchmark(
        self,
        activities: list[dict[str, Any]],
        resources: dict[str, Any],
        project_name: str = "OptiBuild Construction Project",
        amount_collected: float = 0.0,
        contractual_deadline_days: int = 0,
        sbi_mclr_rate: float = 8.85,
    ) -> BenchmarkReport:
        """Execute full pipeline: CPM -> GA -> CP-SAT -> Penalty advisory."""
        if not activities:
            raise ValueError("No activities provided for benchmark.")

        resource_limits = {
            k: (v["max_available"] if isinstance(v, dict) else int(v))
            for k, v in resources.items()
        }

        # 1. CPM Unconstrained Pass
        cpm = CPMEngine()
        cpm.load_activities(activities)
        cpm_result = cpm.compute()

        # 2. Heuristic GA Scheduler
        ga = GAScheduler(
            population_size=self.ga_population,
            generations=self.ga_generations,
            random_seed=42,
        )
        ga.load_activities(activities, resource_limits)

        t_ga_start = time.perf_counter()
        ga_result = ga.run()
        ga_time = time.perf_counter() - t_ga_start

        # 3. Exact Solver (OR-Tools CP-SAT)
        cpsat = CPSATSolver(time_limit_seconds=self.cpsat_timeout_sec)
        cpsat.load_activities(activities, resource_limits)

        t_cpsat_start = time.perf_counter()
        cpsat_result = cpsat.solve()
        cpsat_time = time.perf_counter() - t_cpsat_start

        # 4. Compute Optimality Gap
        # Optimality gap compares GA makespan with CP-SAT baseline
        if cpsat_result.makespan > 0:
            gap = (
                (ga_result.makespan - cpsat_result.makespan)
                / float(cpsat_result.makespan)
            ) * 100.0
        else:
            gap = 0.0

        # Best feasible schedule: Prefer CP-SAT if optimal/feasible, else GA
        if cpsat_result.makespan > 0 and cpsat_result.makespan <= ga_result.makespan:
            final_schedule = cpsat_result.schedule
            final_makespan = cpsat_result.makespan
        else:
            final_schedule = ga_result.schedule
            final_makespan = ga_result.makespan

        # 5. Penalty vs Crash Analysis (if contractual deadline given)
        penalty_dict = None
        if contractual_deadline_days > 0 and amount_collected > 0:
            delay_days = max(0, final_makespan - contractual_deadline_days)
            penalty_eng = PenaltyEngine(
                sbi_mclr_rate=sbi_mclr_rate,
                amount_collected=amount_collected,
                contractual_deadline_days=contractual_deadline_days,
            )
            # Filter critical activities for crashing options
            crit_acts = [
                a for a in activities if a["id"] in cpm_result.critical_path
            ]
            penalty_res = penalty_eng.compute_optimal_crashing(
                critical_activities=crit_acts,
                delay_days=delay_days,
            )
            penalty_dict = penalty_res.to_dict()

        report = BenchmarkReport(
            project_name=project_name,
            activity_count=len(activities),
            unconstrained_cpm_makespan=cpm_result.makespan,
            ga_makespan=ga_result.makespan,
            cpsat_makespan=cpsat_result.makespan,
            optimality_gap_pct=gap,
            ga_runtime_seconds=ga_time,
            cpsat_runtime_seconds=cpsat_time,
            cpsat_optimal=cpsat_result.is_optimal,
            critical_path=cpm_result.critical_path,
            penalty_analysis=penalty_dict,
            best_schedule=final_schedule,
        )

        logger.info(
            "Benchmark Complete: CPM=%dd, GA=%dd (%.3fs), CP-SAT=%dd (%.3fs), Gap=%.2f%%",
            cpm_result.makespan,
            ga_result.makespan,
            ga_time,
            cpsat_result.makespan,
            cpsat_time,
            gap,
        )

        return report
