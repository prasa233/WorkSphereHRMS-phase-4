import csv
import io
import smtplib
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, EmailStr, Field
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from xml.sax.saxutils import escape

from app.api.dependencies import DB, CurrentActor, require_employee, require_hr_admin
from app.core.config import settings
from app.integrations.email import send_email
from app.models.phase4 import Task

router = APIRouter(prefix="/integrations", tags=["Integrations"])


class NotificationEmail(BaseModel):
    recipient: EmailStr
    subject: str = Field(min_length=1, max_length=200)
    message: str = Field(min_length=1, max_length=10000)


def _download(content: bytes | str, filename: str, media_type: str):
    if isinstance(content, str):
        content = content.encode("utf-8")
    return StreamingResponse(
        io.BytesIO(content),
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


def _ics_escape(value: object) -> str:
    return (
        str(value).replace("\\", "\\\\")
        .replace(";", "\\;")
        .replace(",", "\\,")
        .replace("\r\n", "\\n")
        .replace("\n", "\\n")
        .replace("\r", "\\n")
    )


@router.get("/status")
def integration_status(actor: CurrentActor):
    return {
        "email": {
            "configured": bool(
                settings.SMTP_HOST
                and settings.SMTP_USERNAME
                and settings.SMTP_PASSWORD
                and settings.SMTP_FROM_EMAIL
            )
        },
        "calendar": {"configured": True, "mode": "iCalendar export"},
        "reports": {"csv": True, "pdf": True},
    }


@router.post("/email/test", status_code=202)
def send_notification_email(
    data: NotificationEmail,
    actor: CurrentActor,
):
    if actor.role not in {"EMPLOYEE", "HR", "ADMIN"}:
        raise HTTPException(
        status_code=403,
        detail="Employee, HR, or Admin permission required",
    )
    try:
        send_email(str(data.recipient), data.subject, data.message)
    except (RuntimeError, OSError, smtplib.SMTPException) as exc:
        raise HTTPException(
            status_code=503,
            detail="Email could not be sent. Check SMTP settings in backend/.env.",
        ) from exc
    return {"message": "Notification email sent"}


@router.get("/exports/tasks.csv")
def export_tasks_csv(db: DB, actor: CurrentActor):
    require_hr_admin(actor)
    output = io.StringIO(newline="")
    writer = csv.writer(output)
    writer.writerow(["Task ID", "Employee ID", "Title", "Description", "Due Date", "Status"])
    for task in db.query(Task).order_by(Task.id).all():
        writer.writerow([
            task.id,
            task.assigned_to,
            task.title,
            task.description or "",
            task.due_date.isoformat() if task.due_date else "",
            task.status,
        ])
    return _download("\ufeff" + output.getvalue(), "worksphere_tasks.csv", "text/csv; charset=utf-8")


@router.get("/exports/tasks.pdf")
def export_tasks_pdf(db: DB, actor: CurrentActor):
    require_hr_admin(actor)
    buffer = io.BytesIO()
    document = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = [
        Paragraph("WorkSphere — Task Report", styles["Title"]),
        Spacer(1, 16),
    ]
    rows = [["ID", "Employee", "Task", "Due Date", "Status"]]
    for task in db.query(Task).order_by(Task.id).all():
        rows.append([
            str(task.id),
            str(task.assigned_to),
            Paragraph(escape(task.title), styles["BodyText"]),
            task.due_date.isoformat() if task.due_date else "Not set",
            task.status,
        ])
    table = Table(rows, repeatRows=1, colWidths=[35, 65, 220, 75, 65])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
    ]))
    elements.append(table)
    document.build(elements)
    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="worksphere_tasks.pdf"'},
    )


@router.get("/calendar/tasks.ics")
def export_tasks_calendar(db: DB, actor: CurrentActor):
    query = db.query(Task)
    if actor.role not in {"HR", "ADMIN"}:
        query = query.filter(Task.assigned_to == require_employee(actor))

    now = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//WorkSphere HRMS//Task Calendar//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "X-WR-CALNAME:WorkSphere Tasks",
    ]
    for task in query.order_by(Task.id).all():
        if task.due_date is None:
            continue
        end_date = task.due_date + timedelta(days=1)
        lines.extend([
            "BEGIN:VEVENT",
            f"UID:worksphere-task-{task.id}@worksphere.local",
            f"DTSTAMP:{now}",
            f"DTSTART;VALUE=DATE:{task.due_date:%Y%m%d}",
            f"DTEND;VALUE=DATE:{end_date:%Y%m%d}",
            f"SUMMARY:{_ics_escape(task.title)}",
            f"DESCRIPTION:{_ics_escape(task.description or '')}",
            "END:VEVENT",
        ])
    lines.append("END:VCALENDAR")
    return _download("\r\n".join(lines) + "\r\n", "worksphere_tasks.ics", "text/calendar; charset=utf-8")


