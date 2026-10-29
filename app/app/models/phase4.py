from datetime import date, datetime
from typing import Optional

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db.session import Base


class Onboarding(Base):
    __tablename__ = "onboarding"

    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[int] = mapped_column(
        Integer, index=True, nullable=False
    )
    task_name: Mapped[str] = mapped_column(String(200), nullable=False)
    status: Mapped[str] = mapped_column(
        String(20), default="PENDING", nullable=False
    )
    due_date: Mapped[Optional[date]] = mapped_column(
        Date, nullable=True
    )

    __table_args__ = (
        CheckConstraint(
            "status IN ('PENDING', 'COMPLETED')",
            name="ck_onboarding_status",
        ),
    )


class Resignation(Base):
    __tablename__ = "resignations"

    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[int] = mapped_column(
        Integer, index=True, nullable=False
    )
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    notice_period: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(
        String(20), default="PENDING", nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    __table_args__ = (
        CheckConstraint(
            "notice_period >= 0 AND notice_period <= 365",
            name="ck_resignation_notice_period",
        ),
        CheckConstraint(
            "status IN ('PENDING', 'APPROVED', 'REJECTED')",
            name="ck_resignation_status",
        ),
    )


class Announcement(Base):
    __tablename__ = "announcements"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    created_by: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    assigned_to: Mapped[int] = mapped_column(
        Integer, index=True, nullable=False
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True
    )
    due_date: Mapped[Optional[date]] = mapped_column(
        Date, nullable=True
    )
    status: Mapped[str] = mapped_column(
        String(20), default="PENDING", nullable=False
    )

    __table_args__ = (
        CheckConstraint(
            "status IN ('PENDING', 'COMPLETED')",
            name="ck_tasks_status",
        ),
    )


class Feedback(Base):
    __tablename__ = "feedback"

    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[int] = mapped_column(
        Integer, index=True, nullable=False
    )
    message: Mapped[str] = mapped_column(Text, nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    __table_args__ = (
        CheckConstraint(
            "rating BETWEEN 1 AND 5",
            name="ck_feedback_rating",
        ),
    )


class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        Integer, unique=True, nullable=False
    )
    email_enabled: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )


class CalendarIntegration(Base):
    __tablename__ = "calendar_integrations"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        Integer, unique=True, nullable=False
    )
    provider: Mapped[str] = mapped_column(
        String(30), default="google", nullable=False
    )
    enabled: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )
    google_refresh_token_encrypted: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True
    )