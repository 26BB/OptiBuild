import pytest
from backend.app.schemas.schedule import TaskItem
from backend.app.engine.ga import RCPSPGeneticAlgorithm
from backend.app.engine.cpm import CPMEngine


def test_ga_resource_bottleneck_serialization():
    """
    Two independent tasks A and B, both require 1 crane for 6 days.
    - If crane capacity = 2: they run in parallel -> makespan = 6 days.
    - If crane capacity = 1: they must be serialized -> makespan = 12 days.
    """
    tasks = [
        TaskItem(id="A", name="Lift Heavy Beams Section 1", duration=6, predecessors=[], resource_demands={"crane": 1}),
        TaskItem(id="B", name="Lift Heavy Beams Section 2", duration=6, predecessors=[], resource_demands={"crane": 1}),
    ]

    # Capacity = 2
    ga_parallel = RCPSPGeneticAlgorithm(
        tasks=tasks,
        resource_limits={"crane": 2},
        population_size=20,
        generations=20,
        seed=101,
    )
    res_parallel = ga_parallel.solve()
    assert res_parallel.makespan == 6
    assert res_parallel.resource_delay_days == 0

    # Bottleneck Capacity = 1
    ga_serial = RCPSPGeneticAlgorithm(
        tasks=tasks,
        resource_limits={"crane": 1},
        population_size=20,
        generations=20,
        seed=101,
    )
    res_serial = ga_serial.solve()
    assert res_serial.makespan == 12
    assert res_serial.resource_delay_days == 6


def test_ga_abundant_resources_matches_cpm():
    """
    When resource capacity is strictly greater than total peak demand,
    GA makespan must equal unconstrained CPM makespan.
    """
    tasks = [
        TaskItem(id="T1", name="Foundation", duration=8, predecessors=[], resource_demands={"labor": 10}),
        TaskItem(id="T2", name="Plumbing Rough-in", duration=6, predecessors=["T1"], resource_demands={"labor": 6}),
        TaskItem(id="T3", name="Electrical Conduits", duration=5, predecessors=["T1"], resource_demands={"labor": 4}),
        TaskItem(id="T4", name="Slab Casting", duration=7, predecessors=["T2", "T3"], resource_demands={"labor": 15}),
    ]

    cpm = CPMEngine(tasks).compute()
    expected_cpm_makespan = cpm.project_makespan  # 8 + max(6, 5) + 7 = 8 + 6 + 7 = 21 days

    # Abundant labor (e.g. 50 workers)
    ga = RCPSPGeneticAlgorithm(
        tasks=tasks,
        resource_limits={"labor": 50},
        population_size=30,
        generations=30,
        seed=42,
    )
    ga_res = ga.solve()

    assert ga_res.makespan == expected_cpm_makespan == 21
    assert ga_res.resource_delay_days == 0


def test_ga_precedence_invariance():
    """
    Verify that in the GA schedule, every single task starts only AFTER
    all of its predecessors have finished.
    """
    tasks = [
        TaskItem(id="T1", name="A", duration=4, predecessors=[], resource_demands={"labor": 5}),
        TaskItem(id="T2", name="B", duration=5, predecessors=["T1"], resource_demands={"labor": 8}),
        TaskItem(id="T3", name="C", duration=3, predecessors=["T1"], resource_demands={"labor": 4}),
        TaskItem(id="T4", name="D", duration=6, predecessors=["T2", "T3"], resource_demands={"labor": 6}),
        TaskItem(id="T5", name="E", duration=2, predecessors=["T4"], resource_demands={"labor": 3}),
    ]

    ga = RCPSPGeneticAlgorithm(
        tasks=tasks,
        resource_limits={"labor": 10},
        population_size=30,
        generations=30,
        seed=77,
    )
    res = ga.solve()
    sched = {t.id: t for t in res.schedule}

    for task in tasks:
        t_out = sched[task.id]
        for pred_id in task.predecessors:
            pred_out = sched[pred_id]
            assert t_out.start_day >= pred_out.finish_day, (
                f"Precedence violation: {task.id} starts at {t_out.start_day} "
                f"before predecessor {pred_id} finishes at {pred_out.finish_day}"
            )


def test_ga_resource_capacity_invariance():
    """
    Verify that on every single day, the sum of resources consumed by active tasks
    never exceeds the specified resource limit.
    """
    tasks = [
        TaskItem(id="T1", name="Excavation", duration=4, predecessors=[], resource_demands={"labor": 10, "crane": 1}),
        TaskItem(id="T2", name="Footings", duration=5, predecessors=[], resource_demands={"labor": 12, "crane": 1}),
        TaskItem(id="T3", name="Drainage", duration=3, predecessors=[], resource_demands={"labor": 8, "crane": 0}),
    ]
    limits = {"labor": 15, "crane": 1}

    ga = RCPSPGeneticAlgorithm(
        tasks=tasks,
        resource_limits=limits,
        population_size=40,
        generations=30,
        seed=123,
    )
    res = ga.solve()

    for r_name, max_limit in limits.items():
        usage_by_day = res.daily_resource_usage.get(r_name, [])
        for day_idx, daily_load in enumerate(usage_by_day):
            assert daily_load <= max_limit, (
                f"Resource overload on day {day_idx} for '{r_name}': {daily_load} > {max_limit}"
            )
