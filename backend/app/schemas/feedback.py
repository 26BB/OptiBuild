from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


ALLOWED_REPORT_TYPES = {"BUG", "FEEDBACK", "FEATURE_REQUEST"}
ALLOWED_CATEGORIES = {
    "SCHEDULER",
    "OPTIMIZER_GA",
    "RERA_PARSER",
    "MATERIALS",
    "DRAWINGS",
    "UI_UX",
    "GENERAL",
}
ALLOWED_SEVERITIES = {"LOW", "MEDIUM", "HIGH", "CRITICAL"}
ALLOWED_STATUSES = {"OPEN", "TRIAGED", "IN_PROGRESS", "RESOLVED", "CLOSED"}


class FeedbackCreate(BaseModel):
    report_type: str = Field(..., description="Report category: BUG, FEEDBACK, FEATURE_REQUEST")
    title: str = Field(..., min_length=3, max_length=255, description="Concise summary of feedback or bug")
    description: str = Field(..., min_length=5, description="Detailed reproduction steps or commentary")
    category: Optional[str] = Field(default="GENERAL", description="Subsystem category")
    severity: Optional[str] = Field(default="MEDIUM", description="Severity level: LOW, MEDIUM, HIGH, CRITICAL")
    rating: Optional[int] = Field(default=None, ge=1, le=5, description="Optional 1-5 user satisfaction score")
    project_id: Optional[str] = Field(default=None, description="Associated OptiBuild project ID")
    telemetry_data: Optional[Dict[str, Any]] = Field(default=None, description="Client environment & state metadata")
    attachment_url: Optional[str] = Field(default=None, description="Unparsed screenshot or log file URL (INV-3)")

    @field_validator("report_type")
    @classmethod
    def validate_report_type(cls, v: str) -> str:
        upper = v.strip().upper()
        if upper not in ALLOWED_REPORT_TYPES:
            raise ValueError(f"Invalid report_type '{v}'. Must be one of: {sorted(list(ALLOWED_REPORT_TYPES))}")
        return upper

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: Optional[str]) -> str:
        if not v:
            return "GENERAL"
        upper = v.strip().upper()
        if upper not in ALLOWED_CATEGORIES:
            return "GENERAL"
        return upper

    @field_validator("severity")
    @classmethod
    def validate_severity(cls, v: Optional[str]) -> str:
        if not v:
            return "MEDIUM"
        upper = v.strip().upper()
        if upper not in ALLOWED_SEVERITIES:
            return "MEDIUM"
        return upper


class FeedbackUpdate(BaseModel):
    status: Optional[str] = Field(default=None, description="OPEN, TRIAGED, IN_PROGRESS, RESOLVED, CLOSED")
    admin_notes: Optional[str] = Field(default=None, description="Internal notes added by site admin")
    jira_issue_key: Optional[str] = Field(default=None, description="Linked Jira Cloud issue key (e.g. SCRUM-101)")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        upper = v.strip().upper()
        if upper not in ALLOWED_STATUSES:
            raise ValueError(f"Invalid status '{v}'. Must be one of: {sorted(list(ALLOWED_STATUSES))}")
        return upper


class FeedbackResponse(BaseModel):
    id: str
    report_type: str
    title: str
    description: str
    category: str
    severity: str
    rating: Optional[int] = None
    status: str
    telemetry_data: Optional[Dict[str, Any]] = None
    attachment_url: Optional[str] = None
    jira_issue_key: Optional[str] = None
    submitted_by_id: Optional[str] = None
    project_id: Optional[str] = None
    admin_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FeedbackStatsResponse(BaseModel):
    total_submissions: int
    total_bugs: int
    total_feedback: int
    open_bugs: int
    resolved_bugs: int
    average_rating: Optional[float] = None
    category_breakdown: Dict[str, int]
