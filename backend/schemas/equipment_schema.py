"""
Equipment Schemas
Pydantic models for Equipment entity validation and serialization
"""

from pydantic import BaseModel
from typing import Optional


class EquipmentBase(BaseModel):
    """Base schema with common Equipment fields"""
    name: Optional[str] = None
    serial_no: Optional[str] = None
    status: Optional[str] = "available"  # available, in-use, maintenance, retired
    current_area_id: Optional[int] = None


class EquipmentCreate(EquipmentBase):
    """Schema for creating new Equipment (POST request)"""
    pass


class EquipmentResponse(EquipmentBase):
    """Schema for Equipment response (GET request)"""
    equipment_id: int

    class Config:
        from_attributes = True
