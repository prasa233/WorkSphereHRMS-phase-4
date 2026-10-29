from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db.session import get_db

# Replace this import with the actual authentication dependency
# from your existing Phase 1-3 application.
from app.app.core.security import get_current_user

@dataclass
class Actor:
    user_id: int
    employee_id: int | None
    role: str


def get_actor(current_user=Depends(get_current_user)) -> Actor:
    if isinstance(current_user, dict):
        user_id = current_user.get("id")
        role = current_user.get("role")
        employee_id = current_user.get("employee_id")
    else:
        user_id = getattr(current_user, "id", None)
        role = getattr(current_user, "role", None)
        employee_id = getattr(current_user, "employee_id", None)

    if user_id is None or role is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid authenticated user",
        )

    return Actor(
        user_id=int(user_id),
        employee_id=int(employee_id) if employee_id is not None else None,
        role=str(role).upper(),
    )


def require_employee(actor: Actor) -> int:
    if actor.employee_id is None:
        raise HTTPException(
            status_code=403,
            detail="No employee profile is linked to this account",
        )
    return actor.employee_id


def require_hr_admin(actor: Actor) -> None:
    if actor.role not in {"HR", "ADMIN"}:
        raise HTTPException(
            status_code=403,
            detail="HR/Admin permission required",
        )


DB = Annotated[Session, Depends(get_db)]
CurrentActor = Annotated[Actor, Depends(get_actor)]