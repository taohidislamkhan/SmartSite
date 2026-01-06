"""
Alert Schemas
Pydantic models for Alert entity validation and serialization
"""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class AlertBase(BaseModel):
    """Base schema with common Alert fields"""
    area_id: Optional[int] = None
    alert_type: str  # material_low, cost_overrun, task_delay, etc.
    ref_table: Optional[str] = None  # Material, Cost, Task, etc.
    ref_id: Optional[int] = None
    message: Optional[str] = None
    severity: Optional[str] = "warning"  # info, warning, critical
    is_resolved: Optional[bool] = False


class AlertCreate(AlertBase):
    """Schema for creating new Alert (POST request)"""
    pass


class AlertResponse(AlertBase):
    """Schema for Alert response (GET request)"""
    alert_id: int
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True
