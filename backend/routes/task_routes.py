"""
Task Routes
CRUD endpoints for Task management
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database import SessionLocal
from models.task import Task
from schemas.task_schema import TaskCreate, TaskResponse

router = APIRouter()


def get_db():
    """Dependency: Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(task_data: TaskCreate, db: Session = Depends(get_db)):
    """
    POST /tasks
    Create a new task
    Required: area_id, title
    Foreign keys: area_id (required), assigned_worker_id (optional)
    Returns: Created TaskResponse object
    """
    try:
        new_task = Task(**task_data.dict())
        db.add(new_task)
        db.commit()
        db.refresh(new_task)
        return new_task
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task data or invalid area/worker ID"
        )


@router.get("/", response_model=list[TaskResponse])
def get_tasks(
    area_id: int = None,
    status_filter: str = None,
    db: Session = Depends(get_db)
):
    """
    GET /tasks
    Retrieve all tasks with optional filters
    Query params: 
      - area_id: filter by area
      - status_filter: filter by status (pending|in-progress|completed|blocked)
    Returns: List of TaskResponse objects
    """
    query = db.query(Task)
    if area_id:
        query = query.filter(Task.area_id == area_id)
    if status_filter:
        query = query.filter(Task.status == status_filter)
    return query.all()


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):
    """
    GET /tasks/{task_id}
    Retrieve task by ID
    Returns: TaskResponse object or 404 if not found
    """
    task = db.query(Task).filter(Task.task_id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found"
        )
    return task


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_data: TaskCreate,
    db: Session = Depends(get_db)
):
    """
    PUT /tasks/{task_id}
    Update task by ID
    Returns: Updated TaskResponse object or 404 if not found
    """
    task = db.query(Task).filter(Task.task_id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found"
        )
    
    try:
        for key, value in task_data.dict(exclude_unset=True).items():
            setattr(task, key, value)
        db.commit()
        db.refresh(task)
        return task
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid update data or invalid area/worker ID"
        )


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """
    DELETE /tasks/{task_id}
    Delete task by ID
    DBMS Note: ON DELETE CASCADE will also delete:
    - Schedule record for this task (if exists)
    """
    task = db.query(Task).filter(Task.task_id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found"
        )
    
    try:
        db.delete(task)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error deleting task"
        )
