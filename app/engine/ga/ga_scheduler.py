"""Resource-Constrained Genetic Algorithm Scheduler using DEAP.

Mathematical Formulation (SPPU B.E. Project — OptiBuild):
    Chromosome: Permutation of activities respecting precedence
                (topological ordering / activity-list representation).

    Serial Schedule Generation Scheme (SSGS):
        Decode chromosome to a feasible schedule by scheduling activities
        in chromosome order, at the earliest time that satisfies both
        precedence and resource constraints.

    Resource Constraint:
        For each time unit t and resource type k:
        Σ R_{i,k} for all active activities i at time t ≤ R_{k,max}

    Fitness Function (minimization):
        Z = makespan (total project duration under resource constraints)

    GA Operators:
        - Selection: Tournament (k=3)
        - Crossover: Order Crossover (OX) — preserves topological validity
        - Mutation: Swap mutation with precedence repair

    Parameters:
        population=100, generations=200, cx_prob=0.8, mut_prob=0.2

References:
    Hartmann, S. (1998). Competitive GA for RCPSP. Naval Research Logistics.
    Leu & Yang (1999). GA-based multicriteria scheduling.
"""

from __future__ import annotations

import json
import logging
import random
from copy import deepcopy
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import numpy as np
from deap import algorithms, base, creator, tools

logger = logging.getLogger(__name__)


@dataclass
class GAResult:
    """Result of GA scheduling optimization."""
    makespan: int = 0
    schedule: dict[str, dict[str, Any]] = field(default_factory=dict)
    fitness_history: list[float] = field(default_factory=list)
    best_chromosome: list[str] = field(default_factory=list)
    generations_run: int = 0

    def to_dict(self) -> dict[str, Any]:
        return {
            "makespan": self.makespan,
            "generations_run": self.generations_run,
            "fitness_history": self.fitness_history,
            "best_chromosome": self.best_chromosome,
            "schedule": self.schedule,
        }


class GAScheduler:
    """DEAP-based resource-constrained project scheduler.

    Uses a permutation-based chromosome with Serial Schedule Generation
    Scheme (SSGS) to decode into feasible resource-constrained schedules.
    """

    def __init__(
        self,
        population_size: int = 100,
        generations: int = 200,
        cx_prob: float = 0.8,
        mut_prob: float = 0.2,
        tournament_size: int = 3,
        random_seed: int | None = 42,
    ) -> None:
        self.population_size = population_size
        self.generations = generations
        self.cx_prob = cx_prob
        self.mut_prob = mut_prob
        self.tournament_size = tournament_size
        self.random_seed = random_seed

        self._activities: list[dict[str, Any]] = []
        self._activity_map: dict[str, dict[str, Any]] = {}
        self._predecessors: dict[str, list[str]] = {}
        self._resource_limits: dict[str, int] = {}
        self._topo_order: list[str] = []

    # ------------------------------------------------------------------
    # Data Loading
    # ------------------------------------------------------------------

    def load_from_json(self, path: str | Path) -> None:
        """Load activities and resources from sample_tasks.json."""
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
        """Load activity list and compute topological ordering.

        Args:
            activities: List of activity dicts.
            resource_limits: Max available units per resource type.
        """
        if resource_limits:
            self._resource_limits = resource_limits

        self._activities = activities
        self._activity_map = {a["id"]: a for a in activities}
        self._predecessors = {
            a["id"]: a.get("predecessors", []) for a in activities
        }

        # Compute topological order via Kahn's algorithm
        self._topo_order = self._topological_sort()

        logger.info(
            "GA Scheduler loaded %d activities, %d resource types.",
            len(activities),
            len(self._resource_limits),
        )

    def _topological_sort(self) -> list[str]:
        """Kahn's algorithm for topological sorting."""
        in_degree: dict[str, int] = {a["id"]: 0 for a in self._activities}
        adj: dict[str, list[str]] = {a["id"]: [] for a in self._activities}

        for a in self._activities:
            for pred in a.get("predecessors", []):
                adj[pred].append(a["id"])
                in_degree[a["id"]] += 1

        queue = [aid for aid, deg in in_degree.items() if deg == 0]
        result: list[str] = []

        while queue:
            queue.sort()  # deterministic ordering
            node = queue.pop(0)
            result.append(node)
            for succ in adj[node]:
                in_degree[succ] -= 1
                if in_degree[succ] == 0:
                    queue.append(succ)

        if len(result) != len(self._activities):
            raise ValueError("Cycle detected in activity precedences.")

        return result

    # ------------------------------------------------------------------
    # SSGS Decoder
    # ------------------------------------------------------------------

    def _decode_ssgs(
        self, chromosome: list[str]
    ) -> tuple[int, dict[str, dict[str, Any]]]:
        """Serial Schedule Generation Scheme.

        Schedules activities in chromosome order at the earliest feasible
        time respecting both precedence and resource constraints.

        Args:
            chromosome: Permutation of activity IDs (must be precedence-feasible).

        Returns:
            (makespan, schedule_dict) where schedule_dict maps activity_id
            to {start, finish, duration}.
        """
        schedule: dict[str, dict[str, Any]] = {}
        # Resource usage timeline: resource_usage[t][resource_type] = units_used
        resource_usage: dict[int, dict[str, int]] = {}

        def get_usage(t: int, resource: str) -> int:
            return resource_usage.get(t, {}).get(resource, 0)

        def add_usage(t: int, resource: str, amount: int) -> None:
            if t not in resource_usage:
                resource_usage[t] = {}
            resource_usage[t][resource] = resource_usage[t].get(resource, 0) + amount

        for aid in chromosome:
            act = self._activity_map[aid]
            duration = int(act["duration"])
            resources = act.get("resources", {})

            # Earliest start from precedence
            es = 0
            for pred in self._predecessors.get(aid, []):
                if pred in schedule:
                    es = max(es, schedule[pred]["finish"])

            # Find earliest feasible start considering resources
            start = es
            while True:
                feasible = True
                for t in range(start, start + duration):
                    for res_type, res_amount in resources.items():
                        if res_amount <= 0:
                            continue
                        limit = self._resource_limits.get(res_type, float("inf"))
                        if get_usage(t, res_type) + res_amount > limit:
                            feasible = False
                            break
                    if not feasible:
                        break

                if feasible:
                    break
                start += 1

                # Safety: prevent infinite loop (shouldn't happen with valid data)
                if start > 10000:
                    logger.error("SSGS failed to find feasible start for %s", aid)
                    break

            # Commit to schedule
            finish = start + duration
            schedule[aid] = {
                "activity_id": aid,
                "name": act["name"],
                "start": start,
                "finish": finish,
                "duration": duration,
            }

            # Update resource usage
            for t in range(start, finish):
                for res_type, res_amount in resources.items():
                    if res_amount > 0:
                        add_usage(t, res_type, res_amount)

        makespan = max(s["finish"] for s in schedule.values()) if schedule else 0
        return makespan, schedule

    # ------------------------------------------------------------------
    # Chromosome Operators
    # ------------------------------------------------------------------

    def _generate_individual(self) -> list[str]:
        """Generate a random precedence-feasible permutation.

        Uses a randomized topological sort: at each step, randomly pick
        from activities whose predecessors are all already scheduled.
        """
        scheduled: set[str] = set()
        remaining = set(a["id"] for a in self._activities)
        individual: list[str] = []

        while remaining:
            eligible = [
                aid for aid in remaining
                if all(p in scheduled for p in self._predecessors.get(aid, []))
            ]

            if not eligible:
                raise RuntimeError(
                    "No eligible activities — possible cycle in predecessors."
                )

            chosen = random.choice(eligible)
            individual.append(chosen)
            scheduled.add(chosen)
            remaining.remove(chosen)

        return individual

    def _repair_precedence(self, individual: list[str]) -> list[str]:
        """Repair a permutation to ensure precedence feasibility.

        Re-sorts the individual so that every activity appears after
        all its predecessors. Uses a stable insertion approach.
        """
        position = {aid: i for i, aid in enumerate(individual)}
        repaired = list(individual)
        changed = True

        max_iterations = len(individual) * len(individual)
        iteration = 0

        while changed and iteration < max_iterations:
            changed = False
            iteration += 1
            position = {aid: i for i, aid in enumerate(repaired)}

            for aid in repaired:
                for pred in self._predecessors.get(aid, []):
                    if position[pred] > position[aid]:
                        # Move pred before aid
                        repaired.remove(pred)
                        idx = repaired.index(aid)
                        repaired.insert(idx, pred)
                        changed = True
                        break
                if changed:
                    break

        return repaired

    def _ordered_crossover(
        self, ind1: list[str], ind2: list[str]
    ) -> tuple[list[str], list[str]]:
        """Order Crossover (OX) for permutation chromosomes."""
        size = len(ind1)
        if size < 3:
            return ind1[:], ind2[:]

        cx1, cx2 = sorted(random.sample(range(size), 2))

        def ox(parent1: list[str], parent2: list[str]) -> list[str]:
            child = [None] * size
            child[cx1:cx2] = parent1[cx1:cx2]
            fill_values = [v for v in parent2 if v not in child[cx1:cx2]]
            idx = 0
            for i in range(size):
                if child[i] is None:
                    child[i] = fill_values[idx]
                    idx += 1
            return child

        child1 = ox(ind1, ind2)
        child2 = ox(ind2, ind1)

        return (
            self._repair_precedence(child1),
            self._repair_precedence(child2),
        )

    def _swap_mutation(self, individual: list[str]) -> list[str]:
        """Swap two random positions and repair precedence."""
        if len(individual) < 2:
            return individual

        idx1, idx2 = random.sample(range(len(individual)), 2)
        individual[idx1], individual[idx2] = individual[idx2], individual[idx1]
        return self._repair_precedence(individual)

    # ------------------------------------------------------------------
    # GA Execution
    # ------------------------------------------------------------------

    def run(self) -> GAResult:
        """Execute the Genetic Algorithm optimization.

        Returns:
            GAResult with best schedule, fitness history, and convergence data.

        Raises:
            RuntimeError: If no activities are loaded.
        """
        if not self._activities:
            raise RuntimeError("No activities loaded — call load_activities() first.")

        if self.random_seed is not None:
            random.seed(self.random_seed)
            np.random.seed(self.random_seed)

        # ---- DEAP Setup (Idempotent) ----
        if not hasattr(creator, "FitnessMin"):
            creator.create("FitnessMin", base.Fitness, weights=(-1.0,))
        if not hasattr(creator, "Individual"):
            creator.create("Individual", list, fitness=creator.FitnessMin)

        toolbox = base.Toolbox()

        def init_individual():
            return creator.Individual(self._generate_individual())

        toolbox.register("individual", init_individual)
        toolbox.register(
            "population", tools.initRepeat, list, toolbox.individual
        )

        def evaluate(individual: list[str]) -> tuple[float]:
            makespan, _ = self._decode_ssgs(individual)
            return (float(makespan),)

        def cx_wrapper(ind1, ind2):
            c1, c2 = self._ordered_crossover(list(ind1), list(ind2))
            ind1[:] = c1
            ind2[:] = c2
            return ind1, ind2

        def mut_wrapper(individual):
            mutated = self._swap_mutation(list(individual))
            individual[:] = mutated
            return (individual,)

        toolbox.register("evaluate", evaluate)
        toolbox.register("select", tools.selTournament, tournsize=self.tournament_size)
        toolbox.register("mate", cx_wrapper)
        toolbox.register("mutate", mut_wrapper)

        # ---- Run GA ----
        population = toolbox.population(n=self.population_size)
        halloffame = tools.HallOfFame(1)
        stats = tools.Statistics(lambda ind: ind.fitness.values)
        stats.register("min", np.min)
        stats.register("avg", np.mean)

        logger.info(
            "Starting GA: pop=%d, gens=%d, cx=%.2f, mut=%.2f",
            self.population_size,
            self.generations,
            self.cx_prob,
            self.mut_prob,
        )

        population, logbook = algorithms.eaSimple(
            population,
            toolbox,
            cxpb=self.cx_prob,
            mutpb=self.mut_prob,
            ngen=self.generations,
            stats=stats,
            halloffame=halloffame,
            verbose=False,
        )

        # ---- Extract Results ----
        best_individual = halloffame[0]
        best_makespan, best_schedule = self._decode_ssgs(best_individual)

        fitness_history = [
            record["min"] for record in logbook
            if "min" in record
        ]

        result = GAResult(
            makespan=best_makespan,
            schedule=best_schedule,
            fitness_history=[float(f) for f in fitness_history],
            best_chromosome=list(best_individual),
            generations_run=self.generations,
        )

        logger.info("GA complete — best makespan=%d days", best_makespan)

        return result


# ------------------------------------------------------------------
# Standalone execution
# ------------------------------------------------------------------
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    data_path = Path(__file__).parent.parent / "data" / "sample_tasks.json"
    scheduler = GAScheduler(
        population_size=50,
        generations=100,
        random_seed=42,
    )
    scheduler.load_from_json(data_path)
    result = scheduler.run()

    print(f"\nBest Makespan: {result.makespan} days")
    print(f"Generations: {result.generations_run}")
    print(f"Fitness improvement: {result.fitness_history[0]:.0f} → {result.fitness_history[-1]:.0f}")
    print("\n--- Schedule ---")
    for aid, s in sorted(result.schedule.items(), key=lambda x: x[1]["start"]):
        print(f"  {aid} ({s['name']}): Day {s['start']} → Day {s['finish']}")
