"""
Worker Routes
CRUD endpoints for Worker management
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database import SessionLocal
from models.worker import Worker
from models.task import Task
from models.area import Area
from models.user import User
from schemas.worker_schema import WorkerCreate, WorkerResponse, WorkerTaskAssignment, WorkerAreaAssignment
from routes.auth_routes import get_current_user

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
    task_assignment: WorkerTaskAssignment,
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
        worker.current_task_id = task_assignment.task_id
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
    area_assignment: WorkerAreaAssignment,
    db: Session = Depends(get_db)
):
    """
    PUT /workers/{worker_id}/area
    Reassign a worker to a different area
    Body: { "area_id": int }
    Returns: Updated WorkerResponse object
    """
    worker = db.query(Worker).filter(Worker.worker_id == worker_id).first()
    if not worker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Worker with ID {worker_id} not found"
        )
    
    try:
        worker.current_area_id = area_assignment.area_id
        db.commit()
        db.refresh(worker)
        return worker
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error reassigning worker to area"
        )


@router.get("/current/assigned-tasks")
def get_current_worker_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    GET /workers/current/assigned-tasks
    Get all tasks assigned to the current logged-in worker
    
    Returns:
    {
        "worker": {...},
        "area": {...},
        "tasks": [...]
    }
    """
    if current_user.role != 'worker':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workers can access their assigned tasks"
        )
    
    # Find worker record linked to this user
    worker = db.query(Worker).filter(Worker.user_id == current_user.user_id).first()
    if not worker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Worker profile not found for this user account"
        )
    
    # Get area information
    area = None
    if worker.current_area_id:
        area = db.query(Area).filter(Area.area_id == worker.current_area_id).first()
    
    # Get all tasks assigned to this worker
    tasks = db.query(Task).filter(Task.assigned_worker_id == worker.worker_id).all()
    
    return {
        "worker": {
            "worker_id": worker.worker_id,
            "name": worker.name,
            "skill": worker.skill,
            "cost_per_day": float(worker.cost_per_day or 0),
            "current_area_id": worker.current_area_id,
            "current_task_id": worker.current_task_id
        },
        "area": {
            "area_id": area.area_id,
            "name": area.name,
            "location": area.location
        } if area else None,
        "tasks": [
            {
                "task_id": t.task_id,
                "title": t.title,
                "description": t.description,
                "area_id": t.area_id,
                "status": t.status,
                "planned_start": t.planned_start.isoformat() if t.planned_start else None,
                "planned_end": t.planned_end.isoformat() if t.planned_end else None,
                "actual_start": t.actual_start.isoformat() if t.actual_start else None,
                "actual_end": t.actual_end.isoformat() if t.actual_end else None,
                "progress_percent": t.progress_percent,
                "created_at": t.created_at.isoformat() if t.created_at else None
            }
            for t in tasks
        ]
    }

