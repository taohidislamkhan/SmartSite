"""
Material Schemas
Pydantic models for Material entity validation and serialization
"""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from decimal import Decimal


class MaterialBase(BaseModel):
    """Base schema with common Material fields"""
    area_id: int
    name: str
    quantity: Optional[Decimal] = None
    unit: Optional[str] = None
    unit_cost: Optional[Decimal] = None
    reorder_threshold: Optional[Decimal] = None


class MaterialCreate(MaterialBase):
    """Schema for creating new Material (POST request)"""
    pass


class MaterialResponse(MaterialBase):
    """Schema for Material response (GET request)"""
    material_id: int
    last_updated: datetime

    class Config:
        from_attributes = True
