"""
Analytics Routes - Read-Only Endpoints for Database Views
Endpoints query pre-optimized database views that encapsulate complex business logic
Purpose: Demonstrate DBMS query optimization and separation of concerns

CRITICAL PRINCIPLE:
- These endpoints use raw SQL queries or ORM mapping to EXISTING database views
- NO Python-level logic duplication
- Business logic lives in SQL (views), not application code
- This is the CORRECT way to build scalable analytical APIs
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text

from database import SessionLocal
from schemas.analytics_schema import (
    DelayedTaskResponse,
    LowMaterialStockResponse,
    CostOverBudgetResponse,
    AreaProgressSummaryResponse
)

router = APIRouter()


def get_db():
    """Dependency: Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ============================================================================
# ENDPOINT 1: DELAYED TASKS
# ============================================================================

@router.get("/delayed-tasks", response_model=list[DelayedTaskResponse])
def get_delayed_tasks(
    db: Session = Depends(get_db),
    severity_filter: str = None,
    area_id: int = None,
    limit: int = 100
):
    """
    GET /analytics/delayed-tasks
    Fetch tasks past their planned end date with overdue days and severity

    DBMS DESIGN PRINCIPLE:
    - vw_delayed_tasks view calculates DATEDIFF(NOW(), planned_end_date)
    - Avoids: Python datetime calculations in loop
    - Avoids: Fetching all tasks and filtering in-app
    - Performance: Single query with WHERE clauses at database level

    Query Logic (in SQL view, NOT Python):
    1. Filter tasks where status != 'completed' AND planned_end_date < NOW()
    2. Calculate days_overdue = DATEDIFF(NOW(), planned_end_date)
    3. Assign severity: Critical (>30d), High (>14d), Medium (>7d), Low (<=7d)
    4. JOIN with Area and Worker for display data
    5. ORDER BY days_overdue DESC

    Query Params:
    - severity_filter: Optional filter by severity (Critical, High, Medium, Low)
    - area_id: Optional filter by specific area
    - limit: Max results (default 100)

    Returns: Sorted list of delayed tasks with overdue information
    """
    try:
        query = "SELECT * FROM vw_delayed_tasks WHERE 1=1"
        params = {}

        if severity_filter:
            query += " AND severity = :severity"
            params["severity"] = severity_filter

        if area_id:
            query += " AND area_id = :area_id"
            params["area_id"] = area_id

        query += f" LIMIT {limit}"

        result = db.execute(text(query), params)
        rows = result.fetchall()

        # Convert database rows to Pydantic models
        tasks = []
        for row in rows:
            tasks.append(DelayedTaskResponse(
                task_id=row.task_id,
                area_id=row.area_id,
                area_name=row.area_name,
                task_name=row.task_name,
                description=row.description,
                task_type=row.task_type,
                status=row.status,
                planned_start_date=row.planned_start_date,
                planned_end_date=row.planned_end_date,
                actual_start_date=row.actual_start_date,
                actual_end_date=row.actual_end_date,
                progress_percent=row.progress_percent,
                assigned_worker_id=row.assigned_worker_id,
                assigned_worker=row.assigned_worker,
                days_overdue=row.days_overdue,
                severity=row.severity
            ))

        return tasks

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error querying delayed tasks: {str(e)}"
        )


# ============================================================================
# ENDPOINT 2: LOW MATERIAL STOCK
# ============================================================================

@router.get("/low-material-stock", response_model=list[LowMaterialStockResponse])
def get_low_material_stock(
    db: Session = Depends(get_db),
    area_id: int = None,
    stock_level_filter: str = None,
    limit: int = 100
):
    """
    GET /analytics/low-material-stock
    Fetch materials below reorder threshold with reorder costs

    DBMS DESIGN PRINCIPLE:
    - vw_low_material_stock filters WHERE quantity <= reorder_threshold
    - Calculates reorder cost = (threshold - quantity) * unit_cost
    - Avoids: Fetching ALL materials and filtering in Python loop
    - Optimization: Single filtered query with calculated fields

    Query Logic (in SQL view, NOT Python):
    1. Filter WHERE quantity <= reorder_threshold
    2. Calculate units_needed = reorder_threshold - quantity
    3. Calculate reorder_cost = units_needed * unit_cost
    4. Assign stock_level based on quantity percentage
    5. JOIN with Area for location information

    Query Params:
    - area_id: Optional filter by specific area
    - stock_level_filter: Optional filter (Critical, High, Medium, OK)
    - limit: Max results (default 100)

    Returns: Sorted list of materials with reorder information
    """
    try:
        query = "SELECT * FROM vw_low_material_stock WHERE 1=1"
        params = {}

        if area_id:
            query += " AND area_id = :area_id"
            params["area_id"] = area_id

        if stock_level_filter:
            query += " AND stock_level = :stock_level"
            params["stock_level"] = stock_level_filter

        query += f" LIMIT {limit}"

        result = db.execute(text(query), params)
        rows = result.fetchall()

        materials = []
        for row in rows:
            materials.append(LowMaterialStockResponse(
                material_id=row.material_id,
                area_id=row.area_id,
                area_name=row.area_name,
                material_name=row.material_name,
                material_type=row.material_type,
                quantity=row.quantity,
                unit=row.unit,
                unit_cost=row.unit_cost,
                reorder_threshold=row.reorder_threshold,
                units_needed=row.units_needed,
                reorder_cost=row.reorder_cost,
                last_updated=row.last_updated,
                stock_level=row.stock_level
            ))

        return materials

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error querying low material stock: {str(e)}"
        )


# ============================================================================
# ENDPOINT 3: COST OVER BUDGET PER AREA
# ============================================================================

@router.get("/cost-over-budget", response_model=list[CostOverBudgetResponse])
def get_cost_over_budget(
    db: Session = Depends(get_db),
    budget_status_filter: str = None,
    area_id: int = None,
    fiscal_year: str = None,
    limit: int = 100
):
    """
    GET /analytics/cost-over-budget
    Compare actual costs against budgets by area with variance analysis

    DBMS DESIGN PRINCIPLE:
    - vw_cost_over_budget aggregates costs with SUM(cost.amount) GROUP BY area
    - Pre-calculates variance = estimated_budget - actual_cost
    - Avoids: N+1 problem (fetch budget, then costs for each, calculate in Python)
    - Optimization: Single query with all aggregations at database layer

    Query Logic (in SQL view, NOT Python):
    1. LEFT JOIN Budget with Cost table
    2. GROUP BY area_id, fiscal_year
    3. SUM(cost.amount) to get actual_cost per area
    4. Calculate remaining_budget = estimated - actual
    5. Calculate utilization_percent = (actual / estimated * 100)
    6. Assign status: Over Budget, Caution (85%+), On Track (70%+), Under Budget

    Query Params:
    - budget_status_filter: Filter by status (Over Budget, Caution, On Track, Under Budget)
    - area_id: Filter by specific area
    - fiscal_year: Filter by year (YYYY format)
    - limit: Max results (default 100)

    Returns: List of budgets with cost variance analysis
    """
    try:
        query = "SELECT * FROM vw_cost_over_budget WHERE 1=1"
        params = {}

        if budget_status_filter:
            query += " AND budget_status = :budget_status"
            params["budget_status"] = budget_status_filter

        if area_id:
            query += " AND area_id = :area_id"
            params["area_id"] = area_id

        if fiscal_year:
            query += " AND fiscal_year = :fiscal_year"
            params["fiscal_year"] = fiscal_year

        query += f" LIMIT {limit}"

        result = db.execute(text(query), params)
        rows = result.fetchall()

        budgets = []
        for row in rows:
            budgets.append(CostOverBudgetResponse(
                budget_id=row.budget_id,
                area_id=row.area_id,
                area_name=row.area_name,
                fiscal_year=row.fiscal_year,
                estimated_budget=row.estimated_budget,
                actual_cost=row.actual_cost,
                remaining_budget=row.remaining_budget,
                utilization_percent=row.utilization_percent,
                budget_status=row.budget_status,
                cost_entries=row.cost_entries,
                created_at=row.created_at
            ))

        return budgets

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error querying cost over budget: {str(e)}"
        )


# ============================================================================
# ENDPOINT 4: AREA PROGRESS SUMMARY
# ============================================================================

@router.get("/area-progress-summary", response_model=list[AreaProgressSummaryResponse])
def get_area_progress_summary(
    db: Session = Depends(get_db),
    area_id: int = None,
    min_progress: float = 0,
    max_progress: float = 100,
    limit: int = 100
):
    """
    GET /analytics/area-progress-summary
    Comprehensive area progress dashboard with all key metrics in one query

    DBMS DESIGN PRINCIPLE - MASSIVE OPTIMIZATION:
    - vw_area_progress_summary replaces 7+ separate API calls
    - Single view with multiple COUNT, SUM, AVG calculations
    - Avoids: Calling GET /areas, GET /tasks, GET /workers, GET /equipment, 
              GET /costs, GET /budgets, GET /safety-incidents separately
    - Database handles all aggregations in ONE query with pre-optimized joins

    Query Logic (in SQL view, NOT Python):
    1. LEFT JOIN all related tables to Area
    2. Use CASE statements to count by status (e.g., CASE WHEN status='completed' THEN 1)
    3. COUNT(DISTINCT ...) to avoid duplicates in joins
    4. SUM and AVG for financial/progress metrics
    5. Calculate overall_progress_percent = completed_tasks / total_tasks * 100
    6. GROUP BY area_id with HAVING clauses for filtering

    Replaces these multiple endpoints:
    - GET /areas/{area_id}
    - GET /tasks?area_id={area_id} 
    - GET /workers?area_id={area_id}
    - GET /equipment?area_id={area_id}
    - GET /costs?area_id={area_id}
    - GET /budgets?area_id={area_id}
    - GET /safety-incidents?area_id={area_id}

    Query Params:
    - area_id: Filter by specific area (None = all areas)
    - min_progress: Filter areas with progress >= this value
    - max_progress: Filter areas with progress <= this value
    - limit: Max results (default 100)

    Returns: Comprehensive dashboard data per area
    """
    try:
        query = "SELECT * FROM vw_area_progress_summary WHERE 1=1"
        params = {}

        if area_id:
            query += " AND area_id = :area_id"
            params["area_id"] = area_id

        if min_progress > 0:
            query += " AND overall_progress_percent >= :min_progress"
            params["min_progress"] = min_progress

        if max_progress < 100:
            query += " AND overall_progress_percent <= :max_progress"
            params["max_progress"] = max_progress

        query += f" LIMIT {limit}"

        result = db.execute(text(query), params)
        rows = result.fetchall()

        summaries = []
        for row in rows:
            summaries.append(AreaProgressSummaryResponse(
                area_id=row.area_id,
                area_name=row.area_name,
                area_type=row.area_type,
                status=row.status,
                boundary_size=row.boundary_size,
                total_tasks=row.total_tasks,
                completed_tasks=row.completed_tasks,
                in_progress_tasks=row.in_progress_tasks,
                pending_tasks=row.pending_tasks,
                blocked_tasks=row.blocked_tasks,
                overall_progress_percent=row.overall_progress_percent,
                avg_task_progress=row.avg_task_progress,
                assigned_workers=row.assigned_workers,
                total_worker_cost_per_day=row.total_worker_cost_per_day,
                total_equipment=row.total_equipment,
                equipment_in_use=row.equipment_in_use,
                equipment_maintenance=row.equipment_maintenance,
                total_actual_cost=row.total_actual_cost,
                total_budgeted=row.total_budgeted,
                safety_incidents=row.safety_incidents,
                high_severity_incidents=row.high_severity_incidents,
                total_materials=row.total_materials,
                low_stock_materials=row.low_stock_materials,
                last_activity=row.last_activity
            ))

        return summaries

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error querying area progress summary: {str(e)}"
        )


# ============================================================================
# BONUS ENDPOINT: ANALYTICS HEALTH CHECK
# ============================================================================

@router.get("/health", tags=["Analytics"])
def analytics_health(db: Session = Depends(get_db)):
    """
    GET /analytics/health
    Verify all required views exist in database
    
    Useful for: Pre-flight checks before accessing analytics endpoints
    Returns: Status of each view
    """
    views = [
        "vw_delayed_tasks",
        "vw_low_material_stock",
        "vw_cost_over_budget",
        "vw_area_progress_summary"
    ]
    
    view_status = {}
    for view in views:
        try:
            result = db.execute(text(f"SELECT COUNT(*) FROM {view}"))
            view_status[view] = "OK"
        except Exception as e:
            view_status[view] = f"ERROR: {str(e)}"
    
    all_ok = all(status == "OK" for status in view_status.values())
    
    return {
        "status": "healthy" if all_ok else "degraded",
        "views": view_status,
        "message": "All analytics views available" if all_ok else "Some views missing - check database"
    }
