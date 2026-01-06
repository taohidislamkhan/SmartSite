"""
Cost Schemas
Pydantic models for Cost entity validation and serialization
"""

from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional
from decimal import Decimal


class CostBase(BaseModel):
    """Base schema with common Cost fields"""
    area_id: int
    type: str  # material, labor, equipment, other
    amount: Decimal
    incurred_date: Optional[date] = None
    description: Optional[str] = None


class CostCreate(CostBase):
    """Schema for creating new Cost (POST request)"""
    pass


class CostResponse(CostBase):
    """Schema for Cost response (GET request)"""
    cost_id: int
    recorded_at: datetime

    class Config:
        from_attributes = True
