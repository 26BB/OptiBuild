import io
import re
from typing import Dict, Optional, Tuple
import pdfplumber
from pypdf import PdfReader

from backend.app.schemas.pdf_parser import MahaRERAPreFillDraft


class MahaRERAPDFParser:
    """
    Parses MahaRERA registration certificates and Form reports to pre-fill
    project setup forms.
    LOCKED RULE: Output is an unconfirmed draft. User must review and confirm.
    """

    @classmethod
    def parse_pdf_bytes(cls, pdf_bytes: bytes) -> MahaRERAPreFillDraft:
        extracted_text = ""

        # 1. Primary extractor: pdfplumber
        try:
            with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
                pages_text = [page.extract_text() or "" for page in pdf.pages]
                extracted_text = "\n".join(pages_text).strip()
        except Exception:
            extracted_text = ""

        # 2. Fallback extractor: pypdf
        if not extracted_text:
            try:
                reader = PdfReader(io.BytesIO(pdf_bytes))
                pages_text = [p.extract_text() or "" for p in reader.pages]
                extracted_text = "\n".join(pages_text).strip()
            except Exception:
                extracted_text = ""

        if not extracted_text:
            return MahaRERAPreFillDraft(
                project_name=None,
                rera_registration_no=None,
                confidence_scores={"all": "NOT_FOUND"},
                raw_text_snippet="Could not extract machine-readable text from uploaded PDF.",
                requires_user_confirmation=True,
                is_confirmed=False,
            )

        return cls.extract_from_text(extracted_text)

    @classmethod
    def extract_from_text(cls, text: str) -> MahaRERAPreFillDraft:
        confidence: Dict[str, str] = {}

        # 1. RERA Registration Number (e.g. P52100018921 or P51800001234)
        rera_match = re.search(r"\b(P5[0-9]{9,10})\b", text, re.IGNORECASE)
        rera_no = rera_match.group(1).upper() if rera_match else None
        confidence["rera_registration_no"] = "HIGH" if rera_no else "NOT_FOUND"

        # 2. Project Name
        proj_match = re.search(
            r"(?:Project Name|Name of Project|Project)\s*[:\-]\s*([^\n\r]+)",
            text,
            re.IGNORECASE,
        )
        if proj_match:
            project_name = proj_match.group(1).strip()
            confidence["project_name"] = "HIGH"
        else:
            # Fallback heuristic: First capitalized title line
            first_lines = [l.strip() for l in text.splitlines() if len(l.strip()) > 5][:5]
            project_name = first_lines[0] if first_lines else "Untitled RERA Project"
            confidence["project_name"] = "INFERRED"

        # 3. Promoter Name
        promoter_match = re.search(
            r"(?:Promoter Name|Developer|Promoter/Developer|Company Name)\s*[:\-]\s*([^\n\r]+)",
            text,
            re.IGNORECASE,
        )
        promoter_name = promoter_match.group(1).strip() if promoter_match else None
        confidence["promoter_name"] = "HIGH" if promoter_name else "NOT_FOUND"

        # 4. Proposed Handover Date
        date_match = re.search(
            r"(?:Proposed Date of Completion|Revised Proposed Date of Completion|Handover Date|Completion Date)\s*[:\-]\s*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{4}|[0-9]{1,2}\s+[A-Za-z]+\s+[0-9]{4})",
            text,
            re.IGNORECASE,
        )
        completion_date = date_match.group(1).strip() if date_match else None
        confidence["proposed_completion_date"] = "HIGH" if completion_date else "NOT_FOUND"

        # 5. Built-up Area & Plot Area (handling sq.mt to sq.ft conversion)
        built_up_area, built_up_conf = cls._extract_area(
            text, [r"Sanctioned Built-up Area", r"Total Built-up Area", r"Built-up Area", r"FSI Area"]
        )
        confidence["built_up_area_sqft"] = built_up_conf

        plot_area, plot_conf = cls._extract_area(
            text, [r"Plot Area", r"Total Area of Land", r"Land Area"]
        )
        confidence["plot_area_sqft"] = plot_conf

        carpet_area, carpet_conf = cls._extract_area(
            text, [r"Total Carpet Area", r"Carpet Area"]
        )
        confidence["carpet_area_sqft"] = carpet_conf

        # 6. Floors Count
        floors = None
        floors_match = re.search(
            r"(?:Number of Floors|Total Floors|No\. of Floors)\s*[:\-]\s*([0-9]+)",
            text,
            re.IGNORECASE,
        )
        if floors_match:
            floors = int(floors_match.group(1))
            confidence["number_of_floors"] = "HIGH"
        else:
            # Check G+N pattern
            g_plus = re.search(r"G\s*\+\s*([0-9]+)", text, re.IGNORECASE)
            if g_plus:
                floors = 1 + int(g_plus.group(1))
                confidence["number_of_floors"] = "HIGH"
            else:
                confidence["number_of_floors"] = "NOT_FOUND"

        # 7. Basements Count
        basements = None
        base_match = re.search(
            r"(?:Number of Basements|Basements)\s*[:\-]\s*([0-9]+)",
            text,
            re.IGNORECASE,
        )
        if base_match:
            basements = int(base_match.group(1))
            confidence["number_of_basements"] = "HIGH"
        else:
            confidence["number_of_basements"] = "NOT_FOUND"

        # 8. Project Cost
        cost_match = re.search(
            r"(?:Total Estimated Cost|Estimated Cost of Project|Project Cost)\s*[:\-]\s*(?:Rs\.?|INR|₹)?\s*([0-9,]+(?:\.[0-9]+)?)",
            text,
            re.IGNORECASE,
        )
        cost = None
        if cost_match:
            try:
                raw_num = cost_match.group(1).replace(",", "")
                cost = float(raw_num)
                confidence["total_project_cost"] = "HIGH"
            except ValueError:
                confidence["total_project_cost"] = "NOT_FOUND"
        else:
            confidence["total_project_cost"] = "NOT_FOUND"

        snippet = text[:400].replace("\n", " ").strip()

        return MahaRERAPreFillDraft(
            project_name=project_name,
            rera_registration_no=rera_no,
            promoter_name=promoter_name,
            proposed_completion_date=completion_date,
            plot_area_sqft=plot_area,
            built_up_area_sqft=built_up_area,
            carpet_area_sqft=carpet_area,
            number_of_floors=floors,
            number_of_basements=basements,
            total_project_cost=cost,
            confidence_scores=confidence,
            raw_text_snippet=snippet,
            requires_user_confirmation=True,
            is_confirmed=False,
        )

    @staticmethod
    def _extract_area(text: str, label_patterns: list) -> Tuple[Optional[float], str]:
        for lbl in label_patterns:
            pattern = (
                rf"{lbl}\s*[:\-]\s*([0-9,]+(?:\.[0-9]+)?)\s*(sq\.?\s*m(?:tr)?|sqm|sq\.?\s*ft|sqft)?"
            )
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                val_str = match.group(1).replace(",", "")
                unit = match.group(2) or ""
                try:
                    num = float(val_str)
                    # Convert square meters to square feet if unit indicates meters
                    if "m" in unit.lower():
                        sqft = round(num * 10.7639, 2)
                    else:
                        sqft = round(num, 2)
                    return sqft, "HIGH"
                except ValueError:
                    continue
        return None, "NOT_FOUND"
