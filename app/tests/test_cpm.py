"""Unit tests for CPM Engine."""

from pathlib import Path
import pytest
from app.engine.cpm.cpm_engine import CPMEngine


@pytest.fixture
def sample_data_path():
    return Path(__file__).resolve().parent.parent / "engine" / "data" / "sample_tasks.json"


def test_cpm_load_json(sample_data_path):
    engine = CPMEngine()
    engine.load_from_json(sample_data_path)
    assert engine.graph.number_of_nodes() == 20
    assert engine.graph.number_of_edges() > 0


def test_cpm_computation(sample_data_path):
    engine = CPMEngine()
    engine.load_from_json(sample_data_path)
    result = engine.compute()

    assert result.makespan > 0
    assert len(result.critical_path) > 0
    assert "A1" in result.critical_path  # Site prep is start of critical path
    assert result.total_project_cost > 0

    # Verify that all activities on critical path have total_float == 0
    for cid in result.critical_path:
        assert result.schedule[cid].total_float == 0
        assert result.schedule[cid].is_critical is True


def test_cpm_cycle_detection():
    engine = CPMEngine()
    cyclic_acts = [
        {"id": "A1", "name": "Task 1", "duration": 5, "predecessors": ["A2"]},
        {"id": "A2", "name": "Task 2", "duration": 5, "predecessors": ["A1"]},
    ]
    with pytest.raises(ValueError, match="cycles"):
        engine.load_activities(cyclic_acts)
