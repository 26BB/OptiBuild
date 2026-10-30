"""Unit tests for Google OR-Tools CP-SAT Solver."""

from pathlib import Path
import pytest
from app.engine.cpsat.cpsat_solver import CPSATSolver


@pytest.fixture
def sample_data_path():
    return Path(__file__).resolve().parent.parent / "engine" / "data" / "sample_tasks.json"


def test_cpsat_solver_optimal(sample_data_path):
    solver = CPSATSolver(time_limit_seconds=15.0)
    solver.load_from_json(sample_data_path)
    result = solver.solve()

    assert result.status in ["OPTIMAL", "FEASIBLE"]
    assert result.makespan > 0
    assert result.solve_time_seconds > 0
    assert len(result.schedule) == 20

    # Verify precedence satisfaction
    for act in solver._activities:
        aid = act["id"]
        for pred in act.get("predecessors", []):
            assert result.schedule[aid]["start"] >= result.schedule[pred]["finish"]
