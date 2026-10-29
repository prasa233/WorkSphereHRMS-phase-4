from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies import get_actor, get_db
from app.models.phase4 import NotificationPreference
from app.schemas.phase4 import PreferenceUpdate

# Replace these imports with your existing Phase 1–3 models
# and password utilities.
from app.models.user import User
from app.models.employee import Employee
from app.core.security import verify_password, hash_password

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get("")
def get_profile(
    actor=Depends(get_actor),
    db: Session = Depends(get_db),
):
    user = db.get(User, actor.user_id)
    if user is None:
        raise HTTPException(404, "User not found")

    employee = db.get(Employee, actor.employee_id) if actor.employee_id else None

    return {
        "user_id": user.id,
        "email": user.email,
        "full_name": getattr(employee, "full_name", None),
        "department": getattr(employee, "department", None),
    }


@router.post("/change-password")
def change_password(
    payload: dict,
    actor=Depends(get_actor),
    db: Session = Depends(get_db),
):
    current_password = payload.get("current_password")
    new_password = payload.get("new_password")

    if not isinstance(current_password, str):
        raise HTTPException(422, "Current password is required")

    if not isinstance(new_password, str) or len(new_password) < 12:
        raise HTTPException(
            422, "New password must contain at least 12 characters"
        )

    user = db.get(User, actor.user_id)
    if user is None:
        raise HTTPException(404, "User not found")

    # Confirm these field names match your existing User model.
    if not verify_password(current_password, user.password_hash):
        raise HTTPException(400, "Current password is incorrect")

    if current_password == new_password:
        raise HTTPException(400, "Choose a different password")

    user.password_hash = hash_password(new_password)
    db.commit()

    return {"message": "Password changed successfully"}