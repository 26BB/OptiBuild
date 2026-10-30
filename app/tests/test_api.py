"""Integration tests for FastAPI endpoints."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.backend.main import app
from app.backend.database import Base, get_db

# In-memory SQLite for testing with StaticPool
from sqlalchemy.pool import StaticPool

TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data


def test_create_project_and_load_samples():
    # 1. Create project
    proj_payload = {
        "name": "Emerald Heights (G+4)",
        "location": "Baner, Pune",
        "built_up_area_sqft": 30000.0,
        "total_floors": 5,
        "total_flats": 20,
        "amount_collected_inr": 60000000.0,
        "contractual_deadline_days": 180,
        "sbi_mclr_rate": 8.85,
    }
    create_res = client.post("/api/projects", json=proj_payload)
    assert create_res.status_code == 201
    proj_id = create_res.json()["id"]

    # 2. Preload 20 RCC sample tasks
    load_res = client.post(f"/api/projects/{proj_id}/load-sample-tasks")
    assert load_res.status_code == 200
    acts = load_res.json()["activities"]
    assert len(acts) == 20

    # 3. Trigger optimization
    opt_payload = {
        "solver_mode": "BENCHMARK",
        "ga_population": 20,
        "ga_generations": 10,
        "cpsat_timeout_sec": 5.0,
    }
    opt_res = client.post(f"/api/optimize/{proj_id}", json=opt_payload)
    assert opt_res.status_code == 200
    opt_data = opt_res.json()

    assert opt_data["project_id"] == proj_id
    assert opt_data["unconstrained_cpm_makespan_days"] > 0
    assert opt_data["ga_makespan_days"] > 0
    assert opt_data["cpsat_makespan_days"] > 0
    assert "critical_path" in opt_data
    assert len(opt_data["critical_path"]) > 0
