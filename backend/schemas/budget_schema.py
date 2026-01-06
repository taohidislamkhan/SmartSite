"""
Budget Schemas
Pydantic models for Budget entity validation and serialization
"""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from decimal import Decimal


class BudgetBase(BaseModel):
    """Base schema with common Budget fields"""
    area_id: int
    estimated_budget: Decimal
    fiscal_year: Optional[str] = None


class BudgetCreate(BudgetBase):
    """Schema for creating new Budget (POST request)"""
    pass


class BudgetResponse(BudgetBase):
    """Schema for Budget response (GET request)"""
    budget_id: int
    created_at: datetime

    class Config:
        from_attributes = True
