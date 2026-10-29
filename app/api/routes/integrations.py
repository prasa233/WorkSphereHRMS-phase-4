import io

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
)

from app.api.dependencies import DB, CurrentActor, require_hr_admin
from app.models.phase4 import Task

router = APIRouter(prefix="/integrations", tags=["Integrations"])


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
            Paragraph(task.title, styles["BodyText"]),
            str(task.due_date or "Not set"),
            task.status,
        ])

    table = Table(
        rows,
        repeatRows=1,
        colWidths=[35, 65, 220, 75, 65],
    )
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
        headers={
            "Content-Disposition":
                'attachment; filename="worksphere_tasks.pdf"'
        },
    )