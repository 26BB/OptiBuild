from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class MaterialLogItem(BaseModel):
    entry_id: str = Field(..., description="Unique record code, e.g. MAT-001")
    project_id: Optional[str] = None
    date: str = Field(..., description="Date of receipt (YYYY-MM-DD)")
    material_category: str = Field(
        ...,
        description="Cement | Steel / Rebar | RMC Concrete | Sand & Aggregates | AAC Blocks | Electrical | Plumbing | Paint & Tiles"
    )
    item_description: str
    quantity: float = Field(..., gt=0)
    unit: str = Field(..., description="Bags | MT | Cu.m | Sq.ft | Running Mtr | Nos")
    unit_rate: float = Field(..., gt=0, description="Rate per unit in INR")
    total_cost: float = Field(..., ge=0, description="quantity * unit_rate")
    vendor_name: str
    invoice_number: Optional[str] = None
    wbs_code: Optional[str] = Field(None, description="Linked WBS code, e.g. WBS-1.2")
    bill_photo_name: Optional[str] = None
    bill_photo_url: Optional[str] = None
    is_unparsed_evidence: bool = Field(
        default=True,
        description="LOCKED RULE: Bill photos are strictly stored as unparsed documentary evidence"
    )


class CreateMaterialLogRequest(BaseModel):
    project_id: Optional[str] = None
    date: str
    material_category: str
    item_description: str
    quantity: float
    unit: str
    unit_rate: float
    vendor_name: str
    invoice_number: Optional[str] = None
    wbs_code: Optional[str] = None
    bill_photo_name: Optional[str] = None
    bill_photo_url: Optional[str] = None


class MaterialLogSummary(BaseModel):
    total_expenditure: float
    total_entries_count: int
    category_totals: Dict[str, float]
    items: List[MaterialLogItem]


class PhotoClassificationResponse(BaseModel):
    predicted_stage: str = Field(
        ...,
        description="'STRUCTURAL_STAGE' or 'FINISHING_STAGE'"
    )
    stage_label: str
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    detected_features: List[str]
    file_name: str
    file_size_bytes: int
    human_verified: bool = False
