"""
Project Routes (Create Project Feature)
Handles project creation by engineers

DBMS Design:
- A Project = an Area in the database
- One Engineer → Many Areas (areas.assigned_engineer_id = engineer.user_id)
- All projects are automatically assigned to the logged-in engineer
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, validator
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Optional

from database import SessionLocal
from models.area import Area
from models.engineer import Engineer
from models.user import User
from routes.auth_routes import get_current_user, require_engineer

router = APIRouter()


def get_db():
    """Dependency: Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ============================================================================
# SCHEMAS
# ============================================================================

class CreateProjectRequest(BaseModel):
    """Request schema for creating a new project"""
    name: str = Field(..., min_length=1, max_length=255, description="Project name")
    location: str = Field(..., min_length=1, max_length=255, description="Project location")
    area_type: str = Field(..., description="Type of area/project")
    boundary_size: float = Field(..., gt=0, description="Boundary size in sq ft")
    status: str = Field(default="planned", description="Initial project status")

    @validator("area_type")
    def validate_area_type(cls, v):
        """Validate area type against allowed values"""
        valid_types = [
            "construction", "electrical", "plumbing", "hvac",
            "landscaping", "painting", "roofing", "demolition", "other"
        ]
        if v not in valid_types:
            raise ValueError(f"Invalid area type. Must be one of: {', '.join(valid_types)}")
        return v

    @validator("status")
    def validate_status(cls, v):
        """Validate status against allowed values"""
        valid_statuses = ["planned", "active", "on-hold", "completed"]
        if v not in valid_statuses:
            raise ValueError(f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Downtown Commercial Complex",
                "location": "123 Main Street, City, State",
                "area_type": "construction",
                "boundary_size": 5000.0,
                "status": "planned"
            }
        }


class ProjectResponse(BaseModel):
    """Response schema for created project"""
    area_id: int
    name: str
    location: str
    area_type: str
    boundary_size: float
    assigned_engineer_id: int
    status: str

    class Config:
        from_attributes = True


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.post("/create", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project_data: CreateProjectRequest,
    current_engineer: User = Depends(require_engineer),
    db: Session = Depends(get_db)
):
    """
    POST /api/projects/create
    
    Create a new project (Area) assigned to the current engineer.
    
    DBMS Logic:
    - Area table stores all projects
    - assigned_engineer_id is set to the Engineer.engineer_id (from Engineer table)
    - Engineer record is found by matching email with logged-in user
    - Status defaults to 'planned' if not provided
    
    Args:
        project_data: CreateProjectRequest with name, location, area_type, boundary_size, status
        current_engineer: Current logged-in user (Engineer role required)
        db: Database session
    
    Returns:
        ProjectResponse with created project details
    
    Raises:
        HTTPException 400: Invalid input data or database error
        HTTPException 404: Engineer profile not found (should have Engineer record in DB)
    """
    try:
        # Find Engineer by matching email with current user's email
        engineer = db.query(Engineer).filter(Engineer.email == current_engineer.email).first()
        
        if not engineer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Engineer profile not found. Please contact administrator to create your engineer profile."
            )
        
        # Create new Area (Project) with engineer's engineer_id
        new_project = Area(
            name=project_data.name,
            location=project_data.location,
            area_type=project_data.area_type,
            boundary_size=project_data.boundary_size,
            status=project_data.status,
            assigned_engineer_id=engineer.engineer_id  # Use Engineer.engineer_id, not User.user_id
        )

        # Add to database
        db.add(new_project)
        db.commit()
        db.refresh(new_project)

        return ProjectResponse.model_validate(new_project)

    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Database error: Invalid data or engineer ID"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating project: {str(e)}"
        )
