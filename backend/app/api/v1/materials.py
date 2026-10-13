from collections import defaultdict
from typing import Dict, List, Optional
from fastapi import APIRouter, File, UploadFile, HTTPException

from backend.app.schemas.materials import (
    MaterialLogItem,
    CreateMaterialLogRequest,
    MaterialLogSummary,
    PhotoClassificationResponse,
)
from backend.app.engine.classifier import SitePhotoClassifier

router = APIRouter(prefix="/materials", tags=["Material Log & Site Photo Classifier"])

# Seed in-memory store with realistic site materials
MATERIAL_LOG_STORE: List[MaterialLogItem] = [
    MaterialLogItem(
        entry_id="MAT-001",
        date="2026-10-02",
        material_category="RMC Concrete",
        item_description="M25 Grade Ready Mix Concrete for Raft Footing",
        quantity=120.0,
        unit="Cu.m",
        unit_rate=4500.0,
        total_cost=540000.0,
        vendor_name="ACC Concrete Solutions",
        invoice_number="INV-ACC-9821",
        wbs_code="WBS-1.2",
        bill_photo_name="rmc_batch_slip_9821.pdf",
        is_unparsed_evidence=True,
    ),
    MaterialLogItem(
        entry_id="MAT-002",
        date="2026-10-05",
        material_category="Steel / Rebar",
        item_description="Fe 500D TMT Reinforcement Steel (12mm & 16mm)",
        quantity=18.0,
        unit="MT",
        unit_rate=58000.0,
        total_cost=1044000.0,
        vendor_name="Tata Tiscon Distributors",
        invoice_number="INV-TT-4412",
        wbs_code="WBS-2.1",
        bill_photo_name="tata_tiscon_weighbridge_slip.jpg",
        is_unparsed_evidence=True,
    ),
    MaterialLogItem(
        entry_id="MAT-003",
        date="2026-10-08",
        material_category="Cement",
        item_description="53 Grade OPC Bags (Foundation & Columns)",
        quantity=600.0,
        unit="Bags",
        unit_rate=385.0,
        total_cost=231000.0,
        vendor_name="UltraTech Cement Depot",
        invoice_number="INV-UT-1049",
        wbs_code="WBS-2.2",
        bill_photo_name=None,
        is_unparsed_evidence=True,
    ),
    MaterialLogItem(
        entry_id="MAT-004",
        date="2026-10-10",
        material_category="AAC Blocks",
        item_description="Autoclaved Aerated Concrete Blocks (600x200x150mm)",
        quantity=2400.0,
        unit="Nos",
        unit_rate=65.0,
        total_cost=156000.0,
        vendor_name="Siporex Blocks Pvt Ltd",
        invoice_number="INV-SIP-3011",
        wbs_code="WBS-3.1",
        bill_photo_name="siporex_delivery_challan.png",
        is_unparsed_evidence=True,
    ),
    MaterialLogItem(
        entry_id="MAT-005",
        date="2026-10-12",
        material_category="Sand & Aggregates",
        item_description="Crushed Sand (VSI) & 20mm Blue Metal Aggregates",
        quantity=45.0,
        unit="Brass",
        unit_rate=7200.0,
        total_cost=324000.0,
        vendor_name="Shinde Stone Crushers",
        invoice_number="INV-SSC-0842",
        wbs_code="WBS-1.2",
        bill_photo_name="quarry_receipt_0842.jpg",
        is_unparsed_evidence=True,
    ),
]


@router.get("/log", response_model=MaterialLogSummary)
def get_material_log():
    """
    Returns all logged material entries, category totals, and grand total expenditure.
    """
    total = sum(item.total_cost for item in MATERIAL_LOG_STORE)
    cats = defaultdict(float)
    for item in MATERIAL_LOG_STORE:
        cats[item.material_category] += item.total_cost

    return MaterialLogSummary(
        total_expenditure=round(total, 2),
        total_entries_count=len(MATERIAL_LOG_STORE),
        category_totals=dict(cats),
        items=MATERIAL_LOG_STORE,
    )


@router.post("/log", response_model=MaterialLogItem)
def add_material_entry(payload: CreateMaterialLogRequest):
    """
    Records a material expenditure.
    LOCKED RULE: Bill photos are stored as unparsed documentary evidence only.
    """
    total = round(payload.quantity * payload.unit_rate, 2)
    new_id = f"MAT-{len(MATERIAL_LOG_STORE) + 1:03d}"

    entry = MaterialLogItem(
        entry_id=new_id,
        date=payload.date,
        material_category=payload.material_category,
        item_description=payload.item_description,
        quantity=payload.quantity,
        unit=payload.unit,
        unit_rate=payload.unit_rate,
        total_cost=total,
        vendor_name=payload.vendor_name,
        invoice_number=payload.invoice_number,
        wbs_code=payload.wbs_code,
        bill_photo_name=payload.bill_photo_name,
        bill_photo_url=payload.bill_photo_url,
        is_unparsed_evidence=True,
    )
    MATERIAL_LOG_STORE.append(entry)
    return entry


@router.post("/classify-photo", response_model=PhotoClassificationResponse)
async def classify_site_photo(file: UploadFile = File(...)):
    """
    Uploads a site progress photo and classifies it into STRUCTURAL_STAGE or FINISHING_STAGE.
    LOCKED RULE: Binary classification only, not object detection. AI is not mandatory.
    """
    content = await file.read()
    return SitePhotoClassifier.classify_image_bytes(content, file_name=file.filename or "site_photo.jpg")
