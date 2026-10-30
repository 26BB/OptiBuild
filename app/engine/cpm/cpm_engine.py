"""Critical Path Method (CPM) Engine using NetworkX DAG.

Mathematical Formulation (SPPU B.E. Project — OptiBuild):
    Activity network: Directed Acyclic Graph G = (V, E)
    where V = set of activities, E = precedence edges.

    Forward Pass:
        ES_i = max(EF_p) for all predecessors p of i
        EF_i = ES_i + duration_i

    Backward Pass:
        LF_i = min(LS_s) for all successors s of i
        LS_i = LF_i - duration_i

    Total Float:
        TF_i = LS_i - ES_i = LF_i - EF_i

    Critical Path:
        All activities where TF_i == 0.

References:
    Li, H., & Love, P. E. D. (1999). Time-cost trade-off via GA.
    Leu, S. S., & Yang, C. H. (1999). GA-based multicriteria scheduling.
"""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import networkx as nx

logger = logging.getLogger(__name__)


@dataclass
class ActivitySchedule:
    """Computed schedule data for a single activity."""
    activity_id: str
    name: str
    duration: int
    early_start: int = 0
    early_finish: int = 0
    late_start: int = 0
    late_finish: int = 0
    total_float: int = 0
    is_critical: bool = False


@dataclass
class CPMResult:
    """Complete CPM analysis result."""
    schedule: dict[str, ActivitySchedule] = field(default_factory=dict)
    critical_path: list[str] = field(default_factory=list)
    makespan: int = 0
    total_project_cost: float = 0.0

    def to_dict(self) -> dict[str, Any]:
        """Serialize to JSON-safe dict."""
        return {
            "makespan": self.makespan,
            "total_project_cost": self.total_project_cost,
            "critical_path": self.critical_path,
            "schedule": {
                aid: {
                    "activity_id": s.activity_id,
                    "name": s.name,
                    "duration": s.duration,
                    "early_start": s.early_start,
                    "early_finish": s.early_finish,
                    "late_start": s.late_start,
                    "late_finish": s.late_finish,
                    "total_float": s.total_float,
                    "is_critical": s.is_critical,
                }
                for aid, s in self.schedule.items()
            },
        }


class CPMEngine:
    """NetworkX-based Critical Path Method engine.

    Constructs a DAG from activity data, performs forward and backward
    passes, and identifies the critical path with float values.
    """

    def __init__(self) -> None:
        self.graph: nx.DiGraph = nx.DiGraph()
        self._activities: dict[str, dict[str, Any]] = {}

    # ------------------------------------------------------------------
    # Data Loading
    # ------------------------------------------------------------------

    def load_from_json(self, path: str | Path) -> None:
        """Load activities from a sample_tasks.json file.

        Args:
            path: Filesystem path to the JSON data file.

        Raises:
            FileNotFoundError: If the data file doesn't exist.
            json.JSONDecodeError: If the JSON is malformed.
            ValueError: If required fields are missing.
        """
        path = Path(path)
        if not path.exists():
            raise FileNotFoundError(f"Data file not found: {path}")

        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)

        activities = data.get("activities")
        if not activities:
            raise ValueError("No 'activities' key found in data file.")

        self.load_activities(activities)

    def load_activities(self, activities: list[dict[str, Any]]) -> None:
        """Load activity list into the DAG.

        Args:
            activities: List of activity dicts with keys:
                id, name, duration, predecessors, normal_cost.

        Raises:
            ValueError: If an activity is missing required fields or
                if predecessors reference non-existent activities.
        """
        required_fields = {"id", "name", "duration"}
        activity_ids = {a["id"] for a in activities}

        for act in activities:
            missing = required_fields - set(act.keys())
            if missing:
                raise ValueError(
                    f"Activity missing required fields {missing}: {act}"
                )

            aid = act["id"]
            for pred in act.get("predecessors", []):
                if pred not in activity_ids:
                    raise ValueError(
                        f"Activity {aid} references unknown predecessor: {pred}"
                    )

            self._activities[aid] = act
            self.graph.add_node(
                aid,
                name=act["name"],
                duration=int(act["duration"]),
                normal_cost=float(act.get("normal_cost", 0)),
                crash_cost=float(act.get("crash_cost", 0)),
                crash_duration=int(act.get("crash_duration", act["duration"])),
                resources=act.get("resources", {}),
            )

            for pred in act.get("predecessors", []):
                self.graph.add_edge(pred, aid)

        # Validate DAG
        if not nx.is_directed_acyclic_graph(self.graph):
            raise ValueError(
                "Activity network contains cycles — cannot compute CPM."
            )

        logger.info(
            "Loaded %d activities into CPM DAG with %d edges.",
            self.graph.number_of_nodes(),
            self.graph.number_of_edges(),
        )

    # ------------------------------------------------------------------
    # CPM Computation
    # ------------------------------------------------------------------

    def compute(self) -> CPMResult:
        """Run the full CPM analysis: forward pass, backward pass, floats.

        Returns:
            CPMResult with schedule, critical path, and makespan.

        Raises:
            RuntimeError: If no activities are loaded.
        """
        if not self.graph.nodes:
            raise RuntimeError("No activities loaded — call load_activities() first.")

        schedule: dict[str, ActivitySchedule] = {}

        # ---- Forward Pass (topological order) ----
        topo_order = list(nx.topological_sort(self.graph))
        logger.debug("Topological order: %s", topo_order)

        for aid in topo_order:
            duration = self.graph.nodes[aid]["duration"]
            predecessors = list(self.graph.predecessors(aid))

            if not predecessors:
                es = 0
            else:
                es = max(schedule[p].early_finish for p in predecessors)

            ef = es + duration

            schedule[aid] = ActivitySchedule(
                activity_id=aid,
                name=self.graph.nodes[aid]["name"],
                duration=duration,
                early_start=es,
                early_finish=ef,
            )

        # Project makespan = max EF across all terminal nodes
        makespan = max(s.early_finish for s in schedule.values())

        # ---- Backward Pass (reverse topological order) ----
        for aid in reversed(topo_order):
            successors = list(self.graph.successors(aid))

            if not successors:
                lf = makespan
            else:
                lf = min(schedule[s].late_start for s in successors)

            ls = lf - schedule[aid].duration

            schedule[aid].late_start = ls
            schedule[aid].late_finish = lf
            schedule[aid].total_float = ls - schedule[aid].early_start

        # ---- Identify Critical Path ----
        for s in schedule.values():
            s.is_critical = s.total_float == 0

        # Build critical path in topological order
        critical_path = [aid for aid in topo_order if schedule[aid].is_critical]

        # Total project cost
        total_cost = sum(
            self.graph.nodes[aid].get("normal_cost", 0) for aid in self.graph.nodes
        )

        result = CPMResult(
            schedule=schedule,
            critical_path=critical_path,
            makespan=makespan,
            total_project_cost=total_cost,
        )

        logger.info(
            "CPM complete — makespan=%d days, critical path=%s",
            makespan,
            critical_path,
        )

        return result

    def get_topological_order(self) -> list[str]:
        """Return activities in topological order (respecting precedence).

        Returns:
            List of activity IDs.
        """
        return list(nx.topological_sort(self.graph))

    def get_predecessors(self, activity_id: str) -> list[str]:
        """Get immediate predecessors of an activity."""
        return list(self.graph.predecessors(activity_id))

    def get_successors(self, activity_id: str) -> list[str]:
        """Get immediate successors of an activity."""
        return list(self.graph.successors(activity_id))


# ------------------------------------------------------------------
# Standalone execution
# ------------------------------------------------------------------
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    data_path = Path(__file__).parent.parent / "data" / "sample_tasks.json"
    engine = CPMEngine()
    engine.load_from_json(data_path)
    result = engine.compute()

    print(f"\nProject Makespan: {result.makespan} days")
    print(f"Total Project Cost: ₹{result.total_project_cost:,.0f}")
    print(f"Critical Path: {' → '.join(result.critical_path)}")
    print("\n--- Schedule ---")
    for aid, s in result.schedule.items():
        marker = " ★ CRITICAL" if s.is_critical else ""
        print(
            f"  {aid} ({s.name}): ES={s.early_start}, EF={s.early_finish}, "
            f"LS={s.late_start}, LF={s.late_finish}, TF={s.total_float}{marker}"
        )
