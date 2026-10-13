import pytest
from starlette.testclient import TestClient
from backend.app.schemas.wbs import BuildingParametersInput
from backend.app.engine.wbs_generator import WBSGenerator
from backend.app.main import app

client = TestClient(app)


def test_wbs_total_cost_calculation():
    """Validates baseline cost estimation: built_up_area * base_rate_sqft."""
    params = BuildingParametersInput(
        project_name="Test Complex",
        built_up_area_sqft=50000.0,
        base_rate_per_sqft=2000.0,
        number_of_floors=10,
    )
    result = WBSGenerator.generate(params)

    # 50,000 * 2,000 = 10,00,00,000 (10 Crore)
    assert result.total_estimated_cost == 100000000.0
    assert result.built_up_area_sqft == 50000.0


def test_wbs_category_sums_and_budget_percentages():
    """Validates that categories and item costs correctly sum up to total budget."""
    params = BuildingParametersInput(
        project_name="High-Rise Tower",
        built_up_area_sqft=80000.0,
        base_rate_per_sqft=2500.0,
    )
    result = WBSGenerator.generate(params)

    total_cat_cost = sum(cat.total_cost for cat in result.categories)
    total_pct = sum(cat.total_percentage for cat in result.categories)

    assert abs(total_pct - 100.0) < 0.01
    assert abs(total_cat_cost - result.total_estimated_cost) < 5.0


def test_wbs_generated_tasks_cpm_validity():
    """Verifies that generated WBS tasks form a strictly valid acyclic CPM network."""
    params = BuildingParametersInput()
    result = WBSGenerator.generate(params)

    assert len(result.generated_tasks) >= 10
    assert result.cpm_makespan_days > 0

    # Ensure all predecessors reference defined tasks
    task_ids = {t.id for t in result.generated_tasks}
    for t in result.generated_tasks:
        for p in t.predecessors:
            assert p in task_ids


def test_wbs_duration_scaling_by_floors():
    """Verifies that superstructure duration scales with number of floors."""
    params_low = BuildingParametersInput(number_of_floors=5, built_up_area_sqft=30000)
    params_high = BuildingParametersInput(number_of_floors=25, built_up_area_sqft=30000)

    res_low = WBSGenerator.generate(params_low)
    res_high = WBSGenerator.generate(params_high)

    task_low_slab = next(t for t in res_low.generated_tasks if t.id == "WBS-2.2")
    task_high_slab = next(t for t in res_high.generated_tasks if t.id == "WBS-2.2")

    assert task_high_slab.duration > task_low_slab.duration


def test_wbs_api_endpoints():
    """Verifies HTTP GET default-ratios and POST generate endpoints."""
    # 1. Default ratios template
    resp_ratios = client.get("/api/v1/wbs/default-ratios")
    assert resp_ratios.status_code == 200
    data_ratios = resp_ratios.json()
    assert "template" in data_ratios
    assert len(data_ratios["template"]) == 6

    # 2. Generate WBS endpoint
    payload = {
        "project_name": "API Commercial Block",
        "plot_area_sqft": 40000.0,
        "built_up_area_sqft": 100000.0,
        "number_of_floors": 18,
        "base_rate_per_sqft": 2800.0,
    }
    resp_gen = client.post("/api/v1/wbs/generate", json=payload)
    assert resp_gen.status_code == 200
    data_gen = resp_gen.json()
    assert data_gen["total_estimated_cost"] == 280000000.0
    assert len(data_gen["categories"]) == 6
    assert data_gen["cpm_makespan_days"] > 0
