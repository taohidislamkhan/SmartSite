"""
Engineer Routes
CRUD endpoints for Engineer management
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database import SessionLocal
from models.engineer import Engineer
from schemas.engineer_schema import EngineerCreate, EngineerResponse

router = APIRouter()


def get_db():
    """Dependency: Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[EngineerResponse])
def get_engineers(db: Session = Depends(get_db)):
    """
    GET /engineers
    Retrieve all engineers
    Returns: List of EngineerResponse objects
    """
    engineers = db.query(Engineer).all()
    return engineers


@router.get("/{engineer_id}", response_model=EngineerResponse)
def get_engineer(engineer_id: int, db: Session = Depends(get_db)):
    """
    GET /engineers/{engineer_id}
    Retrieve engineer by ID
    Returns: EngineerResponse object or 404 if not found
    """
    engineer = db.query(Engineer).filter(Engineer.engineer_id == engineer_id).first()
    if not engineer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Engineer with ID {engineer_id} not found"
        )
    return engineer


@router.post("/", response_model=EngineerResponse, status_code=status.HTTP_201_CREATED)
def create_engineer(engineer_data: EngineerCreate, db: Session = Depends(get_db)):
    """
    POST /engineers
    Create a new engineer
    Returns: Created EngineerResponse object
    """
    try:
        new_engineer = Engineer(**engineer_data.dict())
        db.add(new_engineer)
        db.commit()
        db.refresh(new_engineer)
        return new_engineer
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid engineer data or duplicate entry"
        )


@router.put("/{engineer_id}", response_model=EngineerResponse)
def update_engineer(
    engineer_id: int,
    engineer_data: EngineerCreate,
    db: Session = Depends(get_db)
):
    """
    PUT /engineers/{engineer_id}
    Update engineer by ID
    Returns: Updated EngineerResponse object or 404 if not found
    """
    engineer = db.query(Engineer).filter(Engineer.engineer_id == engineer_id).first()
    if not engineer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Engineer with ID {engineer_id} not found"
        )
    
    try:
        for key, value in engineer_data.dict(exclude_unset=True).items():
            setattr(engineer, key, value)
        db.commit()
        db.refresh(engineer)
        return engineer
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid update data"
        )


@router.delete("/{engineer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_engineer(engineer_id: int, db: Session = Depends(get_db)):
    """
    DELETE /engineers/{engineer_id}
    Delete engineer by ID
    Note: If engineer is assigned to areas, those FKs will be SET NULL
    """
    engineer = db.query(Engineer).filter(Engineer.engineer_id == engineer_id).first()
    if not engineer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Engineer with ID {engineer_id} not found"
        )
    
    try:
        db.delete(engineer)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error deleting engineer"
        )
