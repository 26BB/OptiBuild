import pytest
from starlette.testclient import TestClient
from backend.app.main import app
from backend.app.core.auth import get_current_user
from backend.app.db.models import User

client = TestClient(app)


def test_submit_bug_report_public():
    payload = {
        "report_type": "BUG",
        "title": "Scheduler Gantt float calculation issue",
        "description": "When setting resource limit to 5, float column displays negative.",
        "category": "SCHEDULER",
        "severity": "HIGH",
        "telemetry_data": {"browser": "Chrome 120", "screen": "1920x1080"},
    }
    response = client.post("/api/v1/feedback", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["report_type"] == "BUG"
    assert data["status"] == "OPEN"
    assert data["category"] == "SCHEDULER"
    assert data["severity"] == "HIGH"
    assert "id" in data


def test_submit_feedback_with_rating():
    payload = {
        "report_type": "FEEDBACK",
        "title": "Industrial CAD theme looks clean",
        "description": "The hairline 1px borders and high contrast tokens work great in bright sunlight.",
        "category": "UI_UX",
        "rating": 5,
    }
    response = client.post("/api/v1/feedback", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["report_type"] == "FEEDBACK"
    assert data["rating"] == 5


def test_invalid_report_type():
    payload = {
        "report_type": "INVALID_TYPE",
        "title": "Test Title",
        "description": "Test description long enough",
    }
    response = client.post("/api/v1/feedback", json=payload)
    assert response.status_code == 422


def test_invalid_rating():
    payload = {
        "report_type": "FEEDBACK",
        "title": "Invalid rating test",
        "description": "Testing validation boundary",
        "rating": 10,
    }
    response = client.post("/api/v1/feedback", json=payload)
    assert response.status_code == 422


def test_list_feedback_authorization():
    # Admin is allowed
    admin_user = User(id="usr-adm", email="admin@optibuild.io", role="admin", is_active=True)
    app.dependency_overrides[get_current_user] = lambda: admin_user
    resp_admin = client.get("/api/v1/feedback")
    assert resp_admin.status_code == 200

    # Project Manager is allowed
    pm_user = User(id="usr-pm", email="pm@optibuild.io", role="project_manager", is_active=True)
    app.dependency_overrides[get_current_user] = lambda: pm_user
    resp_pm = client.get("/api/v1/feedback")
    assert resp_pm.status_code == 200

    # Site Engineer is forbidden
    site_user = User(id="usr-site", email="site@optibuild.io", role="site_engineer", is_active=True)
    app.dependency_overrides[get_current_user] = lambda: site_user
    resp_site = client.get("/api/v1/feedback")
    assert resp_site.status_code == 403


def test_feedback_stats_endpoint():
    response = client.get("/api/v1/feedback/stats")
    assert response.status_code == 200
    stats = response.json()
    assert "total_submissions" in stats
    assert "total_bugs" in stats
    assert "total_feedback" in stats
    assert "open_bugs" in stats
    assert "resolved_bugs" in stats
    assert "category_breakdown" in stats


def test_admin_patch_feedback_status():
    # Submit first
    post_res = client.post(
        "/api/v1/feedback",
        json={
            "report_type": "FEATURE_REQUEST",
            "title": "Add IFC / BIM 3D viewer",
            "description": "Support unparsed IFC model viewer in drawings tab.",
            "category": "DRAWINGS",
        },
    )
    report_id = post_res.json()["id"]

    # Admin is allowed
    admin_user = User(id="usr-adm", email="admin@optibuild.io", role="admin", is_active=True)
    app.dependency_overrides[get_current_user] = lambda: admin_user
    patch_res = client.patch(
        f"/api/v1/feedback/{report_id}",
        json={"status": "RESOLVED", "admin_notes": "Implemented in sprint 4"},
    )
    assert patch_res.status_code == 200
    updated = patch_res.json()
    assert updated["status"] == "RESOLVED"
    assert updated["admin_notes"] == "Implemented in sprint 4"

    # Non-admin (PM) forbidden to patch
    pm_user = User(id="usr-pm", email="pm@optibuild.io", role="project_manager", is_active=True)
    app.dependency_overrides[get_current_user] = lambda: pm_user
    patch_forbidden = client.patch(
        f"/api/v1/feedback/{report_id}",
        json={"status": "CLOSED"},
    )
    assert patch_forbidden.status_code == 403
