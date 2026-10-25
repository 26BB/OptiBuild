import uuid
from collections import defaultdict
from typing import Dict, List, Optional
from fastapi import APIRouter, File, UploadFile, HTTPException, Depends, Query, status
from sqlalchemy.orm import Session

from backend.app.schemas.materials import (
    MaterialLogItem,
    CreateMaterialLogRequest,
    MaterialLogSummary,
    PhotoClassificationResponse,
)
from backend.app.core.auth import get_current_user, require_roles
from backend.app.db.session import get_db
from backend.app.db.models import User, MaterialLogModel, Project
from backend.app.storage.s3 import storage
from backend.app.engine.classifier import SitePhotoClassifier

router = APIRouter(prefix="/materials", tags=["Material Log & Site Photo Classifier"])


@router.get("/log", response_model=MaterialLogSummary)
def get_material_log(
    project_id: Optional[str] = Query(None, description="Optional project ID to filter materials"),
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns real logged material entries from the database, category totals,
    and grand total expenditure for the selected project (or all projects).
    """
    query = db.query(MaterialLogModel)
    if project_id:
        query = query.filter(MaterialLogModel.project_id == project_id)

    db_entries = query.order_by(MaterialLogModel.date.desc(), MaterialLogModel.created_at.desc()).all()

    category_totals: Dict[str, float] = defaultdict(float)
    items: List[MaterialLogItem] = []

    for entry in db_entries:
        total = float(entry.total_amount)
        category_totals[entry.material_category] += total
        items.append(
            MaterialLogItem(
                entry_id=entry.entry_id,
                project_id=entry.project_id,
                date=entry.date,
                material_category=entry.material_category,
                item_description=entry.item_description or entry.material_category,
                quantity=float(entry.quantity),
                unit=entry.unit,
                unit_rate=float(entry.unit_rate),
                total_cost=total,
                vendor_name=entry.supplier_name,
                invoice_number=entry.invoice_no,
                wbs_code=entry.wbs_code,
                bill_photo_name=entry.bill_attachment_url.split("/")[-1] if entry.bill_attachment_url else None,
                bill_photo_url=entry.bill_attachment_url,
                is_unparsed_evidence=True,
            )
        )

    grand_total = sum(i.total_cost for i in items)

    return MaterialLogSummary(
        total_expenditure=round(grand_total, 2),
        total_entries_count=len(items),
        category_totals={k: round(v, 2) for k, v in category_totals.items()},
        items=items,
    )


@router.post("/log", response_model=MaterialLogItem)
def create_material_entry(
    payload: CreateMaterialLogRequest,
    current_user: User = Depends(require_roles("store_keeper", "project_manager", "admin")),
    db: Session = Depends(get_db),
):
    """
    Creates a new material receipt record in the database.
    Permitted for Store Keepers, Project Managers, and Admins.
    """
    # Count existing entries to format entry_id MAT-XXX
    count = db.query(MaterialLogModel).count()
    entry_id = f"MAT-{count + 1:04d}"

    total_cost = round(payload.quantity * payload.unit_rate, 2)

    db_entry = MaterialLogModel(
        entry_id=entry_id,
        project_id=payload.project_id,
        date=payload.date,
        material_category=payload.material_category,
        item_description=payload.item_description,
        wbs_code=payload.wbs_code,
        quantity=payload.quantity,
        unit=payload.unit,
        unit_rate=payload.unit_rate,
        total_amount=total_cost,
        supplier_name=payload.vendor_name,
        invoice_no=payload.invoice_number or "UNSPECIFIED",
        bill_attachment_url=payload.bill_photo_url,
        logged_by_id=current_user.id,
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)

    return MaterialLogItem(
        entry_id=db_entry.entry_id,
        project_id=db_entry.project_id,
        date=db_entry.date,
        material_category=db_entry.material_category,
        item_description=db_entry.item_description or "",
        quantity=db_entry.quantity,
        unit=db_entry.unit,
        unit_rate=db_entry.unit_rate,
        total_cost=db_entry.total_amount,
        vendor_name=db_entry.supplier_name,
        invoice_number=db_entry.invoice_no,
        wbs_code=db_entry.wbs_code,
        bill_photo_name=payload.bill_photo_name,
        bill_photo_url=db_entry.bill_attachment_url,
        is_unparsed_evidence=True,
    )


@router.post("/upload-bill")
async def upload_bill_evidence(
    file: UploadFile = File(...),
    current_user: User = Depends(require_roles("store_keeper", "project_manager", "admin")),
):
    """
    Stores an invoice receipt or weighbridge slip in object storage.
    LOCKED RULE: Bill photos are stored as UNPARSED documentary evidence only.
    """
    content = await file.read()
    file_url = storage.upload_bill_evidence(content, file.filename)
    return {
        "status": "STORED",
        "file_name": file.filename,
        "file_url": file_url,
        "is_unparsed_evidence": True,
        "message": "Bill receipt uploaded and stored as unparsed evidence.",
    }


@router.post("/classify-photo", response_model=PhotoClassificationResponse)
async def classify_site_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(require_roles("site_engineer", "project_manager", "admin")),
):
    """
    Classifies a site construction photo using edge density & surface planar analysis heuristics.
    """
    content = await file.read()
    try:
        return SitePhotoClassifier.classify_image_bytes(content, file.filename)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Classification failed: {str(e)}",
        )
