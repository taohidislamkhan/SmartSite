"""
SafetyIncident Schemas
Pydantic models for SafetyIncident entity validation and serialization
"""

from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional


class SafetyIncidentBase(BaseModel):
    """Base schema with common SafetyIncident fields"""
    area_id: int
    incident_date: date
    incident_type: Optional[str] = None
    severity: Optional[str] = "low"  # low, medium, high
    description: Optional[str] = None
    reported_by: Optional[str] = None


class SafetyIncidentCreate(SafetyIncidentBase):
    """Schema for creating new SafetyIncident (POST request)"""
    pass


class SafetyIncidentResponse(SafetyIncidentBase):
    """Schema for SafetyIncident response (GET request)"""
    incident_id: int
    created_at: datetime

    class Config:
        from_attributes = True
