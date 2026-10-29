from dataclasses import dataclass

from fastapi import Depends, HTTPException

from app.core.security import get_current_user


@dataclass
class Actor:
    user_id: int
    employee_id: int | None
    role: str


def get_actor(current_user=Depends(get_current_user)) -> Actor:
    """Map the authenticated user to the Phase 4 actor."""

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