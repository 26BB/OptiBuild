"""MahaRERA PDF Extractor using pdfplumber.

Scope Guardrail:
    - Never auto-commits directly to the optimization database.
    - Extracts project parameters to pre-fill web forms for human review and confirmation.
"""

from __future__ import annotations

import logging
import re
from pathlib import Path
from typing import Any, BinaryIO

logger = logging.getLogger(__name__)


class MahaRERAPdfExtractor:
    """Extracts project parameters from official MahaRERA project registration PDFs."""

    def __init__(self) -> None:
        pass

    def extract_from_bytes(self, pdf_stream: BinaryIO) -> dict[str, Any]:
        """Extract fields from in-memory PDF stream."""
        try:
            import pdfplumber
        except ImportError:
            logger.warning("pdfplumber not installed; falling back to stub parser.")
            return self._empty_result(message="pdfplumber library not installed.")

        raw_text = ""
        try:
            with pdfplumber.open(pdf_stream) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        raw_text += page_text + "\n"
        except Exception as e:
            logger.exception("Failed to parse PDF bytes: %s", str(e))
            return self._empty_result(message=f"PDF parsing error: {str(e)}")

        return self._parse_text(raw_text)

    def extract_from_file(self, file_path: str | Path) -> dict[str, Any]:
        """Extract fields from local PDF file."""
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"PDF file not found: {path}")

        with open(path, "rb") as f:
            return self.extract_from_bytes(f)

    def _parse_text(self, text: str) -> dict[str, Any]:
        """Regex and keyword heuristic parser for MahaRERA certificate format."""
        result: dict[str, Any] = {
            "project_name": None,
            "promoter_name": None,
            "rera_reg_no": None,
            "location": None,
            "proposed_completion_date": None,
            "total_floors": None,
            "total_flats": None,
            "built_up_area_sqft": None,
            "raw_text_snippet": text[:500] if text else "",
            "is_confirmed": False,
            "message": "Extracted successfully. Human review and confirmation required.",
        }

        if not text:
            result["message"] = "No readable text found in PDF (scanned or image-only)."
            return result

        # 1. MahaRERA Registration Number (Format: P521000... or P followed by 11-12 digits)
        rera_match = re.search(r"(P[0-9]{11,12})", text)
        if rera_match:
            result["rera_reg_no"] = rera_match.group(1)

        # 2. Project Name
        proj_match = re.search(
            r"Project\s+Name\s*[:\-]\s*([^\n\r]+)", text, re.IGNORECASE
        )
        if proj_match:
            result["project_name"] = proj_match.group(1).strip()

        # 3. Promoter / Organization Name
        promoter_match = re.search(
            r"(?:Promoter|Organization)\s+Name\s*[:\-]\s*([^\n\r]+)", text, re.IGNORECASE
        )
        if promoter_match:
            result["promoter_name"] = promoter_match.group(1).strip()

        # 4. Proposed Completion Date (e.g. 31/12/2027 or 2027-12-31)
        date_match = re.search(
            r"(?:Proposed|Revised)\s+(?:Date\s+of\s+)?Completion\s*[:\-]?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{4}|[0-9]{4}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{1,2})",
            text,
            re.IGNORECASE,
        )
        if date_match:
            result["proposed_completion_date"] = date_match.group(1).strip()

        # 5. Floors / Flats
        floors_match = re.search(
            r"(?:Total\s+)?(?:Number\s+of\s+)?Floors\s*[:\-]\s*([0-9]+)", text, re.IGNORECASE
        )
        if floors_match:
            result["total_floors"] = int(floors_match.group(1))

        flats_match = re.search(
            r"(?:Total\s+)?(?:Number\s+of\s+)?(?:Apartments|Flats|Units)\s*[:\-]\s*([0-9]+)",
            text,
            re.IGNORECASE,
        )
        if flats_match:
            result["total_flats"] = int(flats_match.group(1))

        # 6. Carpet Area / Built-up Area
        area_match = re.search(
            r"(?:Total\s+)?(?:Carpet|Built[\-\s]up)\s+Area\s*[:\-]?\s*([0-9]+(?:\.[0-9]+)?)\s*(?:sq\.?\s*ft|sqm|sq\.?\s*m)?",
            text,
            re.IGNORECASE,
        )
        if area_match:
            result["built_up_area_sqft"] = float(area_match.group(1))

        return result

    def _empty_result(self, message: str) -> dict[str, Any]:
        return {
            "project_name": None,
            "promoter_name": None,
            "rera_reg_no": None,
            "location": None,
            "proposed_completion_date": None,
            "total_floors": None,
            "total_flats": None,
            "built_up_area_sqft": None,
            "raw_text_snippet": "",
            "is_confirmed": False,
            "message": message,
        }
