"""
Task Schemas
Pydantic models for Task entity validation and serialization
"""

from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional


class TaskBase(BaseModel):
    """Base schema with common Task fields"""
    area_id: int
    title: str
    description: Optional[str] = None
    planned_start: Optional[date] = None
    planned_end: Optional[date] = None
    actual_start: Optional[date] = None
    actual_end: Optional[date] = None
    progress_percent: Optional[int] = 0
    assigned_worker_id: Optional[int] = None
    status: Optional[str] = "pending"  # pending, in-progress, completed, blocked


class TaskCreate(TaskBase):
    """Schema for creating new Task (POST request)"""
    pass


class TaskResponse(TaskBase):
    """Schema for Task response (GET request)"""
    task_id: int
    created_at: datetime

    class Config:
        from_attributes = True
