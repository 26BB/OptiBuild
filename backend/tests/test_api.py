import pytest
from starlette.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_health_check_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_cpm_endpoint():
    payload = {
        "project_name": "Test Site Excavation",
        "tasks": [
            {"id": "A", "name": "Survey & Prep", "duration": 3, "predecessors": []},
            {"id": "B", "name": "Digging", "duration": 4, "predecessors": ["A"]},
        ],
        "resource_limits": {},
    }
    response = client.post("/api/v1/schedule/cpm", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["project_makespan"] == 7
    assert data["critical_path"] == ["A", "B"]


def test_optimize_endpoint():
    payload = {
        "project_name": "Site Slab Pour",
        "tasks": [
            {
                "id": "T1",
                "name": "Rebar Binding",
                "duration": 4,
                "predecessors": [],
                "resource_demands": {"labor": 10},
            },
            {
                "id": "T2",
                "name": "Conduit Placement",
                "duration": 4,
                "predecessors": [],
                "resource_demands": {"labor": 10},
            },
        ],
        "resource_limits": {"labor": 12},  # Only 12 workers, both need 10, cannot run together
        "ga_population_size": 20,
        "ga_generations": 20,
        "random_seed": 42,
    }
    response = client.post("/api/v1/schedule/optimize", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["cpm"]["project_makespan"] == 4  # Unconstrained
    assert data["ga"]["makespan"] == 8           # Constrained due to labor bottleneck
    assert data["ga"]["resource_delay_days"] == 4
