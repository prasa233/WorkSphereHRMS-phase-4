import csv
import io
from datetime import date

from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.app.api.dependencies import (
    DB, CurrentActor, require_employee, require_hr_admin,
)
from app.models.phase4 import (
    Onboarding, Resignation, Announcement,
    Task, Feedback, NotificationPreference,
)
from app.schemas.phase4 import (
    OnboardingCreate, TaskStatusUpdate,
    ResignationCreate, ResignationDecision,
    AnnouncementCreate, TaskCreate,
    FeedbackCreate, ProfileUpdate, PreferenceUpdate,
)
from app.services.permissions import (
    can_access_onboarding, can_access_task,
)

router = APIRouter(prefix="/phase4", tags=["Phase 4"])


def serialize(item):
    return {
        column.name: getattr(item, column.name)
        for column in item.__table__.columns
    }
@router.post("/onboarding", status_code=201)
def create_onboarding(
    data: OnboardingCreate,
    db: DB,
    actor: CurrentActor,
):
    if actor.role not in {"EMPLOYEE", "HR", "ADMIN"}:
        raise HTTPException(
        status_code=403,
        detail="Employee, HR, or Admin permission required",
    )

    item = Onboarding(
        employee_id=data.employee_id,
        task_name=data.task_name,
        due_date=data.due_date,
        status="PENDING",
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return serialize(item)
@router.get("/onboarding")
def list_onboarding(db: DB, actor: CurrentActor):
    query = db.query(Onboarding)

    if actor.role not in {"HR", "ADMIN"}:
        employee_id = require_employee(actor)
        query = query.filter(
            Onboarding.employee_id == employee_id
        )

    return [serialize(item) for item in query.all()]


@router.patch("/onboarding/{item_id}/status")
def update_onboarding(
    item_id: int,
    data: TaskStatusUpdate,
    db: DB,
    actor: CurrentActor,
):
    item = db.get(Onboarding, item_id)

    if item is None:
        raise HTTPException(404, "Onboarding task not found")

    can_access_onboarding(db, actor, item)
    item.status = data.status
    db.commit()
    db.refresh(item)
    return serialize(item)


@router.get("/onboarding/progress")
def onboarding_progress(db: DB, actor: CurrentActor):
    query = db.query(Onboarding)

    if actor.role not in {"HR", "ADMIN"}:
        query = query.filter(
            Onboarding.employee_id == require_employee(actor)
        )

    total = query.count()
    completed = query.filter(
        Onboarding.status == "COMPLETED"
    ).count()

    return {
        "total": total,
        "completed": completed,
        "pending": total - completed,
        "percentage": round(completed * 100 / total) if total else 0,
    }




@router.post("/resignations", status_code=201)
def submit_resignation(
    data: ResignationCreate,
    db: DB,
    actor: CurrentActor,
):
    employee_id = require_employee(actor)

    pending = db.query(Resignation).filter(
        Resignation.employee_id == employee_id,
        Resignation.status == "PENDING",
    ).first()

    if pending:
        raise HTTPException(409, "A resignation is already pending")

    item = Resignation(
        employee_id=employee_id,
        reason=data.reason,
        notice_period=data.notice_period,
        status="PENDING",
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return serialize(item)


@router.get("/resignations")
def list_resignations(db: DB, actor: CurrentActor):
    query = db.query(Resignation)

    if actor.role not in {"HR", "ADMIN"}:
        query = query.filter(
            Resignation.employee_id == require_employee(actor)
        )

    return [
        serialize(item)
        for item in query.order_by(
            Resignation.created_at.desc()
        ).all()
    ]


@router.patch("/resignations/{item_id}/decision")
def decide_resignation(
    item_id: int,
    data: ResignationDecision,
    db: DB,
    actor: CurrentActor,
):
    require_hr_admin(actor)

    item = db.get(Resignation, item_id)
    if item is None:
        raise HTTPException(404, "Resignation not found")

    if item.status != "PENDING":
        raise HTTPException(409, "Resignation already processed")

    item.status = data.status
    db.commit()
    db.refresh(item)
    return serialize(item)




@router.post("/announcements", status_code=201)
def create_announcement(
    data: AnnouncementCreate,
    db: DB,
    actor: CurrentActor,
):
    if actor.role not in {"EMPLOYEE", "HR", "ADMIN"}:
        raise HTTPException(
            status_code=403,
            detail="Employee, HR, or Admin permission required",
        )

    item = Announcement(
        title=data.title,
        message=data.message,
        created_by=actor.user_id,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return serialize(item)


@router.get("/announcements")
def list_announcements(db: DB, actor: CurrentActor):
    items = db.query(Announcement).order_by(
        Announcement.created_at.desc()
    ).all()
    return [serialize(item) for item in items]


@router.get("/announcements/{item_id}")
def get_announcement(
    item_id: int,
    db: DB,
    actor: CurrentActor,
):
    item = db.get(Announcement, item_id)
    if item is None:
        raise HTTPException(404, "Announcement not found")
    return serialize(item)



@router.post("/tasks", status_code=201)
def create_task(
    data: TaskCreate,
    db: DB,
    actor: CurrentActor,
):
     if actor.role not in {"EMPLOYEE", "HR", "ADMIN"}:
            raise HTTPException(
                status_code=403,
                detail="Employee, HR, or Admin permission required",
            )
     item = Task(
        assigned_to=data.assigned_to,
        title=data.title,
        description=data.description,
        due_date=data.due_date,
        status="PENDING",
    )
     db.add(item)
     db.commit()
     db.refresh(item)
     return serialize(item)


@router.get("/tasks")
def list_tasks(db: DB, actor: CurrentActor):
    query = db.query(Task)

    if actor.role not in {"HR", "ADMIN"}:
        query = query.filter(
            Task.assigned_to == require_employee(actor)
        )

    return [serialize(item) for item in query.all()]


@router.patch("/tasks/{item_id}/status")
def update_task(
    item_id: int,
    data: TaskStatusUpdate,
    db: DB,
    actor: CurrentActor,
):
    item = db.get(Task, item_id)

    if item is None:
        raise HTTPException(404, "Task not found")

    can_access_task(actor, item)
    item.status = data.status
    db.commit()
    db.refresh(item)
    return serialize(item)




@router.get("/exports/tasks.csv")
def export_tasks(db: DB, actor: CurrentActor):
    require_hr_admin(actor)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Employee ID", "Title",
        "Description", "Due Date", "Status",
    ])

    for item in db.query(Task).order_by(Task.id).all():
        writer.writerow([
            item.id,
            item.assigned_to,
            item.title,
            item.description or "",
            item.due_date or "",
            item.status,
        ])

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition":
                'attachment; filename="worksphere_tasks.csv"'
        },
    )



@router.post("/feedback", status_code=201)
def submit_feedback(
    data: FeedbackCreate,
    db: DB,
    actor: CurrentActor,
):
    item = Feedback(
        employee_id=require_employee(actor),
        message=data.message,
        rating=data.rating,
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    return {"id": item.id, "message": "Feedback submitted"}


@router.get("/feedback")
def list_feedback(db: DB, actor: CurrentActor):
    query = db.query(Feedback)

    if actor.role not in {"HR", "ADMIN"}:
        employee_id = require_employee(actor)
        query = query.filter(Feedback.employee_id == employee_id)

    return [
        serialize(item)
        for item in query.order_by(Feedback.created_at.desc()).all()
    ]



@router.get("/profile/preferences")
def get_preferences(db: DB, actor: CurrentActor):
    pref = db.query(NotificationPreference).filter_by(
        user_id=actor.user_id
    ).first()

    if pref is None:
        pref = NotificationPreference(
            user_id=actor.user_id,
            email_enabled=True,
        )
        db.add(pref)
        db.commit()
        db.refresh(pref)

    return {"email_enabled": pref.email_enabled}


@router.put("/profile/preferences")
def update_preferences(
    data: PreferenceUpdate,
    db: DB,
    actor: CurrentActor,
):
    pref = db.query(NotificationPreference).filter_by(
        user_id=actor.user_id
    ).first()

    if pref is None:
        pref = NotificationPreference(
            user_id=actor.user_id,
            email_enabled=data.email_enabled,
        )
        db.add(pref)
    else:
        pref.email_enabled = data.email_enabled

    db.commit()
    return {"email_enabled": pref.email_enabled}