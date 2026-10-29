from datetime import date

from pydantic import ValidationError

from app.schemas.phase4 import (
    FeedbackCreate,
    OnboardingCreate,
    ResignationCreate,
    TaskStatusUpdate,
)


def test_onboarding_valid():
    item = OnboardingCreate(
        employee_id=12,
        task_name="Complete HR orientation",
        due_date=date(2026, 11, 5),
    )
    assert item.employee_id == 12
    assert item.task_name == "Complete HR orientation"


def test_onboarding_rejects_invalid_employee():
    try:
        OnboardingCreate(
            employee_id=0,
            task_name="HR orientation",
        )
        assert False, "Expected validation failure"
    except ValidationError:
        pass


def test_feedback_rating_range():
    assert FeedbackCreate(
        message="Great onboarding experience",
        rating=5,
    ).rating == 5

    try:
        FeedbackCreate(message="Invalid rating", rating=8)
        assert False, "Expected validation failure"
    except ValidationError:
        pass


def test_resignation_notice_period():
    assert ResignationCreate(
        reason="I am relocating for family reasons",
        notice_period=30,
    ).notice_period == 30

    try:
        ResignationCreate(
            reason="Relocation",
            notice_period=500,
        )
        assert False, "Expected validation failure"
    except ValidationError:
        pass


def test_status_is_restricted():
    assert TaskStatusUpdate(status="COMPLETED").status == "COMPLETED"

    try:
        TaskStatusUpdate(status="CANCELLED")
        assert False, "Expected validation failure"
    except ValidationError:
        pass