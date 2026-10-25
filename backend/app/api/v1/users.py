from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.auth import get_current_user, require_roles, hash_password
from backend.app.db.session import get_db
from backend.app.db.models import User, ProjectMember, Project
from backend.app.schemas.auth import (
    UserProfile,
    CreateUserRequest,
    ProjectMemberItem,
    AddProjectMemberRequest,
)

router = APIRouter(prefix="/users", tags=["User & Membership Administration"])


@router.get("", response_model=List[UserProfile])
def list_users(
    current_user: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    Returns all registered users in the organization (admin only).
    """
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [UserProfile.model_validate(u) for u in users]


@router.post("", response_model=UserProfile)
def create_user(
    payload: CreateUserRequest,
    current_user: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    """
    Creates a new user with an assigned role (admin only).
    """
    existing = db.query(User).filter(User.email == payload.email.strip().lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with email '{payload.email}' already exists.",
        )

    user = User(
        email=payload.email.strip().lower(),
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name.strip(),
        role=payload.role.strip(),
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserProfile.model_validate(user)
