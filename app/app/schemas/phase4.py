from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


TaskStatus = Literal["PENDING", "COMPLETED"]
ResignationStatus = Literal["PENDING", "APPROVED", "REJECTED"]


class OnboardingCreate(BaseModel):
    employee_id: int = Field(gt=0)
    task_name: str = Field(min_length=2, max_length=200)
    due_date: date | None = None


class TaskStatusUpdate(BaseModel):
    status: TaskStatus


class ResignationCreate(BaseModel):
    reason: str = Field(min_length=5, max_length=3000)
    notice_period: int = Field(ge=0, le=365)


class ResignationDecision(BaseModel):
    status: Literal["APPROVED", "REJECTED"]


class AnnouncementCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    message: str = Field(min_length=1, max_length=10000)


class TaskCreate(BaseModel):
    assigned_to: int = Field(gt=0)
    title: str = Field(min_length=2, max_length=200)
    description: str | None = Field(default=None, max_length=5000)
    due_date: date | None = None


class FeedbackCreate(BaseModel):
    message: str = Field(min_length=1, max_length=5000)
    rating: int = Field(ge=1, le=5)


class ProfileUpdate(BaseModel):
    full_name: str = Field(min_length=2, max_length=150)
    department: str | None = Field(default=None, max_length=100)


class PasswordChange(BaseModel):
    current_password: str = Field(min_length=1)
    new_password: str = Field(min_length=12, max_length=128)


class PreferenceUpdate(BaseModel):
    email_enabled: bool


class OnboardingOut(BaseModel):
    id: int
    employee_id: int
    task_name: str
    status: str
    due_date: date | None

    model_config = ConfigDict(from_attributes=True)


class TaskOut(BaseModel):
    id: int
    assigned_to: int
    title: str
    description: str | None
    due_date: date | None
    status: str

    model_config = ConfigDict(from_attributes=True)


class ResignationOut(BaseModel):
    id: int
    employee_id: int
    reason: str
    notice_period: int
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)