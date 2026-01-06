"""
Engineer Schemas
Pydantic models for Engineer entity validation and serialization
"""

from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class EngineerBase(BaseModel):
    """Base schema with common Engineer fields"""
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    expertise: Optional[str] = None


class EngineerCreate(EngineerBase):
    """Schema for creating new Engineer (POST request)"""
    pass


class EngineerResponse(EngineerBase):
    """Schema for Engineer response (GET request)"""
    engineer_id: int
    created_at: datetime

    class Config:
        from_attributes = True
