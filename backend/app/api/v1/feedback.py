import logging
from typing import List, Optional
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Request, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.core.auth import (
    get_current_user,
    require_roles,
    decode_access_token,
    security_scheme,
)
from backend.app.core.jira import jira_service
from backend.app.db.models import FeedbackReportModel, User
from backend.app.db.session import get_db, SessionLocal
from backend.app.schemas.feedback import (
    FeedbackCreate,
    FeedbackResponse,
    FeedbackStatsResponse,
    FeedbackUpdate,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/feedback", tags=["Feedback & Bug Telemetry"])


async def get_optional_current_user(
    request: Request,
    bearer: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """
    Extracts user if valid Bearer token or cookie is present.
    Allows guest and unauthenticated telemetry submissions.
    """
    token: Optional[str] = None
    if bearer and bearer.credentials:
        token = bearer.credentials
    elif "access_token" in request.cookies:
        token = request.cookies.get("access_token")

    if not token:
        return None

    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if not user_id:
            return None
        user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
        return user
    except Exception:
        return None


async def sync_jira_ticket_background(report_id: str):
    """
    Background worker that pushes feedback to Jira Cloud and links the issue key.
    Runs in an isolated session to prevent lifecycle leaks.
    """
    db = SessionLocal()
    try:
        report = db.query(FeedbackReportModel).filter(FeedbackReportModel.id == report_id).first()
        if not report:
            return
        jira_key = await jira_service.create_issue_async(
            report_type=report.report_type,
            title=report.title,
            description=report.description,
            category=report.category,
            severity=report.severity,
            project_id=report.project_id,
            telemetry_data=report.telemetry_data,
            attachment_url=report.attachment_url,
        )
        if jira_key:
            report.jira_issue_key = jira_key
            db.commit()
    except Exception as exc:
        logger.warning("Background Jira sync failed for report %s: %s", report_id, exc)
        db.rollback()
    finally:
        db.close()


@router.post("", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
async def submit_feedback(
    payload: FeedbackCreate,
    background_tasks: BackgroundTasks,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """
    Submits user feedback, bug report, or feature request.
    Publicly accessible to authenticated and guest users.
    Dispatches Jira Cloud ticket creation asynchronously via BackgroundTasks.
    """
    report = FeedbackReportModel(
        report_type=payload.report_type,
        title=payload.title,
        description=payload.description,
        category=payload.category or "GENERAL",
        severity=payload.severity or "MEDIUM",
        rating=payload.rating,
        status="OPEN",
        telemetry_data=payload.telemetry_data,
        attachment_url=payload.attachment_url,
        project_id=payload.project_id,
        submitted_by_id=current_user.id if current_user else None,
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    if jira_service.is_configured:
        background_tasks.add_task(sync_jira_ticket_background, report.id)

    return report


@router.get("", response_model=List[FeedbackResponse])
def list_feedback_reports(
    report_type: Optional[str] = Query(None, description="Filter by BUG, FEEDBACK, FEATURE_REQUEST"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
    severity: Optional[str] = Query(None, description="Filter by LOW, MEDIUM, HIGH, CRITICAL"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(require_roles("admin", "project_manager")),
    db: Session = Depends(get_db),
):
    """
    Lists submitted feedback and bug reports. Restricted to admin and project_manager roles.
    """
    query = db.query(FeedbackReportModel)
    if report_type:
        query = query.filter(FeedbackReportModel.report_type == report_type.strip().upper())
    if status_filter:
        query = query.filter(FeedbackReportModel.status == status_filter.strip().upper())
    if severity:
        query = query.filter(FeedbackReportModel.severity == severity.strip().upper())

    reports = query.order_by(FeedbackReportModel.created_at.desc()).offset(skip).limit(limit).all()
    return reports


@router.get("/stats", response_model=FeedbackStatsResponse)
def get_feedback_statistics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns aggregated feedback and bug telemetry statistics for evaluation and administration.
    """
    total_submissions = db.query(FeedbackReportModel).count()
    total_bugs = db.query(FeedbackReportModel).filter(FeedbackReportModel.report_type == "BUG").count()
    total_feedback = db.query(FeedbackReportModel).filter(FeedbackReportModel.report_type == "FEEDBACK").count()

    open_bugs = (
        db.query(FeedbackReportModel)
        .filter(
            FeedbackReportModel.report_type == "BUG",
            FeedbackReportModel.status.in_(["OPEN", "TRIAGED", "IN_PROGRESS"]),
        )
        .count()
    )

    resolved_bugs = (
        db.query(FeedbackReportModel)
        .filter(
            FeedbackReportModel.report_type == "BUG",
            FeedbackReportModel.status.in_(["RESOLVED", "CLOSED"]),
        )
        .count()
    )

    avg_rating_row = db.query(func.avg(FeedbackReportModel.rating)).filter(FeedbackReportModel.rating.isnot(None)).scalar()
    average_rating = round(float(avg_rating_row), 2) if avg_rating_row is not None else None

    # Category breakdown
    cat_rows = (
        db.query(FeedbackReportModel.category, func.count(FeedbackReportModel.id))
        .group_by(FeedbackReportModel.category)
        .all()
    )
    category_breakdown = {cat: count for cat, count in cat_rows}

    return FeedbackStatsResponse(
        total_submissions=total_submissions,
        total_bugs=total_bugs,
        total_feedback=total_feedback,
        open_bugs=open_bugs,
        resolved_bugs=resolved_bugs,
        average_rating=average_rating,
        category_breakdown=category_breakdown,
    )


@router.get("/{feedback_id}", response_model=FeedbackResponse)
def get_feedback_report(
    feedback_id: str,
    current_user: User = Depends(require_roles("admin", "project_manager")),
    db: Session = Depends(get_db),
):
    """
    Retrieves details of a specific feedback report by ID.
    """
    report = db.query(FeedbackReportModel).filter(FeedbackReportModel.id == feedback_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Feedback report '{feedback_id}' not found.",
        )
    return report


@router.patch("/{feedback_id}", response_model=FeedbackResponse)
def update_feedback_report(
    feedback_id: str,
    payload: FeedbackUpdate,
    current_user: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    Updates status, admin notes, or Jira ticket key. Strictly restricted to admin role.
    """
    report = db.query(FeedbackReportModel).filter(FeedbackReportModel.id == feedback_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Feedback report '{feedback_id}' not found.",
        )

    if payload.status is not None:
        report.status = payload.status
    if payload.admin_notes is not None:
        report.admin_notes = payload.admin_notes
    if payload.jira_issue_key is not None:
        report.jira_issue_key = payload.jira_issue_key

    db.commit()
    db.refresh(report)
    return report
