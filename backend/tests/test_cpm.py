import pytest
from backend.app.schemas.schedule import TaskItem
from backend.app.engine.cpm import (
    CPMEngine,
    CycleDetectedException,
    InvalidDependencyException,
)


def test_standard_construction_network():
    """
    Validates a standard 6-activity construction sequence:
    T1: Soil Excavation (duration: 5, preds: [])
    T2: Foundation PCC & RCC (duration: 10, preds: [T1])
    T3: RCC Frame & Columns (duration: 15, preds: [T2])
    T4: Underground Plumbing (duration: 4, preds: [T2])
    T5: Masonry & Brickwork (duration: 8, preds: [T3])
    T6: Internal Plaster & Finishing (duration: 7, preds: [T4, T5])
    """
    tasks = [
        TaskItem(id="T1", name="Soil Excavation", duration=5, predecessors=[]),
        TaskItem(id="T2", name="Foundation PCC & RCC", duration=10, predecessors=["T1"]),
        TaskItem(id="T3", name="RCC Frame & Columns", duration=15, predecessors=["T2"]),
        TaskItem(id="T4", name="Underground Plumbing", duration=4, predecessors=["T2"]),
        TaskItem(id="T5", name="Masonry & Brickwork", duration=8, predecessors=["T3"]),
        TaskItem(id="T6", name="Internal Plaster & Finishing", duration=7, predecessors=["T4", "T5"]),
    ]

    engine = CPMEngine(tasks)
    result = engine.compute()

    # Calculations:
    # T1: ES=0, EF=5, LS=0, LF=5, TF=0 (Critical)
    # T2: ES=5, EF=15, LS=5, LF=15, TF=0 (Critical)
    # T3: ES=15, EF=30, LS=15, LF=30, TF=0 (Critical)
    # T4: ES=15, EF=19, LS=31-4=27, LF=31, TF=12 (Non-critical, float=12)
    # T5: ES=30, EF=38, LS=30, LF=38, TF=0 (Critical)
    # T6: ES=38, EF=45, LS=38, LF=45, TF=0 (Critical)
    # Total makespan = 45 days.

    assert result.project_makespan == 45
    assert result.critical_path == ["T1", "T2", "T3", "T5", "T6"]

    task_dict = {t.id: t for t in result.tasks}

    # T1 checks
    assert task_dict["T1"].es == 0
    assert task_dict["T1"].ef == 5
    assert task_dict["T1"].total_float == 0
    assert task_dict["T1"].is_critical is True

    # T4 non-critical checks (LF=38, LS=34, TF=19, FF=19)
    assert task_dict["T4"].es == 15
    assert task_dict["T4"].ef == 19
    assert task_dict["T4"].ls == 34
    assert task_dict["T4"].lf == 38
    assert task_dict["T4"].total_float == 19
    assert task_dict["T4"].free_float == 19
    assert task_dict["T4"].is_critical is False

    # T6 end milestone check
    assert task_dict["T6"].es == 38
    assert task_dict["T6"].ef == 45
    assert task_dict["T6"].total_float == 0
    assert task_dict["T6"].is_critical is True


def test_cycle_detection_raises_error():
    """Circular graph A -> B -> C -> A must be caught and raise CycleDetectedException."""
    tasks = [
        TaskItem(id="A", name="Task A", duration=3, predecessors=["C"]),
        TaskItem(id="B", name="Task B", duration=4, predecessors=["A"]),
        TaskItem(id="C", name="Task C", duration=2, predecessors=["B"]),
    ]

    with pytest.raises(CycleDetectedException):
        CPMEngine(tasks)


def test_self_dependency_raises_error():
    """Task depending on itself must raise CycleDetectedException."""
    tasks = [
        TaskItem(id="A", name="Task A", duration=3, predecessors=["A"]),
    ]
    with pytest.raises(CycleDetectedException):
        CPMEngine(tasks)


def test_invalid_predecessor_raises_error():
    """Reference to non-existent predecessor must raise InvalidDependencyException."""
    tasks = [
        TaskItem(id="A", name="Task A", duration=3, predecessors=["NonExistent"]),
    ]
    with pytest.raises(InvalidDependencyException):
        CPMEngine(tasks)


def test_zero_duration_milestone():
    """Milestones with 0 duration should correctly propagate timeline without crashing."""
    tasks = [
        TaskItem(id="M0", name="Project Kickoff", duration=0, predecessors=[]),
        TaskItem(id="T1", name="Site Clearance", duration=5, predecessors=["M0"]),
        TaskItem(id="M1", name="Phase 1 Complete", duration=0, predecessors=["T1"]),
    ]

    engine = CPMEngine(tasks)
    res = engine.compute()

    assert res.project_makespan == 5
    assert res.critical_path == ["M0", "T1", "M1"]
    task_dict = {t.id: t for t in res.tasks}
    assert task_dict["M0"].es == 0 and task_dict["M0"].ef == 0
    assert task_dict["M1"].es == 5 and task_dict["M1"].ef == 5


def test_parallel_independent_tasks():
    """Independent parallel tasks: longest path determines project makespan."""
    tasks = [
        TaskItem(id="A", name="Branch 1", duration=20, predecessors=[]),
        TaskItem(id="B", name="Branch 2", duration=12, predecessors=[]),
    ]
    engine = CPMEngine(tasks)
    res = engine.compute()

    assert res.project_makespan == 20
    task_dict = {t.id: t for t in res.tasks}
    assert task_dict["A"].is_critical is True
    assert task_dict["B"].is_critical is False
    assert task_dict["B"].total_float == 8
