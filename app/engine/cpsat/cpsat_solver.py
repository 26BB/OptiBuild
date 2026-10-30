"""Google OR-Tools CP-SAT Exact Solver for Resource-Constrained Scheduling.

Mathematical Formulation (SPPU B.E. Project — OptiBuild):
    Variables:
        start_i, end_i  — integer variables for activity i
        interval_i      — IntervalVar(start_i, duration_i, end_i)

    Constraints:
        Precedence: end_pred <= start_succ for all (pred, succ) edges
        Resource:   AddCumulative(intervals_k, demands_k, capacity_k)
                    for each resource type k

    Objective:
        Minimize makespan = max(end_i) for all activities i

    This provides the optimal (exact) solution against which the GA
    heuristic is benchmarked to compute the optimality gap.

References:
    Google OR-Tools CP-SAT documentation.
    Hartmann, S. (1998). RCPSP benchmarking.
"""

from __future__ import annotations

import json
import logging
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from ortools.sat.python import cp_model

logger = logging.getLogger(__name__)


@dataclass
class CPSATResult:
    """Result from the CP-SAT exact solver."""
    makespan: int = 0
    schedule: dict[str, dict[str, Any]] = field(default_factory=dict)
    solve_time_seconds: float = 0.0
    status: str = "UNKNOWN"
    is_optimal: bool = False

    def to_dict(self) -> dict[str, Any]:
        return {
            "makespan": self.makespan,
            "solve_time_seconds": self.solve_time_seconds,
            "status": self.status,
            "is_optimal": self.is_optimal,
            "schedule": self.schedule,
        }


class CPSATSolver:
    """OR-Tools CP-SAT solver for resource-constrained project scheduling.

    Creates interval variables for each activity, adds precedence and
    cumulative resource constraints, and minimizes the project makespan.
    """

    def __init__(self, time_limit_seconds: float = 60.0) -> None:
        self.time_limit = time_limit_seconds
        self._activities: list[dict[str, Any]] = []
        self._activity_map: dict[str, dict[str, Any]] = {}
        self._resource_limits: dict[str, int] = {}

    def load_from_json(self, path: str | Path) -> None:
        """Load activities and resource limits from JSON file."""
        path = Path(path)
        if not path.exists():
            raise FileNotFoundError(f"Data file not found: {path}")

        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)

        resources = data.get("resources", {})
        self._resource_limits = {
            k: v["max_available"] for k, v in resources.items()
        }
        self.load_activities(data["activities"])

    def load_activities(
        self,
        activities: list[dict[str, Any]],
        resource_limits: dict[str, int] | None = None,
    ) -> None:
        """Load activities for the solver.

        Args:
            activities: List of activity dicts.
            resource_limits: Max available units per resource type.
        """
        if resource_limits:
            self._resource_limits = resource_limits

        self._activities = activities
        self._activity_map = {a["id"]: a for a in activities}

        logger.info(
            "CP-SAT Solver loaded %d activities, %d resource types.",
            len(activities),
            len(self._resource_limits),
        )

    def solve(self) -> CPSATResult:
        """Run the CP-SAT solver.

        Returns:
            CPSATResult with optimal schedule, makespan, and solve time.

        Raises:
            RuntimeError: If no activities are loaded.
        """
        if not self._activities:
            raise RuntimeError("No activities loaded — call load_activities() first.")

        model = cp_model.CpModel()

        # Compute a reasonable horizon (sum of all durations as upper bound)
        horizon = sum(int(a["duration"]) for a in self._activities)

        # ---- Decision Variables ----
        starts: dict[str, Any] = {}
        ends: dict[str, Any] = {}
        intervals: dict[str, Any] = {}

        for act in self._activities:
            aid = act["id"]
            duration = int(act["duration"])

            start_var = model.NewIntVar(0, horizon, f"start_{aid}")
            end_var = model.NewIntVar(0, horizon, f"end_{aid}")
            interval_var = model.NewIntervalVar(
                start_var, duration, end_var, f"interval_{aid}"
            )

            starts[aid] = start_var
            ends[aid] = end_var
            intervals[aid] = interval_var

        # ---- Precedence Constraints ----
        for act in self._activities:
            aid = act["id"]
            for pred_id in act.get("predecessors", []):
                if pred_id not in ends:
                    raise ValueError(
                        f"Activity {aid} references unknown predecessor: {pred_id}"
                    )
                model.Add(starts[aid] >= ends[pred_id])

        # ---- Resource (Cumulative) Constraints ----
        for resource_type, capacity in self._resource_limits.items():
            res_intervals: list = []
            res_demands: list = []

            for act in self._activities:
                aid = act["id"]
                demand = act.get("resources", {}).get(resource_type, 0)
                if demand > 0:
                    res_intervals.append(intervals[aid])
                    res_demands.append(demand)

            if res_intervals:
                model.AddCumulative(res_intervals, res_demands, capacity)
                logger.debug(
                    "Added cumulative constraint for '%s': %d activities, capacity=%d",
                    resource_type,
                    len(res_intervals),
                    capacity,
                )

        # ---- Objective: Minimize Makespan ----
        makespan_var = model.NewIntVar(0, horizon, "makespan")
        model.AddMaxEquality(makespan_var, list(ends.values()))
        model.Minimize(makespan_var)

        # ---- Solve ----
        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = self.time_limit

        logger.info(
            "Starting CP-SAT solve (time limit=%.0fs, horizon=%d)...",
            self.time_limit,
            horizon,
        )

        start_time = time.perf_counter()
        status = solver.Solve(model)
        solve_time = time.perf_counter() - start_time

        status_name = {
            cp_model.OPTIMAL: "OPTIMAL",
            cp_model.FEASIBLE: "FEASIBLE",
            cp_model.INFEASIBLE: "INFEASIBLE",
            cp_model.MODEL_INVALID: "MODEL_INVALID",
            cp_model.UNKNOWN: "UNKNOWN",
        }.get(status, "UNKNOWN")

        result = CPSATResult(
            solve_time_seconds=round(solve_time, 4),
            status=status_name,
        )

        if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            result.makespan = solver.Value(makespan_var)
            result.is_optimal = status == cp_model.OPTIMAL

            for act in self._activities:
                aid = act["id"]
                result.schedule[aid] = {
                    "activity_id": aid,
                    "name": act["name"],
                    "start": solver.Value(starts[aid]),
                    "finish": solver.Value(ends[aid]),
                    "duration": int(act["duration"]),
                }

            logger.info(
                "CP-SAT solved — status=%s, makespan=%d days, time=%.3fs",
                status_name,
                result.makespan,
                solve_time,
            )
        else:
            logger.warning("CP-SAT solver status: %s", status_name)

        return result
