"""
Budget Routes
CRUD endpoints for Budget management
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database import SessionLocal
from models.budget import Budget
from schemas.budget_schema import BudgetCreate, BudgetResponse

router = APIRouter()


def get_db():
    """Dependency: Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[BudgetResponse])
def get_budgets(
    area_id: int = None,
    fiscal_year: str = None,
    db: Session = Depends(get_db)
):
    """
    GET /budgets
    Retrieve all budgets with optional filters
    Query params:
      - area_id: filter by area
      - fiscal_year: filter by fiscal year (YYYY format)
    Returns: List of BudgetResponse objects
    """
    query = db.query(Budget)
    if area_id:
        query = query.filter(Budget.area_id == area_id)
    if fiscal_year:
        query = query.filter(Budget.fiscal_year == fiscal_year)
    return query.all()


@router.get("/{budget_id}", response_model=BudgetResponse)
def get_budget(budget_id: int, db: Session = Depends(get_db)):
    """
    GET /budgets/{budget_id}
    Retrieve budget by ID
    Returns: BudgetResponse object or 404 if not found
    """
    budget = db.query(Budget).filter(Budget.budget_id == budget_id).first()
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Budget with ID {budget_id} not found"
        )
    return budget


@router.post("/", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
def create_budget(budget_data: BudgetCreate, db: Session = Depends(get_db)):
    """
    POST /budgets
    Create new budget entry
    Required: area_id, estimated_budget
    DBMS Note: ON DELETE CASCADE - budget deleted if area is deleted
    """
    try:
        new_budget = Budget(**budget_data.dict())
        db.add(new_budget)
        db.commit()
        db.refresh(new_budget)
        return new_budget
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid budget data or invalid area ID"
        )


@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(
    budget_id: int,
    budget_data: BudgetCreate,
    db: Session = Depends(get_db)
):
    """
    PUT /budgets/{budget_id}
    Update budget by ID
    Returns: Updated BudgetResponse object or 404 if not found
    """
    budget = db.query(Budget).filter(Budget.budget_id == budget_id).first()
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Budget with ID {budget_id} not found"
        )
    
    try:
        for key, value in budget_data.dict(exclude_unset=True).items():
            setattr(budget, key, value)
        db.commit()
        db.refresh(budget)
        return budget
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid update data or invalid area ID"
        )


@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(budget_id: int, db: Session = Depends(get_db)):
    """
    DELETE /budgets/{budget_id}
    Delete budget by ID
    """
    budget = db.query(Budget).filter(Budget.budget_id == budget_id).first()
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Budget with ID {budget_id} not found"
        )
    
    try:
        db.delete(budget)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error deleting budget"
        )


@router.get("/area/{area_id}/vs-actual")
def get_budget_vs_actual(area_id: int, db: Session = Depends(get_db)):
    """
    GET /budgets/area/{area_id}/vs-actual
    Compare estimated budget with actual costs for an area
    DBMS Query: SUM(Cost.amount) for area vs Budget.estimated_budget
    
    Returns: JSON with budget comparison
    """
    from sqlalchemy import func
    from models.cost import Cost
    
    budget = db.query(Budget).filter(Budget.area_id == area_id).first()
    actual_cost = db.query(func.sum(Cost.amount)).filter(Cost.area_id == area_id).scalar()
    
    estimated = float(budget.estimated_budget) if budget else 0.0
    actual = float(actual_cost) if actual_cost else 0.0
    variance = estimated - actual
    variance_percent = (variance / estimated * 100) if estimated > 0 else 0
    
    return {
        "area_id": area_id,
        "estimated_budget": str(estimated),
        "actual_cost": str(actual),
        "variance": str(variance),
        "variance_percent": round(variance_percent, 2),
        "status": "under budget" if variance > 0 else "over budget"
    }
