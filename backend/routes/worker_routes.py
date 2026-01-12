"""
Worker Routes
CRUD endpoints for Worker management
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database import SessionLocal
from models.worker import Worker
from schemas.worker_schema import WorkerCreate, WorkerResponse

router = APIRouter()


def get_db():
    """Dependency: Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[WorkerResponse])
def get_workers(
    area_id: int = None,
    db: Session = Depends(get_db)
):
    """
    GET /workers
    Retrieve all workers with optional area filter
    Query params: area_id (filter by current area assignment)
    Returns: List of WorkerResponse objects
    """
    query = db.query(Worker)
    if area_id:
        query = query.filter(Worker.current_area_id == area_id)
    return query.all()


@router.get("/{worker_id}", response_model=WorkerResponse)
def get_worker(worker_id: int, db: Session = Depends(get_db)):
    """
    GET /workers/{worker_id}
    Retrieve worker by ID
    Returns: WorkerResponse object or 404 if not found
    """
    worker = db.query(Worker).filter(Worker.worker_id == worker_id).first()
    if not worker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Worker with ID {worker_id} not found"
        )
    return worker


@router.post("/", response_model=WorkerResponse, status_code=status.HTTP_201_CREATED)
def create_worker(worker_data: WorkerCreate, db: Session = Depends(get_db)):
    """
    POST /workers
    Create a new worker
    Foreign key: current_area_id (optional)
    Returns: Created WorkerResponse object
    """
    try:
        new_worker = Worker(**worker_data.dict())
        db.add(new_worker)
        db.commit()
        db.refresh(new_worker)
        return new_worker
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid worker data or invalid area ID"
        )


@router.put("/{worker_id}", response_model=WorkerResponse)
def update_worker(
    worker_id: int,
    worker_data: WorkerCreate,
    db: Session = Depends(get_db)
):
    """
    PUT /workers/{worker_id}
    Update worker by ID
    Returns: Updated WorkerResponse object or 404 if not found
    """
    worker = db.query(Worker).filter(Worker.worker_id == worker_id).first()
    if not worker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Worker with ID {worker_id} not found"
        )
    
    try:
        for key, value in worker_data.dict(exclude_unset=True).items():
            setattr(worker, key, value)
        db.commit()
        db.refresh(worker)
        return worker
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid update data or invalid area ID"
        )


@router.delete("/{worker_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_worker(worker_id: int, db: Session = Depends(get_db)):
    """
    DELETE /workers/{worker_id}
    Delete worker by ID
    DBMS Note: ON DELETE SET NULL - Tasks assigned to this worker will have assigned_worker_id set to NULL
    """
    worker = db.query(Worker).filter(Worker.worker_id == worker_id).first()
    if not worker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Worker with ID {worker_id} not found"
        )
    
    try:
        db.delete(worker)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error deleting worker"
        )


@router.put("/{worker_id}/task", response_model=WorkerResponse)
def assign_task(
    worker_id: int,
    task_data: dict,
    db: Session = Depends(get_db)
):
    """
    PUT /workers/{worker_id}/task
    Assign a task to a worker
    Body: { "task_id": int }
    Returns: Updated WorkerResponse object
    """
    worker = db.query(Worker).filter(Worker.worker_id == worker_id).first()
    if not worker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Worker with ID {worker_id} not found"
        )
    
    try:
        task_id = task_data.get("task_id")
        worker.current_task_id = task_id
        db.commit()
        db.refresh(worker)
        return worker
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error assigning task to worker"
        )


@router.put("/{worker_id}/area", response_model=WorkerResponse)
def assign_area(
    worker_id: int,
    area_data: dict,
    db: Session = Depends(get_db)
):
    """
    PUT /workers/{worker_id}/area
    Reassign a worker to a different area
    Body: { "area_id": int, "retain_task": bool (optional) }
    Returns: Updated WorkerResponse object
    """
    worker = db.query(Worker).filter(Worker.worker_id == worker_id).first()
    if not worker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Worker with ID {worker_id} not found"
        )
    
    try:
        area_id = area_data.get("area_id")
        retain_task = area_data.get("retain_task", False)
        
        worker.current_area_id = area_id
        
        # If not retaining task, clear current task assignment
        if not retain_task:
            worker.current_task_id = None
        
        db.commit()
        db.refresh(worker)
        return worker
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error reassigning worker to area"
        )

