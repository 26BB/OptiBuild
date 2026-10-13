import pytest
from starlette.testclient import TestClient
from backend.app.schemas.schedule import TaskItem
from backend.app.engine.benchmark import (
    CPSATRCPSPSolver,
    BenchmarkEngine,
    BENCHMARK_PRESETS,
)
from backend.app.main import app

client = TestClient(app)


def test_cpsat_solver_finds_optimal():
    """Verify OR-Tools CP-SAT finds an optimal solution for the small benchmark."""
    preset = BENCHMARK_PRESETS["small_substructure"]
    solver = CPSATRCPSPSolver(
        tasks=preset["tasks"],
        resource_limits=preset["resource_limits"],
        time_limit_seconds=5.0,
    )
    result = solver.solve()

    assert result.status == "OPTIMAL"
    assert result.makespan_days > 0
    assert result.runtime_ms > 0
    assert len(result.schedule) == len(preset["tasks"])


def test_cpsat_solution_feasibility_invariants():
    """Verify that CP-SAT schedule respects both precedence and resource limits."""
    preset = BENCHMARK_PRESETS["small_substructure"]
    tasks = preset["tasks"]
    limits = preset["resource_limits"]

    solver = CPSATRCPSPSolver(tasks=tasks, resource_limits=limits, time_limit_seconds=5.0)
    res = solver.solve()
    sched = res.schedule

    # 1. Precedence invariant: start(succ) >= finish(pred)
    for task in tasks:
        t_start = sched[task.id]["start"]
        for pred_id in task.predecessors:
            p_finish = sched[pred_id]["finish"]
            assert t_start >= p_finish, (
                f"CP-SAT precedence violation: {task.id} starts at {t_start} before {pred_id} finishes at {p_finish}"
            )

    # 2. Cumulative resource limit invariant on every day
    makespan = res.makespan_days
    for r_name, max_cap in limits.items():
        daily_usage = [0] * makespan
        for task in tasks:
            dem = task.resource_demands.get(r_name, 0)
            if dem > 0:
                s = sched[task.id]["start"]
                f = sched[task.id]["finish"]
                for day in range(s, f):
                    daily_usage[day] += dem

        for d, used in enumerate(daily_usage):
            assert used <= max_cap, f"CP-SAT resource violation on day {d} for {r_name}: {used} > {max_cap}"


def test_benchmark_engine_comparison():
    """Verify GA vs CP-SAT comparison runs and generates valid markdown table and JSON metrics."""
    preset = BENCHMARK_PRESETS["small_substructure"]
    comparison = BenchmarkEngine.run_benchmark(
        benchmark_name=preset["name"],
        tasks=preset["tasks"],
        resource_limits=preset["resource_limits"],
        cpsat_time_limit=3.0,
        ga_population=30,
        ga_generations=40,
        random_seed=42,
    )

    # Check metrics
    assert comparison.task_count == 8
    assert comparison.ga_metrics.makespan_days >= comparison.cpsat_metrics.makespan_days
    assert comparison.optimality_gap_percent >= 0.0
    assert comparison.cpsat_is_optimal is True

    # Check markdown table
    assert "| Metric | Genetic Algorithm (Serial SGS) | OR-Tools CP-SAT (Exact) |" in comparison.markdown_table
    assert str(comparison.ga_metrics.makespan_days) in comparison.markdown_table
    assert str(comparison.cpsat_metrics.makespan_days) in comparison.markdown_table


def test_benchmark_api_endpoints():
    """Verify HTTP API endpoints for benchmark presets and run."""
    # Presets endpoint
    resp_presets = client.get("/api/v1/benchmark/presets")
    assert resp_presets.status_code == 200
    presets_data = resp_presets.json()
    assert "small_substructure" in presets_data
    assert "medium_superstructure" in presets_data

    # Run benchmark endpoint
    run_payload = {
        "benchmark_name": "API Test Run",
        "cpsat_time_limit_seconds": 2.0,
        "ga_population_size": 20,
        "ga_generations": 20,
    }
    resp_run = client.post("/api/v1/benchmark/run", json=run_payload)
    assert resp_run.status_code == 200
    run_data = resp_run.json()
    assert run_data["ga_metrics"]["makespan_days"] > 0
    assert run_data["cpsat_metrics"]["makespan_days"] > 0
    assert "markdown_table" in run_data
    assert len(run_data["markdown_table"]) > 50
