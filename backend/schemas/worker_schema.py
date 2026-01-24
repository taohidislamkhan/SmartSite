"""
Worker Schemas
Pydantic models for Worker entity validation and serialization
"""

from pydantic import BaseModel
from typing import Optional
from decimal import Decimal


class WorkerBase(BaseModel):
    """Base schema with common Worker fields"""
    name: str
    skill: Optional[str] = None
    cost_per_day: Optional[Decimal] = None
    contact: Optional[str] = None
    current_area_id: Optional[int] = None
    current_task_id: Optional[int] = None


class WorkerCreate(WorkerBase):
    """Schema for creating new Worker (POST request)"""
    pass


class WorkerResponse(WorkerBase):
    """Schema for Worker response (GET request)"""
    worker_id: int

    class Config:
        from_attributes = True


class WorkerTaskAssignment(BaseModel):
    """Schema for assigning a task to a worker"""
    task_id: Optional[int] = None


class WorkerAreaAssignment(BaseModel):
    """Schema for assigning an area to a worker"""
    area_id: Optional[int] = None
