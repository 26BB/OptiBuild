import io
import pytest
from starlette.testclient import TestClient
from backend.app.engine.pdf_parser import MahaRERAPDFParser
from backend.app.main import app

client = TestClient(app)

SAMPLE_RERA_TEXT = """
MAHARASHTRA REAL ESTATE REGULATORY AUTHORITY
REGISTRATION CERTIFICATE OF PROJECT
This registration is granted under section 5 of the Real Estate (Regulation and Development) Act, 2016.
Project Registration Number: P52100018921
Project Name: Emerald Heights Phase 1
Promoter Name: Solitaire Infra Projects Private Limited
Proposed Date of Completion: 31/12/2027
Total Area of Land: 4500.0 sq.mtr
Sanctioned Built-up Area: 12500.0 sq.mtr
Total Carpet Area: 8500.0 sq.mtr
Total Floors: 15
Total Estimated Cost of Project: Rs. 42,50,00,000
"""


def test_extract_from_rera_text():
    """Validates regex extraction from standard MahaRERA registration text."""
    draft = MahaRERAPDFParser.extract_from_text(SAMPLE_RERA_TEXT)

    assert draft.rera_registration_no == "P52100018921"
    assert draft.project_name == "Emerald Heights Phase 1"
    assert draft.promoter_name == "Solitaire Infra Projects Private Limited"
    assert draft.proposed_completion_date == "31/12/2027"
    assert draft.number_of_floors == 15
    assert draft.total_project_cost == 425000000.0

    # Locked Rule: Must require user review and confirmation
    assert draft.requires_user_confirmation is True
    assert draft.is_confirmed is False

    # Check sq.mt to sq.ft conversion: 12500 * 10.7639 = 134548.75 sqft
    assert draft.built_up_area_sqft is not None
    assert abs(draft.built_up_area_sqft - 134548.75) < 1.0


def test_area_unit_conversion():
    """Validates that square meters are properly converted to square feet, and sqft remains sqft."""
    text_sqm = "Sanctioned Built-up Area: 1000 sqm"
    draft_sqm = MahaRERAPDFParser.extract_from_text(text_sqm)
    assert abs(draft_sqm.built_up_area_sqft - 10763.9) < 1.0

    text_sqft = "Sanctioned Built-up Area: 50000 sqft"
    draft_sqft = MahaRERAPDFParser.extract_from_text(text_sqft)
    assert draft_sqft.built_up_area_sqft == 50000.0


def test_unparseable_text_safe_fallback():
    """Unparseable or corrupted text yields graceful fallback with low confidence."""
    draft = MahaRERAPDFParser.extract_from_text("Corrupted binary data without any RERA tags")
    assert draft.rera_registration_no is None
    assert draft.requires_user_confirmation is True
    assert draft.is_confirmed is False


def test_confirm_rera_draft_endpoint():
    """Verifies that user can review, modify, and confirm pre-filled values."""
    payload = {
        "project_name": "Emerald Heights Phase 1 (Confirmed)",
        "rera_registration_no": "P52100018921",
        "promoter_name": "Solitaire Infra",
        "proposed_completion_date": "31/12/2027",
        "plot_area_sqft": 48437.55,
        "built_up_area_sqft": 134548.75,
        "carpet_area_sqft": 91493.15,
        "number_of_floors": 15,
        "number_of_basements": 1,
        "total_project_cost": 425000000.0,
        "user_notes": "Allottee handover date verified against Annexure B",
    }
    resp = client.post("/api/v1/rera/confirm", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "CONFIRMED"
    assert data["project_name"] == "Emerald Heights Phase 1 (Confirmed)"
    assert data["confirmed_data"]["number_of_floors"] == 15
