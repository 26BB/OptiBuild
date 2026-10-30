"""Unit tests for Data Ingestion (PDF extractor) and Computer Vision (MobileNetV2)."""

import io
from pathlib import Path
import pytest
from app.ingestion.pdf_extractor import MahaRERAPdfExtractor
from app.cv.progress_classifier import ProgressClassifier


def test_pdf_extractor_text_parsing():
    extractor = MahaRERAPdfExtractor()
    sample_text = """
    MAHARASHTRA REAL ESTATE REGULATORY AUTHORITY
    Project Name: Pride World City — Brooklyn
    Promoter Name: Pride Builders LLP
    Registration No: P52100012345
    Proposed Date of Completion: 31/12/2027
    Total Number of Floors: 14
    Total Number of Apartments: 120
    Total Carpet Area: 85400 sq.ft
    """
    data = extractor._parse_text(sample_text)

    assert data["project_name"] == "Pride World City — Brooklyn"
    assert data["promoter_name"] == "Pride Builders LLP"
    assert data["rera_reg_no"] == "P52100012345"
    assert data["proposed_completion_date"] == "31/12/2027"
    assert data["total_floors"] == 14
    assert data["total_flats"] == 120
    assert data["built_up_area_sqft"] == 85400.0
    assert data["is_confirmed"] is False  # Guardrail: Never auto-confirm


def test_progress_classifier_fallback_and_inference():
    from PIL import Image

    classifier = ProgressClassifier()
    # Create a synthetic test image (concrete-gray color)
    gray_img = Image.new("RGB", (256, 256), color=(128, 128, 128))
    img_byte_arr = io.BytesIO()
    gray_img.save(img_byte_arr, format="JPEG")
    img_byte_arr.seek(0)

    result = classifier.predict_image(img_byte_arr)

    assert "phase" in result
    assert result["phase"] in ["STRUCTURAL", "FINISHING"]
    assert 0.0 <= result["confidence"] <= 1.0
    assert "probabilities" in result
