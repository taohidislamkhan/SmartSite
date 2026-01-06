"""
Schedule Routes
CRUD endpoints for Schedule management
One-to-one relationship with Task (UNIQUE FK)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database import SessionLocal
from models.schedule import Schedule
from schemas.schedule_schema import ScheduleCreate, ScheduleResponse

router = APIRouter()


def get_db():
    """Dependency: Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[ScheduleResponse])
def get_schedules(db: Session = Depends(get_db)):
    """
    GET /schedules
    Retrieve all schedules
    
    DBMS Note: One-to-one with Task (UNIQUE FK on task_id)
    Each task has at most one schedule record
    
    Returns: List of ScheduleResponse objects
    """
    schedules = db.query(Schedule).all()
    return schedules


@router.get("/task/{task_id}", response_model=ScheduleResponse)
def get_schedule_for_task(task_id: int, db: Session = Depends(get_db)):
    """
    GET /schedules/task/{task_id}
    Retrieve schedule for specific task (one-to-one relationship)
    
    Returns: ScheduleResponse object or 404 if not found
    """
    schedule = db.query(Schedule).filter(Schedule.task_id == task_id).first()
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Schedule for task {task_id} not found"
        )
    return schedule


@router.get("/{schedule_id}", response_model=ScheduleResponse)
def get_schedule(schedule_id: int, db: Session = Depends(get_db)):
    """
    GET /schedules/{schedule_id}
    Retrieve schedule by ID
    Returns: ScheduleResponse object or 404 if not found
    """
    schedule = db.query(Schedule).filter(Schedule.schedule_id == schedule_id).first()
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Schedule with ID {schedule_id} not found"
        )
    return schedule


@router.post("/", response_model=ScheduleResponse, status_code=status.HTTP_201_CREATED)
def create_schedule(schedule_data: ScheduleCreate, db: Session = Depends(get_db)):
    """
    POST /schedules
    Create new schedule for a task
    
    Required: task_id
    Constraint: task_id must be UNIQUE (one-to-one)
    
    DBMS Normalization: Separate table avoids NULL columns in Task
    (Task has planned_start/end, actual_start/end, but detailed schedule
     with notes goes in Schedule table)
    
    Returns: Created ScheduleResponse object
    """
    try:
        # Check if schedule already exists for this task
        existing = db.query(Schedule).filter(Schedule.task_id == schedule_data.task_id).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Schedule already exists for task {schedule_data.task_id}"
            )
        
        new_schedule = Schedule(**schedule_data.dict())
        db.add(new_schedule)
        db.commit()
        db.refresh(new_schedule)
        return new_schedule
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid schedule data or task ID (may already have schedule)"
        )


@router.put("/{schedule_id}", response_model=ScheduleResponse)
def update_schedule(
    schedule_id: int,
    schedule_data: ScheduleCreate,
    db: Session = Depends(get_db)
):
    """
    PUT /schedules/{schedule_id}
    Update schedule by ID
    
    Note: Cannot change task_id (UNIQUE constraint)
    
    Returns: Updated ScheduleResponse object or 404 if not found
    """
    schedule = db.query(Schedule).filter(Schedule.schedule_id == schedule_id).first()
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Schedule with ID {schedule_id} not found"
        )
    
    try:
        # Prevent task_id change
        update_data = schedule_data.dict(exclude_unset=True)
        if 'task_id' in update_data and update_data['task_id'] != schedule.task_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot change task_id (UNIQUE constraint)"
            )
        
        for key, value in update_data.items():
            if key != 'task_id':  # Skip task_id
                setattr(schedule, key, value)
        
        db.commit()
        db.refresh(schedule)
        return schedule
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid update data"
        )


@router.delete("/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_schedule(schedule_id: int, db: Session = Depends(get_db)):
    """
    DELETE /schedules/{schedule_id}
    Delete schedule by ID
    
    Note: Task record remains (only Schedule deleted)
    """
    schedule = db.query(Schedule).filter(Schedule.schedule_id == schedule_id).first()
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Schedule with ID {schedule_id} not found"
        )
    
    try:
        db.delete(schedule)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error deleting schedule"
        )
