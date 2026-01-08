"""
Dashboard Routes
Endpoints for Engineer Dashboard - Project overview and detailed project views

DESIGN PRINCIPLES:
- Dashboard aggregates data at DB level (SQL queries) not in Python
- Uses SQL JOIN and COUNT for efficiency
- Each endpoint represents one dashboard section
- Minimal Python logic - data processing happens in database

DBMS RELATIONSHIPS:
- Engineer -> Areas (via assigned_engineer_id) [One-to-Many]
- Area -> Tasks (via area_id) [One-to-Many]
- Area -> Workers (via current_area_id) [One-to-Many]
- Area -> Costs (via area_id) [One-to-Many]
- Area -> Budget (via area_id) [One-to-One]
- Area -> Alerts (via area_id) [One-to-Many]
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import SessionLocal
from models.area import Area
from models.task import Task
from models.worker import Worker
from models.cost import Cost
from models.budget import Budget
from models.alert import Alert
from schemas.area_schema import AreaResponse
from pydantic import BaseModel

router = APIRouter()


def get_db():
    """Dependency: Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Response Models for Dashboard
class TaskSummary(BaseModel):
    """Summary of task counts by status"""
    total: int
    pending: int
    in_progress: int
    completed: int
    blocked: int


class ProjectSummary(BaseModel):
    """Quick summary for project card on dashboard"""
    area_id: int
    name: str
    location: str
    status: str
    boundary_size: float
    task_count: int
    completed_tasks: int
    progress_percent: int  # % of tasks completed
    worker_count: int
    open_alerts: int
    budget_total: float
    cost_total: float


class ProjectDetails(BaseModel):
    """Full details for project details page"""
    area_id: int
    name: str
    location: str
    status: str
    boundary_size: float
    area_type: str
    assigned_engineer_id: int
    
    # Aggregated counts
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    in_progress_tasks: int
    blocked_tasks: int
    
    total_workers: int
    
    budget_total: float
    budget_spent: float
    budget_remaining: float
    
    open_alerts: int
    
    progress_percent: int


@router.get("/engineer/{engineer_id}/projects", response_model=list[ProjectSummary])
def get_engineer_projects(
    engineer_id: int,
    db: Session = Depends(get_db)
):
    """
    GET /dashboard/engineer/{engineer_id}/projects
    
    Fetch all projects (areas) assigned to an engineer with summary data.
    
    DBMS STRATEGY:
    - SQL aggregation: COUNT, GROUP_BY, JOIN with LEFT JOINs for optional relationships
    - Runs in single query with database-level aggregation
    - No Python loops or post-processing
    
    Returns:
    - List of ProjectSummary objects with:
      - Area basic info
      - Task counts (total, completed)
      - Worker count
      - Alert count
      - Budget/Cost summary
    """
    
    # Query: Get areas assigned to engineer
    # Use LEFT JOIN to handle optional relationships (no tasks, no workers, no alerts)
    results = db.query(
        Area.area_id,
        Area.name,
        Area.location,
        Area.status,
        Area.boundary_size,
        
        # Task aggregation
        func.count(func.distinct(Task.task_id)).label('task_count'),
        func.sum(func.if_(Task.status == 'completed', 1, 0)).label('completed_tasks'),
        
        # Worker count
        func.count(func.distinct(Worker.worker_id)).label('worker_count'),
        
        # Alert count
        func.count(func.distinct(Alert.alert_id)).label('open_alerts'),
        
        # Budget/Cost - wrap non-aggregated columns in MAX() for GROUP BY compliance
        func.coalesce(func.max(Budget.estimated_budget), 0).label('budget_total'),
        func.coalesce(func.sum(Cost.amount), 0).label('cost_total')
        
    ).outerjoin(Task, Area.area_id == Task.area_id)\
     .outerjoin(Worker, Area.area_id == Worker.current_area_id)\
     .outerjoin(Alert, Area.area_id == Alert.area_id)\
     .outerjoin(Budget, Area.area_id == Budget.area_id)\
     .outerjoin(Cost, Area.area_id == Cost.area_id)\
     .filter(Area.assigned_engineer_id == engineer_id)\
     .group_by(Area.area_id)\
     .all()
    
    if not results:
        return []
    
    # Convert to response model
    projects = []
    for row in results:
        task_count = row.task_count or 0
        completed_tasks = row.completed_tasks or 0
        progress_percent = int((completed_tasks / task_count * 100)) if task_count > 0 else 0
        
        projects.append(ProjectSummary(
            area_id=row.area_id,
            name=row.name,
            location=row.location,
            status=row.status,
            boundary_size=float(row.boundary_size) if row.boundary_size else 0,
            task_count=task_count,
            completed_tasks=completed_tasks,
            progress_percent=progress_percent,
            worker_count=row.worker_count or 0,
            open_alerts=row.open_alerts or 0,
            budget_total=float(row.budget_total),
            cost_total=float(row.cost_total)
        ))
    
    return projects


@router.get("/project/{area_id}", response_model=ProjectDetails)
def get_project_details(
    area_id: int,
    db: Session = Depends(get_db)
):
    """
    GET /dashboard/project/{area_id}
    
    Fetch detailed information for a single project (area).
    
    DBMS STRATEGY:
    - Single complex query with multiple aggregations
    - Uses GROUP_BY, COUNT, SUM, CASE expressions
    - All calculations at DB level
    
    Returns:
    - ProjectDetails object with all project information
    """
    
    # Main area query with aggregations
    result = db.query(
        Area.area_id,
        Area.name,
        Area.location,
        Area.status,
        Area.boundary_size,
        Area.area_type,
        Area.assigned_engineer_id,
        
        # Task aggregation
        func.count(func.distinct(Task.task_id)).label('total_tasks'),
        func.sum(func.if_(Task.status == 'completed', 1, 0)).label('completed_tasks'),
        func.sum(func.if_(Task.status == 'pending', 1, 0)).label('pending_tasks'),
        func.sum(func.if_(Task.status == 'in-progress', 1, 0)).label('in_progress_tasks'),
        func.sum(func.if_(Task.status == 'blocked', 1, 0)).label('blocked_tasks'),
        
        # Worker count
        func.count(func.distinct(Worker.worker_id)).label('total_workers'),
        
        # Budget/Cost
        func.coalesce(Budget.estimated_budget, 0).label('budget_total'),
        func.coalesce(func.sum(Cost.amount), 0).label('budget_spent'),
        
        # Alerts
        func.count(func.distinct(Alert.alert_id)).label('open_alerts')
        
    ).outerjoin(Task, Area.area_id == Task.area_id)\
     .outerjoin(Worker, Area.area_id == Worker.current_area_id)\
     .outerjoin(Budget, Area.area_id == Budget.area_id)\
     .outerjoin(Cost, Area.area_id == Cost.area_id)\
     .outerjoin(Alert, Area.area_id == Alert.area_id)\
     .filter(Area.area_id == area_id)\
     .group_by(Area.area_id)\
     .first()
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {area_id} not found"
        )
    
    # Calculate derived values
    total_tasks = result.total_tasks or 0
    completed_tasks = result.completed_tasks or 0
    progress_percent = int((completed_tasks / total_tasks * 100)) if total_tasks > 0 else 0
    
    budget_total = float(result.budget_total)
    budget_spent = float(result.budget_spent)
    budget_remaining = budget_total - budget_spent
    
    return ProjectDetails(
        area_id=result.area_id,
        name=result.name,
        location=result.location,
        status=result.status,
        boundary_size=float(result.boundary_size) if result.boundary_size else 0,
        area_type=result.area_type or "",
        assigned_engineer_id=result.assigned_engineer_id,
        total_tasks=total_tasks,
        completed_tasks=completed_tasks,
        pending_tasks=result.pending_tasks or 0,
        in_progress_tasks=result.in_progress_tasks or 0,
        blocked_tasks=result.blocked_tasks or 0,
        total_workers=result.total_workers or 0,
        budget_total=budget_total,
        budget_spent=budget_spent,
        budget_remaining=budget_remaining,
        open_alerts=result.open_alerts or 0,
        progress_percent=progress_percent
    )


@router.get("/project/{area_id}/tasks")
def get_project_tasks(area_id: int, db: Session = Depends(get_db)):
    """
    GET /dashboard/project/{area_id}/tasks
    
    Fetch all tasks for a project with status breakdown.
    
    Returns: List of tasks with:
    - task_id, title, status, assigned_worker, progress_percent, dates
    """
    
    # Verify area exists
    area = db.query(Area).filter(Area.area_id == area_id).first()
    if not area:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Area with ID {area_id} not found"
        )
    
    # Get all tasks for this area
    tasks = db.query(Task)\
        .filter(Task.area_id == area_id)\
        .order_by(Task.status, Task.task_id)\
        .all()
    
    return [
        {
            "task_id": t.task_id,
            "title": t.title,
            "description": t.description,
            "status": t.status,
            "progress_percent": t.progress_percent,
            "assigned_worker_id": t.assigned_worker_id,
            "planned_start": str(t.planned_start) if t.planned_start else None,
            "planned_end": str(t.planned_end) if t.planned_end else None,
            "actual_start": str(t.actual_start) if t.actual_start else None,
            "actual_end": str(t.actual_end) if t.actual_end else None
        }
        for t in tasks
    ]


@router.get("/project/{area_id}/workers")
def get_project_workers(area_id: int, db: Session = Depends(get_db)):
    """
    GET /dashboard/project/{area_id}/workers
    
    Fetch all workers assigned to a project.
    
    Returns: List of workers with:
    - worker_id, name, skill, cost_per_day, contact, task_count
    """
    
    # Verify area exists
    area = db.query(Area).filter(Area.area_id == area_id).first()
    if not area:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Area with ID {area_id} not found"
        )
    
    # Get all workers for this area with task counts
    workers = db.query(
        Worker.worker_id,
        Worker.name,
        Worker.skill,
        Worker.cost_per_day,
        Worker.contact,
        func.count(Task.task_id).label('task_count')
    ).filter(Worker.current_area_id == area_id)\
     .outerjoin(Task, Worker.worker_id == Task.assigned_worker_id)\
     .group_by(Worker.worker_id)\
     .all()
    
    return [
        {
            "worker_id": w.worker_id,
            "name": w.name,
            "skill": w.skill,
            "cost_per_day": float(w.cost_per_day) if w.cost_per_day else 0,
            "contact": w.contact,
            "task_count": w.task_count or 0
        }
        for w in workers
    ]


@router.get("/project/{area_id}/alerts")
def get_project_alerts(area_id: int, db: Session = Depends(get_db)):
    """
    GET /dashboard/project/{area_id}/alerts
    
    Fetch all open alerts for a project.
    
    Returns: List of alerts sorted by severity
    """
    
    # Verify area exists
    area = db.query(Area).filter(Area.area_id == area_id).first()
    if not area:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Area with ID {area_id} not found"
        )
    
    # Get alerts, ordered by severity
    alerts = db.query(Alert)\
        .filter(Alert.area_id == area_id)\
        .order_by(Alert.severity.desc(), Alert.created_at.desc())\
        .all()
    
    return [
        {
            "alert_id": a.alert_id,
            "title": a.title,
            "description": a.description,
            "severity": a.severity,
            "status": a.status,
            "created_at": str(a.created_at)
        }
        for a in alerts
    ]


@router.get("/project/{area_id}/budget")
def get_project_budget(area_id: int, db: Session = Depends(get_db)):
    """
    GET /dashboard/project/{area_id}/budget
    
    Fetch budget and cost information for a project.
    
    Returns:
    - Budget total, spent amount, remaining amount
    - Cost breakdown by category
    """
    
    # Verify area exists
    area = db.query(Area).filter(Area.area_id == area_id).first()
    if not area:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Area with ID {area_id} not found"
        )
    
    # Get budget
    budget = db.query(Budget).filter(Budget.area_id == area_id).first()
    
    # Get costs by type
    costs_by_type = db.query(
        Cost.type,
        func.sum(Cost.amount).label('total')
    ).filter(Cost.area_id == area_id)\
     .group_by(Cost.type)\
     .all()
    
    total_spent = sum(c.total for c in costs_by_type) if costs_by_type else 0
    budget_total = float(budget.total_budget) if budget else 0
    
    return {
        "budget_total": budget_total,
        "budget_spent": float(total_spent),
        "budget_remaining": budget_total - float(total_spent),
        "costs_by_type": [
            {
                "type": c.type,
                "amount": float(c.total)
            }
            for c in costs_by_type
        ]
    }
