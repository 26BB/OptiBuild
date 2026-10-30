"""MahaRERA PDF Ingestion Router."""

from __future__ import annotations

import io
from fastapi import APIRouter, File, UploadFile, HTTPException, status
from app.backend.schemas import MahaRERAPdfExtractResponse
from app.ingestion.pdf_extractor import MahaRERAPdfExtractor

router = APIRouter(prefix="/ingestion", tags=["Data Ingestion"])

extractor = MahaRERAPdfExtractor()


@router.post("/parse-maharera-pdf", response_model=MahaRERAPdfExtractResponse)
async def parse_maharera_pdf(file: UploadFile = File(...)):
    """Upload a MahaRERA registration / certificate PDF.

    Extracts project metadata to pre-fill the project setup form.
    Requires human review and confirmation before scheduling.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a PDF document",
        )

    try:
        contents = await file.read()
        stream = io.BytesIO(contents)
        result = extractor.extract_from_bytes(stream)
        return MahaRERAPdfExtractResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process PDF: {str(e)}",
        )
