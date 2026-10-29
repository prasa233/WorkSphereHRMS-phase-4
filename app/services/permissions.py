from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies import Actor, require_employee, require_hr_admin
from app.models.phase4 import Onboarding, Task


def can_manage_hr(actor: Actor) -> None:
    require_hr_admin(actor)


def can_access_onboarding(
    db: Session,
    actor: Actor,
    item: Onboarding,
) -> None:
    if actor.role in {"HR", "ADMIN"}:
        return

    employee_id = require_employee(actor)

    if item.employee_id != employee_id:
        raise HTTPException(403, "Access denied")


def can_access_task(actor: Actor, item: Task) -> None:
    if actor.role in { "EMPLOYEE","HR", "ADMIN"}:
        return

    employee_id = require_employee(actor)

    if item.assigned_to != employee_id:
        raise HTTPException(403, "Access denied")