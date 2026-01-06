"""
Cost Routes
CRUD endpoints for Cost tracking
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from decimal import Decimal

from database import SessionLocal
from models.cost import Cost
from schemas.cost_schema import CostCreate, CostResponse

router = APIRouter()


def get_db():
    """Dependency: Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[CostResponse])
def get_costs(
    area_id: int = None,
    cost_type: str = None,
    db: Session = Depends(get_db)
):
    """
    GET /costs
    Retrieve all costs with optional filters
    Query params:
      - area_id: filter by area
      - cost_type: material|labor|equipment|other
    Returns: List of CostResponse objects
    """
    query = db.query(Cost)
    if area_id:
        query = query.filter(Cost.area_id == area_id)
    if cost_type:
        query = query.filter(Cost.type == cost_type)
    return query.all()


@router.get("/{cost_id}", response_model=CostResponse)
def get_cost(cost_id: int, db: Session = Depends(get_db)):
    """
    GET /costs/{cost_id}
    Retrieve cost by ID
    Returns: CostResponse object or 404 if not found
    """
    cost = db.query(Cost).filter(Cost.cost_id == cost_id).first()
    if not cost:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cost with ID {cost_id} not found"
        )
    return cost


@router.post("/", response_model=CostResponse, status_code=status.HTTP_201_CREATED)
def create_cost(cost_data: CostCreate, db: Session = Depends(get_db)):
    """
    POST /costs
    Create new cost entry
    Required: area_id, type, amount
    DBMS Note: ON DELETE CASCADE - cost deleted if area is deleted
    """
    try:
        new_cost = Cost(**cost_data.dict())
        db.add(new_cost)
        db.commit()
        db.refresh(new_cost)
        return new_cost
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid cost data or invalid area ID"
        )


@router.put("/{cost_id}", response_model=CostResponse)
def update_cost(
    cost_id: int,
    cost_data: CostCreate,
    db: Session = Depends(get_db)
):
    """
    PUT /costs/{cost_id}
    Update cost by ID
    Returns: Updated CostResponse object or 404 if not found
    """
    cost = db.query(Cost).filter(Cost.cost_id == cost_id).first()
    if not cost:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cost with ID {cost_id} not found"
        )
    
    try:
        for key, value in cost_data.dict(exclude_unset=True).items():
            setattr(cost, key, value)
        db.commit()
        db.refresh(cost)
        return cost
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid update data or invalid area ID"
        )


@router.delete("/{cost_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cost(cost_id: int, db: Session = Depends(get_db)):
    """
    DELETE /costs/{cost_id}
    Delete cost by ID
    """
    cost = db.query(Cost).filter(Cost.cost_id == cost_id).first()
    if not cost:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cost with ID {cost_id} not found"
        )
    
    try:
        db.delete(cost)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error deleting cost"
        )


@router.get("/area/{area_id}/summary")
def get_area_cost_summary(area_id: int, db: Session = Depends(get_db)):
    """
    GET /costs/area/{area_id}/summary
    Get cost summary by type for an area
    Returns: JSON with total costs grouped by type
    DBMS Query: SUM(amount) GROUP BY type WHERE area_id = ?
    """
    from sqlalchemy import func
    
    area_exists = db.query(Cost).filter(Cost.area_id == area_id).first()
    if not area_exists and area_id > 0:
        # Optional: check if area exists, but area might have no costs
        pass
    
    summary = db.query(
        Cost.type,
        func.sum(Cost.amount).label('total_amount'),
        func.count(Cost.cost_id).label('count')
    ).filter(Cost.area_id == area_id).group_by(Cost.type).all()
    
    return {
        "area_id": area_id,
        "cost_summary": [
            {
                "type": row[0],
                "total_amount": str(row[1]) if row[1] else "0",
                "count": row[2]
            } for row in summary
        ]
    }
