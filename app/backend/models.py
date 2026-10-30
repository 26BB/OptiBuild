"""SQLAlchemy ORM models for OptiBuild."""

from __future__ import annotations

import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey,
    JSON,
    Boolean,
    Text,
)
from sqlalchemy.orm import relationship

from app.backend.database import Base


def utc_now():
    return datetime.datetime.now(datetime.timezone.utc)


class ProjectModel(Base):
    """Construction project registered in OptiBuild."""
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    location = Column(String(255), default="Pune, Maharashtra")
    built_up_area_sqft = Column(Float, default=0.0)
    total_floors = Column(Integer, default=1)
    total_flats = Column(Integer, default=1)
    amount_collected_inr = Column(Float, default=0.0)
    contractual_deadline_days = Column(Integer, default=0)
    sbi_mclr_rate = Column(Float, default=8.85)
    resource_limits = Column(JSON, default=dict)
    created_at = Column(DateTime, default=utc_now)

    # Relationships
    activities = relationship(
        "ActivityModel", back_populates="project", cascade="all, delete-orphan"
    )
    optimization_results = relationship(
        "OptimizationResultModel", back_populates="project", cascade="all, delete-orphan"
    )
    progress_logs = relationship(
        "SiteProgressLogModel", back_populates="project", cascade="all, delete-orphan"
    )


class ActivityModel(Base):
    """Activity or work package in a project's WBS/network."""
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    activity_code = Column(String(50), nullable=False)  # e.g. "A1", "A2"
    name = Column(String(255), nullable=False)
    duration_days = Column(Integer, nullable=False, default=1)
    crash_duration_days = Column(Integer, nullable=False, default=1)
    normal_cost_inr = Column(Float, default=0.0)
    crash_cost_inr = Column(Float, default=0.0)
    predecessors = Column(JSON, default=list)  # list of activity_codes e.g. ["A1", "A2"]
    resource_demands = Column(JSON, default=dict)  # e.g. {"masons": 6, "laborers": 10}

    project = relationship("ProjectModel", back_populates="activities")


class OptimizationResultModel(Base):
    """Persisted optimization run and statutory decision."""
    __tablename__ = "optimization_results"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    solver_mode = Column(String(50), default="BENCHMARK")  # "CPM", "GA", "CPSAT", "BENCHMARK"
    unconstrained_cpm_makespan = Column(Integer, default=0)
    ga_makespan = Column(Integer, default=0)
    cpsat_makespan = Column(Integer, default=0)
    optimality_gap_pct = Column(Float, default=0.0)
    final_makespan_days = Column(Integer, default=0)
    delay_days = Column(Integer, default=0)
    penalty_amount_inr = Column(Float, default=0.0)
    total_crash_cost_inr = Column(Float, default=0.0)
    recommendation = Column(String(50), default="ON_SCHEDULE")  # "CRASH", "ACCEPT_PENALTY", etc.
    savings_inr = Column(Float, default=0.0)
    schedule_json = Column(JSON, default=dict)
    crash_breakdown_json = Column(JSON, default=list)
    created_at = Column(DateTime, default=utc_now)

    project = relationship("ProjectModel", back_populates="optimization_results")


class SiteProgressLogModel(Base):
    """Weekly site visual inspection and phase detection."""
    __tablename__ = "site_progress_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    week_number = Column(Integer, default=1)
    phase_detected = Column(String(50), default="UNKNOWN")  # "STRUCTURAL", "FINISHING"
    confidence = Column(Float, default=0.0)
    image_url_or_path = Column(String(500), nullable=True)
    user_override_phase = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    project = relationship("ProjectModel", back_populates="progress_logs")
