"""
User Schemas
Pydantic models for User validation and API responses
"""

from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional
from enum import Enum


class UserRole(str, Enum):
    """Allowed user roles"""
    ENGINEER = "engineer"
    WORKER = "worker"


class UserBase(BaseModel):
    """Base schema with common User fields"""
    email: EmailStr
    role: UserRole


class UserCreate(UserBase):
    """Schema for user registration"""
    password: str = Field(..., min_length=6, max_length=255)
    password_confirm: str = Field(..., min_length=6)
    area_id: Optional[int] = None  # For workers only
    
    # Engineer-specific fields
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=30)
    address: Optional[str] = Field(None, max_length=255)
    
    # Worker-specific fields (required for workers)
    skill: Optional[str] = Field(None, max_length=100)
    contact: Optional[str] = Field(None, max_length=30)  # Phone for workers
    
    def validate_password_match(self) -> bool:
        """Ensure passwords match"""
        return self.password == self.password_confirm


class UserResponse(UserBase):
    """Schema for user response (GET request)"""
    user_id: int
    area_id: Optional[int] = None
    engineer_id: Optional[int] = None  # For engineers: ID from Engineer table
    engineer_name: Optional[str] = None  # For engineers: Full name
    engineer_first_name: Optional[str] = None  # For engineers: First name
    created_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    """Schema for login request"""
    email: EmailStr
    password: str
    role: UserRole = Field(..., description="Must match role used during signup")


class LoginResponse(BaseModel):
    """Schema for successful login response"""
    user_id: int
    email: str
    role: str
    area_id: Optional[int] = None
    engineer_id: Optional[int] = None  # For engineers: ID from Engineer table
    engineer_name: Optional[str] = None  # For engineers: Full name
    engineer_first_name: Optional[str] = None  # For engineers: First name
    message: str = "Login successful"


class TokenResponse(BaseModel):
    """Schema for token-based auth response"""
    access_token: str
    token_type: str = "bearer"
    user: LoginResponse


class LogoutResponse(BaseModel):
    """Schema for logout response"""
    message: str = "Logged out successfully"


class PasswordChangeRequest(BaseModel):
    """Schema for password change"""
    current_password: str
    new_password: str = Field(..., min_length=6)
    confirm_password: str = Field(..., min_length=6)
