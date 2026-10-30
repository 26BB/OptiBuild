"""Site Progress & Computer Vision Router."""

from __future__ import annotations

import io
import os
from typing import List, Optional
from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException, status
from sqlalchemy.orm import Session

from app.backend.database import get_db
from app.backend.models import ProjectModel, SiteProgressLogModel
from app.backend.schemas import SiteProgressResponse
from app.cv.progress_classifier import ProgressClassifier

router = APIRouter(prefix="/progress", tags=["Site Progress & Computer Vision"])

classifier = ProgressClassifier()


@router.post("/{project_id}/upload-photo", response_model=SiteProgressResponse)
async def upload_progress_photo(
    project_id: int,
    week_number: int = Form(...),
    notes: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Upload weekly site photo to classify Structural vs. Finishing phase."""
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project {project_id} not found",
        )

    # Validate image mime type
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File uploaded must be an image (JPEG, PNG, etc.)",
        )

    try:
        image_bytes = await file.read()
        stream = io.BytesIO(image_bytes)

        # Run binary classification
        pred = classifier.predict_image(stream)

        # Save record
        log = SiteProgressLogModel(
            project_id=project_id,
            week_number=week_number,
            phase_detected=pred.get("phase", "UNKNOWN"),
            confidence=pred.get("confidence", 0.0),
            image_url_or_path=file.filename,
            notes=notes,
        )
        db.add(log)
        db.commit()
        db.refresh(log)

        return log

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(e)}",
        )


@router.get("/{project_id}", response_model=List[SiteProgressResponse])
def get_progress_logs(project_id: int, db: Session = Depends(get_db)):
    """List all site inspection records for a project."""
    return (
        db.query(SiteProgressLogModel)
        .filter(SiteProgressLogModel.project_id == project_id)
        .order_by(SiteProgressLogModel.week_number.asc())
        .all()
    )


@router.patch("/{log_id}/override", response_model=SiteProgressResponse)
def override_progress_phase(
    log_id: int,
    manual_phase: str,  # "STRUCTURAL" or "FINISHING"
    db: Session = Depends(get_db),
):
    """Allow site engineer to manually override AI classification if disputed."""
    manual_phase_clean = manual_phase.strip().upper()
    if manual_phase_clean not in ["STRUCTURAL", "FINISHING"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Override phase must be either 'STRUCTURAL' or 'FINISHING'",
        )

    log = db.query(SiteProgressLogModel).filter(SiteProgressLogModel.id == log_id).first()
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Site log {log_id} not found",
        )

    log.user_override_phase = manual_phase_clean
    db.commit()
    db.refresh(log)
    return log
