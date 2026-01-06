"""
Schedule Schemas
Pydantic models for Schedule entity validation and serialization
"""

from pydantic import BaseModel
from datetime import date
from typing import Optional


class ScheduleBase(BaseModel):
    """Base schema with common Schedule fields"""
    task_id: int
    planned_start: Optional[date] = None
    planned_end: Optional[date] = None
    actual_start: Optional[date] = None
    actual_end: Optional[date] = None
    notes: Optional[str] = None


class ScheduleCreate(ScheduleBase):
    """Schema for creating new Schedule (POST request)"""
    pass


class ScheduleResponse(ScheduleBase):
    """Schema for Schedule response (GET request)"""
    schedule_id: int

    class Config:
        from_attributes = True
