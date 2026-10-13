import random
import time
from collections import defaultdict
from typing import Dict, List, Optional, Set, Tuple

from backend.app.engine.cpm import CPMEngine
from backend.app.schemas.schedule import (
    GATaskOutput,
    GAResponse,
    TaskItem,
)


class RCPSPGeneticAlgorithm:
    """
    Genetic Algorithm for Resource-Constrained Project Scheduling (RCPSP).
    Uses Activity List Chromosomes decoded via Serial Schedule Generation Scheme (Serial SGS),
    Precedence-Preserving Crossover (PPX), swap mutation, and elitism.
    """

    def __init__(
        self,
        tasks: List[TaskItem],
        resource_limits: Dict[str, int],
        population_size: int = 60,
        generations: int = 100,
        crossover_prob: float = 0.8,
        mutation_prob: float = 0.2,
        seed: Optional[int] = 42,
    ):
        self.tasks = tasks
        self.task_map: Dict[str, TaskItem] = {t.id: t for t in tasks}
        self.resource_limits = {k: max(0, v) for k, v in resource_limits.items()}
        self.population_size = max(10, population_size)
        self.generations = max(10, generations)
        self.crossover_prob = crossover_prob
        self.mutation_prob = mutation_prob
        self.rng = random.Random(seed)

        # Predecessor & Successor maps
        self.predecessors: Dict[str, Set[str]] = {t.id: set(t.predecessors) for t in tasks}
        self.successors: Dict[str, Set[str]] = defaultdict(set)
        for t in tasks:
            for p in t.predecessors:
                self.successors[p].add(t.id)

        # Transitive closure of successors for precedence-safe mutations
        self.all_descendants: Dict[str, Set[str]] = self._compute_transitive_descendants()

        # Unconstrained CPM baseline
        cpm_engine = CPMEngine(tasks)
        self.cpm_result = cpm_engine.compute()
        self.cpm_makespan = self.cpm_result.project_makespan

    def _compute_transitive_descendants(self) -> Dict[str, Set[str]]:
        descendants: Dict[str, Set[str]] = defaultdict(set)
        for tid in self.task_map:
            visited = set()
            stack = list(self.successors[tid])
            while stack:
                curr = stack.pop()
                if curr not in visited:
                    visited.add(curr)
                    stack.extend(self.successors[curr])
            descendants[tid] = visited
        return descendants

    def _generate_random_valid_chromosome(self) -> List[str]:
        """
        Generate a random precedence-feasible permutation of tasks using randomized Kahn's algorithm.
        """
        in_degrees = {t.id: len(self.predecessors[t.id]) for t in self.tasks}
        eligible = [tid for tid, deg in in_degrees.items() if deg == 0]
        chromosome: List[str] = []

        while eligible:
            # Pick randomly from eligible tasks
            idx = self.rng.randrange(len(eligible))
            chosen = eligible.pop(idx)
            chromosome.append(chosen)

            for succ in self.successors[chosen]:
                in_degrees[succ] -= 1
                if in_degrees[succ] == 0:
                    eligible.append(succ)

        return chromosome

    def serial_sgs(
        self, chromosome: List[str]
    ) -> Tuple[int, Dict[str, Tuple[int, int]], Dict[str, List[int]]]:
        """
        Serial Schedule Generation Scheme (Serial SGS).
        Decodes an activity list into a resource-feasible and precedence-feasible schedule.
        Returns:
            (makespan, {task_id: (start_day, finish_day)}, daily_resource_usage)
        """
        task_times: Dict[str, Tuple[int, int]] = {}
        daily_usage: Dict[str, List[int]] = {r: [] for r in self.resource_limits}

        for tid in chromosome:
            task = self.task_map[tid]
            duration = task.duration
            demands = {
                r: task.resource_demands.get(r, 0)
                for r in self.resource_limits
            }

            # Precedence constraint: task cannot start before all predecessors finish
            if not self.predecessors[tid]:
                t_pred = 0
            else:
                t_pred = max(task_times[p][1] for p in self.predecessors[tid])

            if duration == 0:
                # Milestone
                task_times[tid] = (t_pred, t_pred)
                continue

            # Find earliest day t >= t_pred where resource capacity is not exceeded for all d in [t, t + duration)
            t = t_pred
            while True:
                feasible = True
                for d in range(t, t + duration):
                    for r, limit in self.resource_limits.items():
                        req = demands[r]
                        if req > limit:
                            # Single task demand exceeds absolute capacity
                            # Still place it at earliest feasible point or fail soft
                            pass
                        current_used = daily_usage[r][d] if d < len(daily_usage[r]) else 0
                        if current_used + req > limit:
                            feasible = False
                            break
                    if not feasible:
                        break

                if feasible:
                    break
                t += 1

            start_day = t
            finish_day = t + duration
            task_times[tid] = (start_day, finish_day)

            # Record resource usage
            for r, req in demands.items():
                if req <= 0:
                    continue
                while len(daily_usage[r]) < finish_day:
                    daily_usage[r].append(0)
                for d in range(start_day, finish_day):
                    daily_usage[r][d] += req

        makespan = max((ft for _, ft in task_times.values()), default=0)
        return makespan, task_times, daily_usage

    def _ppx_crossover(self, parent1: List[str], parent2: List[str]) -> Tuple[List[str], List[str]]:
        """
        Precedence-Preserving Crossover (PPX).
        Maintains precedence feasibility for activity lists.
        """
        n = len(parent1)
        if n <= 1:
            return list(parent1), list(parent2)

        def make_child(p1: List[str], p2: List[str]) -> List[str]:
            child = []
            selected = set()
            l1, l2 = list(p1), list(p2)
            i1, i2 = 0, 0

            for _ in range(n):
                # Flip coin to pick from parent 1 or parent 2
                pick_from_p1 = self.rng.random() < 0.5

                if pick_from_p1:
                    while i1 < n and l1[i1] in selected:
                        i1 += 1
                    if i1 < n:
                        candidate = l1[i1]
                        i1 += 1
                    else:
                        while i2 < n and l2[i2] in selected:
                            i2 += 1
                        candidate = l2[i2]
                        i2 += 1
                else:
                    while i2 < n and l2[i2] in selected:
                        i2 += 1
                    if i2 < n:
                        candidate = l2[i2]
                        i2 += 1
                    else:
                        while i1 < n and l1[i1] in selected:
                            i1 += 1
                        candidate = l1[i1]
                        i1 += 1

                child.append(candidate)
                selected.add(candidate)

            return child

        child1 = make_child(parent1, parent2)
        child2 = make_child(parent2, parent1)
        return child1, child2

    def _mutate(self, chromosome: List[str]) -> List[str]:
        """
        Swap mutation that strictly respects precedence constraints.
        Only swaps adjacent tasks where neither is a descendant of the other.
        """
        mutated = list(chromosome)
        n = len(mutated)
        if n < 2:
            return mutated

        for i in range(n - 1):
            if self.rng.random() < self.mutation_prob:
                u, v = mutated[i], mutated[i + 1]
                # Can only swap if u is not an ancestor of v (i.e. v is not in descendants of u)
                if v not in self.all_descendants[u]:
                    mutated[i], mutated[i + 1] = mutated[i + 1], mutated[i]

        return mutated

    def _tournament_select(self, population: List[List[str]], fitnesses: List[int], k: int = 3) -> List[str]:
        """
        Tournament selection: picks k individuals, returns the one with lowest makespan.
        """
        candidates = self.rng.sample(range(len(population)), min(k, len(population)))
        best_idx = min(candidates, key=lambda idx: fitnesses[idx])
        return list(population[best_idx])

    def solve(self) -> GAResponse:
        t_start = time.perf_counter()

        if not self.tasks:
            return GAResponse(
                makespan=0,
                cpm_unconstrained_makespan=0,
                resource_delay_days=0,
                schedule=[],
                daily_resource_usage={},
                generation_history=[],
                execution_time_ms=0.0,
            )

        # 1. Initialize population
        population = [
            self._generate_random_valid_chromosome()
            for _ in range(self.population_size)
        ]

        # Evaluate initial population
        fitnesses = [self.serial_sgs(ind)[0] for ind in population]
        best_idx = min(range(len(fitnesses)), key=lambda i: fitnesses[i])
        best_makespan = fitnesses[best_idx]
        best_chromosome = list(population[best_idx])

        generation_history = [best_makespan]
        stagnant_generations = 0

        # 2. Main GA Evolution Loop
        for gen in range(self.generations):
            # Elitism: retain top 5% individuals
            elite_count = max(1, int(self.population_size * 0.05))
            sorted_indices = sorted(range(len(fitnesses)), key=lambda i: fitnesses[i])
            new_population = [list(population[i]) for i in sorted_indices[:elite_count]]

            # Breed new individuals
            while len(new_population) < self.population_size:
                p1 = self._tournament_select(population, fitnesses)
                p2 = self._tournament_select(population, fitnesses)

                if self.rng.random() < self.crossover_prob:
                    c1, c2 = self._ppx_crossover(p1, p2)
                else:
                    c1, c2 = list(p1), list(p2)

                c1 = self._mutate(c1)
                c2 = self._mutate(c2)

                new_population.append(c1)
                if len(new_population) < self.population_size:
                    new_population.append(c2)

            population = new_population
            fitnesses = [self.serial_sgs(ind)[0] for ind in population]

            gen_best_idx = min(range(len(fitnesses)), key=lambda i: fitnesses[i])
            gen_best_makespan = fitnesses[gen_best_idx]

            if gen_best_makespan < best_makespan:
                best_makespan = gen_best_makespan
                best_chromosome = list(population[gen_best_idx])
                stagnant_generations = 0
            else:
                stagnant_generations += 1

            generation_history.append(best_makespan)

            # Early stopping after 25 stagnant generations
            if stagnant_generations >= 25:
                break

        # Decode best chromosome to generate detailed schedule and resource charts
        best_ms, task_times, daily_usage = self.serial_sgs(best_chromosome)

        # Pad daily usage across the final makespan
        for r in daily_usage:
            while len(daily_usage[r]) < best_ms:
                daily_usage[r].append(0)

        # Build task outputs
        cpm_critical_set = set(self.cpm_result.critical_path)
        schedule_output: List[GATaskOutput] = []
        for task in self.tasks:
            s_day, f_day = task_times[task.id]
            schedule_output.append(
                GATaskOutput(
                    id=task.id,
                    name=task.name,
                    duration=task.duration,
                    start_day=s_day,
                    finish_day=f_day,
                    is_critical=(task.id in cpm_critical_set),
                    resource_demands=task.resource_demands,
                    predecessors=task.predecessors,
                )
            )

        schedule_output.sort(key=lambda t: t.start_day)

        t_end = time.perf_counter()
        execution_time_ms = round((t_end - t_start) * 1000, 2)

        return GAResponse(
            makespan=best_ms,
            cpm_unconstrained_makespan=self.cpm_makespan,
            resource_delay_days=max(0, best_ms - self.cpm_makespan),
            schedule=schedule_output,
            daily_resource_usage=daily_usage,
            generation_history=generation_history,
            execution_time_ms=execution_time_ms,
        )
