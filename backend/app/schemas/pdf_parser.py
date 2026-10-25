from typing import Dict, Optional
from pydantic import BaseModel, Field


class MahaRERAPreFillDraft(BaseModel):
    project_name: Optional[str] = Field(None, description="Extracted project name")
    rera_registration_no: Optional[str] = Field(None, description="Format P5XXXXXXXXXX")
    promoter_name: Optional[str] = Field(None, description="Developer / promoter company name")
    proposed_completion_date: Optional[str] = Field(None, description="Target handover date")
    plot_area_sqft: Optional[float] = Field(None, description="Plot area converted to sq.ft.")
    built_up_area_sqft: Optional[float] = Field(None, description="Sanctioned built-up / FSI area in sq.ft.")
    carpet_area_sqft: Optional[float] = Field(None, description="Total carpet area in sq.ft.")
    number_of_floors: Optional[int] = Field(None, description="Total floors count")
    number_of_basements: Optional[int] = Field(None, description="Basements count")
    total_project_cost: Optional[float] = Field(None, description="Estimated project cost in INR")
    confidence_scores: Dict[str, str] = Field(
        default_factory=dict,
        description="Confidence per field: 'HIGH', 'MEDIUM', 'INFERRED', 'NOT_FOUND'"
    )
    raw_text_snippet: Optional[str] = None
    raw_pdf_url: Optional[str] = None
    requires_user_confirmation: bool = Field(
        default=True,
        description="LOCKED RULE: User confirmation is compulsory before saving"
    )
    is_confirmed: bool = Field(default=False)


class ConfirmRERADraftRequest(BaseModel):
    project_name: str
    rera_registration_no: str
    promoter_name: Optional[str] = None
    proposed_completion_date: str
    plot_area_sqft: float
    built_up_area_sqft: float
    carpet_area_sqft: Optional[float] = None
    number_of_floors: int
    number_of_basements: int = 0
    total_project_cost: Optional[float] = None
    raw_pdf_url: Optional[str] = None
    user_notes: Optional[str] = None


class ConfirmRERADraftResponse(BaseModel):
    status: str = "CONFIRMED"
    project_id: str
    project_name: str
    rera_registration_no: str
    message: str = "MahaRERA draft confirmed and verified by user. Saved successfully."
    confirmed_data: ConfirmRERADraftRequest
