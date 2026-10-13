from fastapi import APIRouter, File, UploadFile, HTTPException
from backend.app.schemas.pdf_parser import (
    MahaRERAPreFillDraft,
    ConfirmRERADraftRequest,
    ConfirmRERADraftResponse,
)
from backend.app.engine.pdf_parser import MahaRERAPDFParser

router = APIRouter(prefix="/rera", tags=["MahaRERA PDF Pre-Fill"])


@router.post("/upload-parse", response_model=MahaRERAPreFillDraft)
async def upload_and_parse_rera_pdf(file: UploadFile = File(...)):
    """
    Parses an uploaded MahaRERA Project Registration Certificate PDF using pdfplumber.
    Returns a pre-filled draft for compulsory user verification and confirmation.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported for MahaRERA parsing.")

    try:
        content = await file.read()
        draft = MahaRERAPDFParser.parse_pdf_bytes(content)
        return draft
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse MahaRERA PDF: {str(e)}")


@router.post("/confirm", response_model=ConfirmRERADraftResponse)
def confirm_rera_draft(payload: ConfirmRERADraftRequest):
    """
    User reviews, modifies, and confirms the pre-filled MahaRERA draft.
    LOCKED RULE: The system must never auto-save without explicit user confirmation.
    """
    return ConfirmRERADraftResponse(
        status="CONFIRMED",
        project_name=payload.project_name,
        rera_registration_no=payload.rera_registration_no,
        message="MahaRERA project data reviewed, verified and confirmed by user.",
        confirmed_data=payload,
    )
