from collections import defaultdict, deque
from typing import Dict, List, Set, Tuple
from backend.app.schemas.schedule import TaskItem, CPMTaskOutput, CPMResponse


class CycleDetectedException(ValueError):
    """Raised when dependency graph contains circular dependencies."""
    pass


class InvalidDependencyException(ValueError):
    """Raised when a task references a non-existent predecessor."""
    pass


class CPMEngine:
    def __init__(self, tasks: List[TaskItem]):
        self.tasks = tasks
        self.task_map: Dict[str, TaskItem] = {t.id: t for t in tasks}
        self._validate_task_ids()
        self._validate_predecessors()
        self.successors: Dict[str, List[str]] = defaultdict(list)
        self.predecessors: Dict[str, List[str]] = defaultdict(list)
        self._build_graph()
        self.topological_order: List[str] = self._topological_sort()

    def _validate_task_ids(self) -> None:
        ids = [t.id for t in self.tasks]
        if len(ids) != len(set(ids)):
            duplicates = [id_ for id_ in ids if ids.count(id_) > 1]
            raise ValueError(f"Duplicate task IDs found: {set(duplicates)}")

    def _validate_predecessors(self) -> None:
        for task in self.tasks:
            for pred in task.predecessors:
                if pred not in self.task_map:
                    raise InvalidDependencyException(
                        f"Task '{task.id}' references undefined predecessor '{pred}'"
                    )
                if pred == task.id:
                    raise CycleDetectedException(
                        f"Task '{task.id}' cannot have itself as predecessor"
                    )

    def _build_graph(self) -> None:
        for task in self.tasks:
            self.predecessors[task.id] = list(task.predecessors)
            for pred in task.predecessors:
                self.successors[pred].append(task.id)

    def _topological_sort(self) -> List[str]:
        in_degree = {task.id: len(task.predecessors) for task in self.tasks}
        queue = deque([task_id for task_id, deg in in_degree.items() if deg == 0])
        order = []

        while queue:
            curr = queue.popleft()
            order.append(curr)
            for succ in self.successors[curr]:
                in_degree[succ] -= 1
                if in_degree[succ] == 0:
                    queue.append(succ)

        if len(order) != len(self.tasks):
            unresolved = [t.id for t in self.tasks if t.id not in order]
            raise CycleDetectedException(
                f"Cyclic dependency detected in project network among tasks: {unresolved}"
            )

        return order

    def compute(self) -> CPMResponse:
        if not self.tasks:
            return CPMResponse(
                project_makespan=0,
                critical_path=[],
                tasks=[],
                adjacency_list={}
            )

        # 1. Forward Pass
        es: Dict[str, int] = {}
        ef: Dict[str, int] = {}

        for task_id in self.topological_order:
            task = self.task_map[task_id]
            preds = self.predecessors[task_id]
            if not preds:
                es[task_id] = 0
            else:
                es[task_id] = max(ef[p] for p in preds)
            ef[task_id] = es[task_id] + task.duration

        makespan = max(ef.values()) if ef else 0

        # 2. Backward Pass
        ls: Dict[str, int] = {}
        lf: Dict[str, int] = {}

        for task_id in reversed(self.topological_order):
            task = self.task_map[task_id]
            succs = self.successors[task_id]
            if not succs:
                lf[task_id] = makespan
            else:
                lf[task_id] = min(ls[s] for s in succs)
            ls[task_id] = lf[task_id] - task.duration

        # 3. Float Calculations & Critical Path
        task_outputs: List[CPMTaskOutput] = []
        critical_tasks: Set[str] = set()

        for task in self.tasks:
            tid = task.id
            total_float = ls[tid] - es[tid]
            
            succs = self.successors[tid]
            if succs:
                free_float = min(es[s] for s in succs) - ef[tid]
            else:
                free_float = makespan - ef[tid]

            is_critical = (total_float == 0)
            if is_critical:
                critical_tasks.add(tid)

            task_outputs.append(CPMTaskOutput(
                id=tid,
                name=task.name,
                duration=task.duration,
                es=es[tid],
                ef=ef[tid],
                ls=ls[tid],
                lf=lf[tid],
                total_float=total_float,
                free_float=free_float,
                is_critical=is_critical,
                predecessors=self.predecessors[tid]
            ))

        # Trace ordered critical path
        critical_path = self._extract_critical_path(critical_tasks, es, ef)

        adjacency = {task.id: self.successors[task.id] for task in self.tasks}

        return CPMResponse(
            project_makespan=makespan,
            critical_path=critical_path,
            tasks=task_outputs,
            adjacency_list=adjacency
        )

    def _extract_critical_path(
        self,
        critical_tasks: Set[str],
        es: Dict[str, int],
        ef: Dict[str, int]
    ) -> List[str]:
        if not critical_tasks:
            return []

        # Find starting critical tasks
        start_nodes = [
            t for t in critical_tasks
            if not [p for p in self.predecessors[t] if p in critical_tasks]
        ]

        if not start_nodes:
            return sorted(list(critical_tasks), key=lambda t: es[t])

        # Pick path with earliest ES/EF progression
        best_path: List[str] = []
        
        def dfs(curr: str, path: List[str]):
            nonlocal best_path
            path.append(curr)
            critical_succs = [
                s for s in self.successors[curr]
                if s in critical_tasks and es[s] == ef[curr]
            ]
            if not critical_succs:
                if len(path) > len(best_path):
                    best_path = list(path)
            else:
                for s in critical_succs:
                    dfs(s, path)
            path.pop()

        for s in start_nodes:
            dfs(s, [])

        return best_path if best_path else sorted(list(critical_tasks), key=lambda t: es[t])
