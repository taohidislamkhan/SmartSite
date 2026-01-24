"""
Budget Schemas
Pydantic models for Budget entity validation and serialization
"""

from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional
from decimal import Decimal


class BudgetBase(BaseModel):
    """Base schema with common Budget fields"""
    area_id: int
    estimated_budget: Decimal
    fiscal_year: Optional[str] = None

    @field_validator('fiscal_year', mode='before')
    @classmethod
    def convert_fiscal_year_to_string(cls, v):
        """Convert fiscal_year to string if it's an integer"""
        if isinstance(v, int):
            return str(v)
        return v


class BudgetCreate(BudgetBase):
    """Schema for creating new Budget (POST request)"""
    pass


class BudgetResponse(BudgetBase):
    """Schema for Budget response (GET request)"""
    budget_id: int
    created_at: datetime

    class Config:
        from_attributes = True
