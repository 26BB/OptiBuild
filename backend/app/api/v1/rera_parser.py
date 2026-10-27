import uuid
from fastapi import APIRouter, File, UploadFile, HTTPException, Depends, status
from sqlalchemy.orm import Session

from backend.app.core.auth import get_current_user, require_roles
from backend.app.db.session import get_db
from backend.app.db.models import User, Project, ProjectMember, RERACertificateModel
from backend.app.storage.s3 import storage
from backend.app.schemas.pdf_parser import (
    MahaRERAPreFillDraft,
    ConfirmRERADraftRequest,
    ConfirmRERADraftResponse,
)
from backend.app.engine.pdf_parser import MahaRERAPDFParser

router = APIRouter(prefix="/rera", tags=["MahaRERA PDF Pre-Fill & Confirmation"])


@router.post("/upload-parse", response_model=MahaRERAPreFillDraft)
async def upload_and_parse_rera_pdf(
    file: UploadFile = File(...),
    current_user: User = Depends(require_roles("project_manager", "admin")),
):
    """
    Parses an uploaded MahaRERA Project Registration Certificate PDF using pdfplumber.
    Stores the PDF in object storage and returns a pre-filled draft for compulsory user verification.
    LOCKED RULE: Only project_manager and admin can upload and initiate project registration.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported for MahaRERA parsing.",
        )

    try:
        content = await file.read()
        
        # 1. Store in object storage / local storage
        pdf_url = storage.upload_rera_pdf(content, file.filename)

        # 2. Extract fields with pdfplumber (fallback to pypdf / manual)
        draft = MahaRERAPDFParser.parse_pdf_bytes(content)
        draft.raw_pdf_url = pdf_url

        return draft
    except HTTPException:
        raise
    except Exception as e:
        # If parsing completely fails, return clean empty draft for manual entry
        return MahaRERAPreFillDraft(
            project_name=None,
            rera_registration_no=None,
            confidence_scores={"all": "NOT_FOUND"},
            raw_text_snippet=f"Parsing error: {str(e)}. Please fill the form manually.",
            requires_user_confirmation=True,
            is_confirmed=False,
        )


@router.post("/confirm", response_model=ConfirmRERADraftResponse)
def confirm_rera_draft(
    payload: ConfirmRERADraftRequest,
    current_user: User = Depends(require_roles("project_manager", "admin")),
    db: Session = Depends(get_db),
):
    """
    User reviews, modifies, and confirms the pre-filled MahaRERA draft.
    LOCKED RULE: The system must never auto-save without explicit user confirmation.
    Upon confirmation, the Project and RERACertificate records are saved into the database.
    """
    project_id = str(uuid.uuid4())

    # Create Project in DB
    new_project = Project(
        id=project_id,
        name=payload.project_name.strip(),
        status="ACTIVE",
        rera_registration_no=payload.rera_registration_no.strip(),
        promoter_name=payload.promoter_name.strip() if payload.promoter_name else None,
        proposed_completion_date=payload.proposed_completion_date.strip(),
        plot_area_sqft=payload.plot_area_sqft,
        built_up_area_sqft=payload.built_up_area_sqft,
        carpet_area_sqft=payload.carpet_area_sqft or 0.0,
        number_of_floors=payload.number_of_floors,
        number_of_basements=payload.number_of_basements,
        total_project_cost=payload.total_project_cost or 0.0,
        total_allottee_investment=(payload.total_project_cost or 0.0) * 0.70,  # Default 70% escrow base
        created_by_id=current_user.id,
    )
    db.add(new_project)

    # Create RERA Certificate Record
    cert_record = RERACertificateModel(
        project_id=project_id,
        rera_registration_no=payload.rera_registration_no.strip(),
        project_name=payload.project_name.strip(),
        promoter_name=payload.promoter_name,
        proposed_completion_date=payload.proposed_completion_date,
        plot_area_sqft=payload.plot_area_sqft,
        built_up_area_sqft=payload.built_up_area_sqft,
        carpet_area_sqft=payload.carpet_area_sqft,
        number_of_floors=payload.number_of_floors,
        number_of_basements=payload.number_of_basements,
        total_project_cost=payload.total_project_cost,
        status="CONFIRMED",
        raw_pdf_url=payload.raw_pdf_url,
    )
    db.add(cert_record)

    # Assign current user as Project Manager of this project
    membership = ProjectMember(
        project_id=project_id,
        user_id=current_user.id,
        role="project_manager",
    )
    db.add(membership)

    db.commit()
    db.refresh(new_project)

    return ConfirmRERADraftResponse(
        status="CONFIRMED",
        project_id=new_project.id,
        project_name=new_project.name,
        rera_registration_no=new_project.rera_registration_no,
        message="MahaRERA project data reviewed, verified, confirmed, and saved to database.",
        confirmed_data=payload,
    )
