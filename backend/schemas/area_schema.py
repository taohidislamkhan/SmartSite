"""
Area Schemas
Pydantic models for Area entity validation and serialization
"""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from decimal import Decimal


class AreaBase(BaseModel):
    """Base schema with common Area fields"""
    name: str
    location: Optional[str] = None
    boundary_size: Optional[Decimal] = None
    area_type: Optional[str] = None
    assigned_engineer_id: Optional[int] = None
    status: Optional[str] = "planned"  # planned, active, completed, on-hold


class AreaCreate(AreaBase):
    """Schema for creating new Area (POST request)"""
    pass


class AreaResponse(AreaBase):
    """Schema for Area response (GET request)"""
    area_id: int
    created_at: datetime

    class Config:
        from_attributes = True
