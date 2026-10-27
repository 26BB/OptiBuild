import pytest
from starlette.testclient import TestClient
from backend.app.engine.recalibrate import CrashCostRecalibrator
from backend.app.main import app

client = TestClient(app)


def test_dashboard_metrics_generation():
    """Validates budget vs actual totals, category breakdowns, and 12-month S-curve."""
    dash = CrashCostRecalibrator.get_dashboard_metrics()

    assert dash.total_planned_budget == 180000000.0
    assert dash.total_actual_spent > 0.0
    assert dash.total_variance == dash.total_planned_budget - dash.total_actual_spent
    assert len(dash.categories) == 6
    assert len(dash.s_curve_data) == 12
    assert dash.s_curve_data[0].month == "M01"
    assert dash.s_curve_data[11].month == "M12"


def test_material_variance_factors():
    """Validates inflation factor computation: actual logged unit rates vs baseline benchmarks."""
    factors = CrashCostRecalibrator.compute_material_variance_factors()

    assert "Steel / Rebar" in factors
    assert "RMC Concrete" in factors
    # Tata Tiscon steel is logged at 58,000 / baseline 54,000 = 1.0741
    assert factors["Steel / Rebar"] > 1.0
    # ACC RMC is logged at 4,500 / baseline 4,200 = 1.0714
    assert factors["RMC Concrete"] > 1.0


def test_task_crash_slope_recalibration():
    """Verifies that task crash slopes increase when material costs escalate."""
    recalibrated = CrashCostRecalibrator.recalibrate_tasks()

    assert len(recalibrated) >= 3
    for item in recalibrated:
        # Since actual steel/concrete rates are higher than baseline, recalibrated slopes must be >= baseline
        assert item.recalibrated_crash_slope >= item.baseline_crash_slope
        assert item.change_percent >= 0.0


def _get_or_create_dash_project():
    from backend.app.db.session import SessionLocal
    from backend.app.db.models import Project
    db = SessionLocal()
    try:
        p = db.query(Project).filter(Project.id == "dash-test-proj").first()
        if not p:
            p = Project(id="dash-test-proj", name="Dashboard Test Project", total_project_cost=180000000.0)
            db.add(p)
            db.commit()
        return "dash-test-proj"
    finally:
        db.close()


def test_dashboard_api_endpoints():
    """Verifies GET budget-vs-actual and POST recalibrate-crash-costs."""
    proj_id = _get_or_create_dash_project()
    # 1. Dashboard summary
    resp_dash = client.get(f"/api/v1/dashboard/budget-vs-actual?project_id={proj_id}")
    assert resp_dash.status_code == 200
    data_dash = resp_dash.json()
    assert data_dash["total_planned_budget"] > 0
    assert len(data_dash["categories"]) == 6
    assert len(data_dash["s_curve_data"]) == 12

    # 2. Recalibrate endpoint
    resp_recal = client.post(f"/api/v1/dashboard/recalibrate-crash-costs?project_id={proj_id}")
    assert resp_recal.status_code == 200
    data_recal = resp_recal.json()
    assert data_recal["status"] == "RECALIBRATED"
    assert "material_inflation_factors" in data_recal
    assert len(data_recal["recalibrated_tasks"]) >= 3
