"""
Equipment Routes
CRUD endpoints for Equipment management
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database import SessionLocal
from models.equipment import Equipment
from schemas.equipment_schema import EquipmentCreate, EquipmentResponse

router = APIRouter()


def get_db():
    """Dependency: Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[EquipmentResponse])
def get_equipment(
    status_filter: str = None,
    area_id: int = None,
    db: Session = Depends(get_db)
):
    """
    GET /equipment
    Retrieve all equipment with optional filters
    Query params:
      - status_filter: available|in-use|maintenance|retired
      - area_id: filter by current location
    Returns: List of EquipmentResponse objects
    """
    query = db.query(Equipment)
    if status_filter:
        query = query.filter(Equipment.status == status_filter)
    if area_id:
        query = query.filter(Equipment.current_area_id == area_id)
    return query.all()


@router.get("/{equipment_id}", response_model=EquipmentResponse)
def get_equipment_by_id(equipment_id: int, db: Session = Depends(get_db)):
    """
    GET /equipment/{equipment_id}
    Retrieve equipment by ID
    Returns: EquipmentResponse object or 404 if not found
    """
    equipment = db.query(Equipment).filter(Equipment.equipment_id == equipment_id).first()
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Equipment with ID {equipment_id} not found"
        )
    return equipment


@router.post("/", response_model=EquipmentResponse, status_code=status.HTTP_201_CREATED)
def create_equipment(equipment_data: EquipmentCreate, db: Session = Depends(get_db)):
    """
    POST /equipment
    Create new equipment
    Foreign key: current_area_id (optional)
    Returns: Created EquipmentResponse object
    """
    try:
        new_equipment = Equipment(**equipment_data.dict())
        db.add(new_equipment)
        db.commit()
        db.refresh(new_equipment)
        return new_equipment
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid equipment data or invalid area ID"
        )


@router.put("/{equipment_id}", response_model=EquipmentResponse)
def update_equipment(
    equipment_id: int,
    equipment_data: EquipmentCreate,
    db: Session = Depends(get_db)
):
    """
    PUT /equipment/{equipment_id}
    Update equipment by ID
    Returns: Updated EquipmentResponse object or 404 if not found
    """
    equipment = db.query(Equipment).filter(Equipment.equipment_id == equipment_id).first()
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Equipment with ID {equipment_id} not found"
        )
    
    try:
        for key, value in equipment_data.dict(exclude_unset=True).items():
            setattr(equipment, key, value)
        db.commit()
        db.refresh(equipment)
        return equipment
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid update data or invalid area ID"
        )


@router.delete("/{equipment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_equipment(equipment_id: int, db: Session = Depends(get_db)):
    """
    DELETE /equipment/{equipment_id}
    Delete equipment by ID
    """
    equipment = db.query(Equipment).filter(Equipment.equipment_id == equipment_id).first()
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Equipment with ID {equipment_id} not found"
        )
    
    try:
        db.delete(equipment)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error deleting equipment"
        )
