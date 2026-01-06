"""
Material Routes
CRUD endpoints for Material inventory management
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database import SessionLocal
from models.material import Material
from schemas.material_schema import MaterialCreate, MaterialResponse

router = APIRouter()


def get_db():
    """Dependency: Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[MaterialResponse])
def get_materials(
    area_id: int = None,
    low_stock: bool = False,
    db: Session = Depends(get_db)
):
    """
    GET /materials
    Retrieve all materials with optional filters
    Query params:
      - area_id: filter by area
      - low_stock: if True, return only materials below reorder_threshold
    Returns: List of MaterialResponse objects
    DBMS Note: low_stock comparison requires careful handling of NULL thresholds
    """
    query = db.query(Material)
    if area_id:
        query = query.filter(Material.area_id == area_id)
    if low_stock:
        # Return materials where quantity <= reorder_threshold
        query = query.filter(Material.quantity <= Material.reorder_threshold)
    return query.all()


@router.get("/{material_id}", response_model=MaterialResponse)
def get_material(material_id: int, db: Session = Depends(get_db)):
    """
    GET /materials/{material_id}
    Retrieve material by ID
    Returns: MaterialResponse object or 404 if not found
    """
    material = db.query(Material).filter(Material.material_id == material_id).first()
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Material with ID {material_id} not found"
        )
    return material


@router.post("/", response_model=MaterialResponse, status_code=status.HTTP_201_CREATED)
def create_material(material_data: MaterialCreate, db: Session = Depends(get_db)):
    """
    POST /materials
    Create new material entry for an area
    Required: area_id, name
    Returns: Created MaterialResponse object
    DBMS Note: ON DELETE CASCADE - material deleted if area is deleted
    """
    try:
        new_material = Material(**material_data.dict())
        db.add(new_material)
        db.commit()
        db.refresh(new_material)
        return new_material
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid material data or invalid area ID"
        )


@router.put("/{material_id}", response_model=MaterialResponse)
def update_material(
    material_id: int,
    material_data: MaterialCreate,
    db: Session = Depends(get_db)
):
    """
    PUT /materials/{material_id}
    Update material by ID
    Returns: Updated MaterialResponse object or 404 if not found
    """
    material = db.query(Material).filter(Material.material_id == material_id).first()
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Material with ID {material_id} not found"
        )
    
    try:
        for key, value in material_data.dict(exclude_unset=True).items():
            setattr(material, key, value)
        db.commit()
        db.refresh(material)
        return material
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid update data or invalid area ID"
        )


@router.delete("/{material_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_material(material_id: int, db: Session = Depends(get_db)):
    """
    DELETE /materials/{material_id}
    Delete material by ID
    """
    material = db.query(Material).filter(Material.material_id == material_id).first()
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Material with ID {material_id} not found"
        )
    
    try:
        db.delete(material)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error deleting material"
        )
