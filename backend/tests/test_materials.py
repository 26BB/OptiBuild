import io
import numpy as np
from PIL import Image
import pytest
from starlette.testclient import TestClient
from backend.app.engine.classifier import SitePhotoClassifier
from backend.app.schemas.materials import CreateMaterialLogRequest
from backend.app.main import app

client = TestClient(app)


def _create_synthetic_structural_image() -> bytes:
    """Creates a synthetic gray image with high-frequency black-and-white grid lines (mimics rebar/formwork)."""
    arr = np.ones((256, 256, 3), dtype=np.uint8) * 128  # Concrete gray
    # Draw dark rebar grid lines
    for i in range(0, 256, 12):
        arr[i, :, :] = 30
        arr[:, i, :] = 30
    img = Image.fromarray(arr)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


def _create_synthetic_finishing_image() -> bytes:
    """Creates a smooth, bright, low-edge image (mimics painted plaster or polished tile)."""
    arr = np.ones((256, 256, 3), dtype=np.uint8) * 230  # High brightness white/ivory paint
    img = Image.fromarray(arr)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


def test_classifier_structural_stage():
    """Verify high-edge grid pattern classifies as STRUCTURAL_STAGE."""
    img_bytes = _create_synthetic_structural_image()
    res = SitePhotoClassifier.classify_image_bytes(img_bytes, "foundation_rebar.jpg")

    assert res.predicted_stage == "STRUCTURAL_STAGE"
    assert res.confidence_score >= 0.70
    assert len(res.detected_features) > 0


def test_classifier_finishing_stage():
    """Verify smooth planar surface classifies as FINISHING_STAGE."""
    img_bytes = _create_synthetic_finishing_image()
    res = SitePhotoClassifier.classify_image_bytes(img_bytes, "living_room_paint.jpg")

    assert res.predicted_stage == "FINISHING_STAGE"
    assert res.confidence_score >= 0.70


def test_material_log_expenditure_and_evidence_rule():
    """Validates quantity * rate math and verifies bill photos are stored as unparsed evidence only."""
    payload = {
        "date": "2026-10-14",
        "material_category": "Cement",
        "item_description": "PPC Cement for Plastering",
        "quantity": 200.0,
        "unit": "Bags",
        "unit_rate": 370.0,
        "vendor_name": "Birla Gold",
        "invoice_number": "BG-2026-009",
        "wbs_code": "WBS-3.2",
        "bill_photo_name": "birla_invoice_bg2026.pdf",
    }
    resp = client.post("/api/v1/materials/log", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    # 200 * 370 = 74,000
    assert data["total_cost"] == 74000.0
    # Locked Rule: Bill photo is strictly stored as unparsed evidence
    assert data["is_unparsed_evidence"] is True
    assert data["bill_photo_name"] == "birla_invoice_bg2026.pdf"


def test_material_log_get_summary():
    """Verifies GET /api/v1/materials/log returns entries and accurate summary."""
    resp = client.get("/api/v1/materials/log")
    assert resp.status_code == 200
    summary = resp.json()

    assert summary["total_entries_count"] >= 1
    assert summary["total_expenditure"] > 0
    assert len(summary["category_totals"]) > 0


def test_classify_photo_api_endpoint():
    """Verifies POST /api/v1/materials/classify-photo multipart upload."""
    img_bytes = _create_synthetic_structural_image()
    files = {"file": ("site_snap.jpg", img_bytes, "image/jpeg")}
    resp = client.post("/api/v1/materials/classify-photo", files=files)

    assert resp.status_code == 200
    data = resp.json()
    assert data["predicted_stage"] in ("STRUCTURAL_STAGE", "FINISHING_STAGE")
    assert data["confidence_score"] > 0
