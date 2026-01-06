"""
Area Routes
CRUD endpoints for Area (construction site) management
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database import SessionLocal
from models.area import Area
from schemas.area_schema import AreaCreate, AreaResponse

router = APIRouter()


def get_db():
    """Dependency: Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[AreaResponse])
def get_areas(
    status_filter: str = None,
    db: Session = Depends(get_db)
):
    """
    GET /areas
    Retrieve all areas with optional status filter
    Query params: status_filter (planned|active|completed|on-hold)
    Returns: List of AreaResponse objects
    """
    query = db.query(Area)
    if status_filter:
        query = query.filter(Area.status == status_filter)
    return query.all()


@router.get("/{area_id}", response_model=AreaResponse)
def get_area(area_id: int, db: Session = Depends(get_db)):
    """
    GET /areas/{area_id}
    Retrieve area by ID
    Returns: AreaResponse object or 404 if not found
    """
    area = db.query(Area).filter(Area.area_id == area_id).first()
    if not area:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Area with ID {area_id} not found"
        )
    return area


@router.post("/", response_model=AreaResponse, status_code=status.HTTP_201_CREATED)
def create_area(area_data: AreaCreate, db: Session = Depends(get_db)):
    """
    POST /areas
    Create a new area/site
    Foreign key: assigned_engineer_id (optional)
    Returns: Created AreaResponse object
    """
    try:
        new_area = Area(**area_data.dict())
        db.add(new_area)
        db.commit()
        db.refresh(new_area)
        return new_area
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid area data or invalid engineer ID"
        )


@router.put("/{area_id}", response_model=AreaResponse)
def update_area(
    area_id: int,
    area_data: AreaCreate,
    db: Session = Depends(get_db)
):
    """
    PUT /areas/{area_id}
    Update area by ID
    Returns: Updated AreaResponse object or 404 if not found
    """
    area = db.query(Area).filter(Area.area_id == area_id).first()
    if not area:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Area with ID {area_id} not found"
        )
    
    try:
        for key, value in area_data.dict(exclude_unset=True).items():
            setattr(area, key, value)
        db.commit()
        db.refresh(area)
        return area
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid update data or invalid engineer ID"
        )


@router.delete("/{area_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_area(area_id: int, db: Session = Depends(get_db)):
    """
    DELETE /areas/{area_id}
    Delete area by ID
    DBMS Note: ON DELETE CASCADE will also delete:
    - All Materials for this area
    - All Tasks for this area
    - All Costs for this area
    - All Budgets for this area
    - All SafetyIncidents for this area
    """
    area = db.query(Area).filter(Area.area_id == area_id).first()
    if not area:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Area with ID {area_id} not found"
        )
    
    try:
        db.delete(area)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error deleting area"
        )

