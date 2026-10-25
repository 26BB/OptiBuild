import pytest
from starlette.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

ROLE_LOGINS = {
    "admin": ("admin@optibuild.io", "Admin@123"),
    "project_manager": ("pm@optibuild.io", "Pm@123"),
    "site_engineer": ("engineer@optibuild.io", "Engineer@123"),
    "store_keeper": ("store@optibuild.io", "Store@123"),
    "architect": ("architect@optibuild.io", "Architect@123"),
    "accountant": ("accountant@optibuild.io", "Accountant@123"),
    "owner": ("owner@optibuild.io", "Owner@123"),
}

_TOKEN_CACHE = {}


def auth_header(role: str) -> dict:
    if role not in _TOKEN_CACHE:
        email, password = ROLE_LOGINS[role]
        resp = client.post("/api/v1/auth/login", json={"email": email, "password": password})
        assert resp.status_code == 200, f"Login failed for {role}: {resp.text}"
        _TOKEN_CACHE[role] = resp.json()["access_token"]
    return {"Authorization": f"Bearer {_TOKEN_CACHE[role]}"}


def test_unauthenticated_request_rejected():
    """Endpoints requiring authentication return 401 when no token is provided."""
    resp = client.get("/api/v1/wbs/default-ratios")
    assert resp.status_code == 401


def test_admin_role_has_universal_access():
    """Admin role can access user management and project endpoints."""
    # User management (admin only)
    resp = client.get("/api/v1/users", headers=auth_header("admin"))
    assert resp.status_code == 200

    # WBS default ratios
    resp_wbs = client.get("/api/v1/wbs/default-ratios", headers=auth_header("admin"))
    assert resp_wbs.status_code == 200


def test_non_admin_cannot_access_user_management():
    """Non-admin roles are forbidden from managing users."""
    roles = ["project_manager", "site_engineer", "store_keeper", "architect", "accountant", "owner"]
    for r in roles:
        resp = client.get("/api/v1/users", headers=auth_header(r))
        assert resp.status_code == 403
        assert "Access denied" in resp.json()["detail"]


def test_project_manager_permissions():
    """Project Manager can access scheduler, optimizer, and WBS."""
    pm_headers = auth_header("project_manager")

    # WBS default ratios
    resp = client.get("/api/v1/wbs/default-ratios", headers=pm_headers)
    assert resp.status_code == 200

    # Optimizer evaluate endpoint
    payload = {
        "rera_params": {
            "total_allottee_investment": 10000000.0,
            "sbi_mclr_rate": 8.85,
            "rera_spread": 2.0,
            "delay_days": 10,
        },
        "tasks": [
            {
                "id": "T01",
                "name": "Columns",
                "normal_duration": 10,
                "crash_duration": 7,
                "normal_cost": 50000.0,
                "crash_cost": 80000.0,
                "predecessors": [],
            }
        ],
        "target_recovery_days": 3,
    }
    resp_opt = client.post("/api/v1/optimizer/evaluate", json=payload, headers=pm_headers)
    assert resp_opt.status_code == 200


def test_store_keeper_can_log_materials_others_cannot():
    """Store keeper can create material logs; architect and owner cannot."""
    material_payload = {
        "date": "2026-10-25",
        "material_category": "Cement",
        "item_description": "53 Grade OPC Bags",
        "quantity": 100.0,
        "unit": "Bags",
        "unit_rate": 380.0,
        "vendor_name": "UltraTech Depot",
        "invoice_number": "INV-TEST-001",
    }

    # Store Keeper -> PASS
    resp_store = client.post("/api/v1/materials/log", json=material_payload, headers=auth_header("store_keeper"))
    assert resp_store.status_code == 200

    # Architect -> 403 Forbidden
    resp_arch = client.post("/api/v1/materials/log", json=material_payload, headers=auth_header("architect"))
    assert resp_arch.status_code == 403

    # Owner -> 403 Forbidden
    resp_owner = client.post("/api/v1/materials/log", json=material_payload, headers=auth_header("owner"))
    assert resp_owner.status_code == 403


def test_architect_drawing_permissions():
    """Architect can upload drawings; store keeper and site engineer cannot."""
    files = {"file": ("floor_plan.pdf", b"%PDF-1.4 mock cad content", "application/pdf")}
    data = {"title": "L14 Floor Plan", "drawing_type": "ARCHITECTURAL"}

    # Store keeper -> 403
    resp_store = client.post(
        "/api/v1/projects/fake-id/drawings",
        files=files,
        data=data,
        headers=auth_header("store_keeper"),
    )
    assert resp_store.status_code == 403

    # Site engineer -> 403
    resp_eng = client.post(
        "/api/v1/projects/fake-id/drawings",
        files=files,
        data=data,
        headers=auth_header("site_engineer"),
    )
    assert resp_eng.status_code == 403


def test_accountant_and_owner_read_dashboard():
    """Accountant and Owner can read Budget vs Actual dashboard."""
    for role in ["accountant", "owner", "admin", "project_manager"]:
        resp = client.get("/api/v1/dashboard/budget-vs-actual", headers=auth_header(role))
        assert resp.status_code == 200

    # Architect -> 403
    resp_arch = client.get("/api/v1/dashboard/budget-vs-actual", headers=auth_header("architect"))
    assert resp_arch.status_code == 403
