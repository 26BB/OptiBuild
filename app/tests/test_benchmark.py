"""Unit tests for Benchmark Runner (GA vs CP-SAT)."""

from pathlib import Path
import json
import pytest
from app.engine.benchmark.benchmark_runner import BenchmarkRunner


@pytest.fixture
def sample_dataset():
    data_path = Path(__file__).resolve().parent.parent / "engine" / "data" / "sample_tasks.json"
    with open(data_path, "r", encoding="utf-8") as f:
        return json.load(f)


def test_benchmark_runner_full_pipeline(sample_dataset):
    runner = BenchmarkRunner(ga_population=20, ga_generations=15, cpsat_timeout_sec=10.0)
    report = runner.run_benchmark(
        activities=sample_dataset["activities"],
        resources=sample_dataset["resources"],
        project_name=sample_dataset["project_name"],
        amount_collected=50_000_000.0,
        contractual_deadline_days=180,
    )

    assert report.activity_count == 20
    assert report.unconstrained_cpm_makespan > 0
    assert report.ga_makespan >= report.unconstrained_cpm_makespan
    assert report.cpsat_makespan >= report.unconstrained_cpm_makespan
    assert report.ga_runtime_seconds > 0
    assert report.cpsat_runtime_seconds > 0
    assert len(report.critical_path) > 0
    assert report.penalty_analysis is not None
