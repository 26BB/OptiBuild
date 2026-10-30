"""Unit tests for Resource-Constrained GA Scheduler."""

from pathlib import Path
import pytest
from app.engine.ga.ga_scheduler import GAScheduler


@pytest.fixture
def sample_data_path():
    return Path(__file__).resolve().parent.parent / "engine" / "data" / "sample_tasks.json"


def test_ga_initialization_and_run(sample_data_path):
    scheduler = GAScheduler(
        population_size=30,
        generations=20,
        random_seed=42,
    )
    scheduler.load_from_json(sample_data_path)
    result = scheduler.run()

    assert result.makespan > 0
    assert len(result.schedule) == 20
    assert len(result.fitness_history) > 0
    assert result.generations_run == 20

    # Ensure all activities are scheduled
    for aid, item in result.schedule.items():
        assert item["start"] >= 0
        assert item["finish"] > item["start"]
        assert item["duration"] > 0


def test_ga_precedence_feasibility(sample_data_path):
    scheduler = GAScheduler(
        population_size=20,
        generations=10,
        random_seed=42,
    )
    scheduler.load_from_json(sample_data_path)
    result = scheduler.run()

    sched = result.schedule
    # Check precedence: for every act, start >= finish of its predecessors
    for aid, item in sched.items():
        preds = scheduler._predecessors.get(aid, [])
        for pred in preds:
            assert sched[aid]["start"] >= sched[pred]["finish"]
