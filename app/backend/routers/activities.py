"""Activity management endpoints."""

from __future__ import annotations

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.backend.database import get_db
from app.backend.models import ProjectModel, ActivityModel
from app.backend.schemas import ActivityCreate, ActivityResponse

router = APIRouter(prefix="/activities", tags=["Activities"])


@router.post("/{project_id}", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED)
def add_activity(project_id: int, payload: ActivityCreate, db: Session = Depends(get_db)):
    """Add a single activity to a project."""
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project {project_id} not found"
        )

    # Check for duplicate activity_code in this project
    existing = db.query(ActivityModel).filter(
        ActivityModel.project_id == project_id,
        ActivityModel.activity_code == payload.activity_code,
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Activity code '{payload.activity_code}' already exists in this project",
        )

    act_db = ActivityModel(
        project_id=project_id,
        activity_code=payload.activity_code,
        name=payload.name,
        duration_days=payload.duration_days,
        crash_duration_days=payload.crash_duration_days,
        normal_cost_inr=payload.normal_cost_inr,
        crash_cost_inr=payload.crash_cost_inr,
        predecessors=payload.predecessors,
        resource_demands=payload.resource_demands,
    )
    db.add(act_db)
    db.commit()
    db.refresh(act_db)
    return act_db


@router.post("/{project_id}/bulk", response_model=List[ActivityResponse], status_code=status.HTTP_201_CREATED)
def bulk_add_activities(project_id: int, payload: List[ActivityCreate], db: Session = Depends(get_db)):
    """Bulk create activities for a project."""
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project {project_id} not found"
        )

    created = []
    for item in payload:
        act_db = ActivityModel(
            project_id=project_id,
            activity_code=item.activity_code,
            name=item.name,
            duration_days=item.duration_days,
            crash_duration_days=item.crash_duration_days,
            normal_cost_inr=item.normal_cost_inr,
            crash_cost_inr=item.crash_cost_inr,
            predecessors=item.predecessors,
            resource_demands=item.resource_demands,
        )
        db.add(act_db)
        created.append(act_db)

    db.commit()
    for item in created:
        db.refresh(item)
    return created


@router.get("/{project_id}", response_model=List[ActivityResponse])
def list_activities(project_id: int, db: Session = Depends(get_db)):
    """Get all activities for a project ordered by ID."""
    return db.query(ActivityModel).filter(ActivityModel.project_id == project_id).all()


@router.delete("/single/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_activity(activity_id: int, db: Session = Depends(get_db)):
    """Delete an individual activity."""
    act = db.query(ActivityModel).filter(ActivityModel.id == activity_id).first()
    if not act:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Activity {activity_id} not found"
        )
    db.delete(act)
    db.commit()
    return None
