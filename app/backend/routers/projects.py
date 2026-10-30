"""Project CRUD endpoints."""

from __future__ import annotations

import json
from pathlib import Path
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.backend.database import get_db
from app.backend.models import ProjectModel, ActivityModel
from app.backend.schemas import ProjectCreate, ProjectResponse, ProjectUpdate

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db)):
    """Create a new construction project."""
    project = ProjectModel(
        name=payload.name,
        location=payload.location,
        built_up_area_sqft=payload.built_up_area_sqft,
        total_floors=payload.total_floors,
        total_flats=payload.total_flats,
        amount_collected_inr=payload.amount_collected_inr,
        contractual_deadline_days=payload.contractual_deadline_days,
        sbi_mclr_rate=payload.sbi_mclr_rate,
        resource_limits=payload.resource_limits,
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    # If initial activities provided, add them
    if payload.activities:
        for act in payload.activities:
            act_db = ActivityModel(
                project_id=project.id,
                activity_code=act.activity_code,
                name=act.name,
                duration_days=act.duration_days,
                crash_duration_days=act.crash_duration_days,
                normal_cost_inr=act.normal_cost_inr,
                crash_cost_inr=act.crash_cost_inr,
                predecessors=act.predecessors,
                resource_demands=act.resource_demands,
            )
            db.add(act_db)
        db.commit()
        db.refresh(project)

    return project


@router.get("", response_model=List[ProjectResponse])
def list_projects(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """List all registered construction projects."""
    return db.query(ProjectModel).offset(skip).limit(limit).all()


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    """Get project details and its current activities."""
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found",
        )
    return project


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(project_id: int, payload: ProjectUpdate, db: Session = Depends(get_db)):
    """Update project details."""
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found",
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(project, field, val)

    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: int, db: Session = Depends(get_db)):
    """Delete a project and its associated data."""
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found",
        )
    db.delete(project)
    db.commit()
    return None


@router.post("/{project_id}/load-sample-tasks", response_model=ProjectResponse)
def load_sample_tasks(project_id: int, db: Session = Depends(get_db)):
    """Populate project with the verified 20-activity Indian RCC construction benchmark dataset."""
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found",
        )

    # Load from sample_tasks.json
    sample_file = Path(__file__).resolve().parent.parent.parent / "engine" / "data" / "sample_tasks.json"
    if not sample_file.exists():
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Sample dataset file not found at {sample_file}",
        )

    with open(sample_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Remove existing activities
    db.query(ActivityModel).filter(ActivityModel.project_id == project_id).delete()

    # Update project resource limits if provided in sample
    if "resources" in data:
        project.resource_limits = data["resources"]

    for act in data.get("activities", []):
        act_db = ActivityModel(
            project_id=project.id,
            activity_code=act["id"],
            name=act["name"],
            duration_days=int(act["duration"]),
            crash_duration_days=int(act.get("crash_duration", act["duration"])),
            normal_cost_inr=float(act.get("normal_cost", 0.0)),
            crash_cost_inr=float(act.get("crash_cost", 0.0)),
            predecessors=act.get("predecessors", []),
            resource_demands=act.get("resources", {}),
        )
        db.add(act_db)

    db.commit()
    db.refresh(project)
    return project
