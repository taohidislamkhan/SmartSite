"""
Advanced SQL Query Routes
Endpoints demonstrating complex SQL aggregations, GROUP BY, HAVING, JOINs
Purpose: DBMS exam preparation - explain SQL logic for grading

SQL PRINCIPLES DEMONSTRATED:
1. Aggregation Functions: SUM(), COUNT(), AVG(), MAX(), MIN()
2. Grouping: GROUP BY with proper WHERE/HAVING placement
3. JOINs: Multiple table joins for relationship queries
4. Filtering: WHERE for row-level, HAVING for group-level
5. Sorting: ORDER BY on calculated fields
6. Date Functions: DATEDIFF, NOW(), date comparisons
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import text

from database import SessionLocal
from schemas.advanced_query_schema import (
    TotalCostPerAreaResponse,
    WorkerAllocationResponse,
    TaskDelayedResponse,
    MaterialBelowThresholdResponse,
    HighestCostWorkerResponse,
    SafetyIncidentBySeverityResponse,
    SafetyIncidentDetailResponse,
    AreaCostSummaryResponse
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
# QUERY 1: TOTAL COST PER AREA (GROUP BY)
# ============================================================================

@router.get("/total-cost-per-area", response_model=list[TotalCostPerAreaResponse])
def get_total_cost_per_area(
    db: Session = Depends(get_db),
    min_cost: float = Query(0, ge=0),
    limit: int = 100
):
    """
    GET /advanced-queries/total-cost-per-area
    Calculate total costs aggregated by area with statistics
    
    SQL CONCEPT - GROUP BY AGGREGATION:
    SELECT 
        area.area_id,
        area.area_name,
        SUM(cost.amount) as total_cost,          -- Aggregate function
        COUNT(cost.cost_id) as cost_count,       -- Counting rows
        AVG(cost.amount) as average_cost,        -- Average of group
        MAX(cost.amount) as max_cost,            -- Maximum in group
        MIN(cost.amount) as min_cost             -- Minimum in group
    FROM Cost
    JOIN Area ON Cost.area_id = Area.area_id
    GROUP BY area.area_id, area.area_name        -- Grouping dimension
    HAVING SUM(cost.amount) > :min_cost          -- Filtering aggregates
    ORDER BY total_cost DESC
    
    DBMS PRINCIPLES:
    - Aggregation at database layer, not Python
    - GROUP BY eliminates duplicates and aggregates
    - HAVING filters on aggregate results (not WHERE which filters rows)
    
    Query Params:
    - min_cost: Only return areas with total >= this amount
    - limit: Max results
    
    Returns: List of areas with complete cost breakdown
    """
    query = """
    SELECT 
        a.area_id,
        a.name as area_name,
        COALESCE(SUM(c.amount), 0) as total_cost,
        COUNT(DISTINCT c.cost_id) as cost_count,
        ROUND(COALESCE(AVG(c.amount), 0), 2) as average_cost,
        COALESCE(MAX(c.amount), 0) as max_cost,
        COALESCE(MIN(c.amount), 0) as min_cost
    FROM Area a
    LEFT JOIN Cost c ON a.area_id = c.area_id
    GROUP BY a.area_id, a.name
    HAVING COALESCE(SUM(c.amount), 0) >= :min_cost
    ORDER BY total_cost DESC
    LIMIT :limit
    """
    
    try:
        result = db.execute(text(query), {"min_cost": min_cost, "limit": limit})
        rows = result.fetchall()
        
        response = []
        for row in rows:
            response.append(TotalCostPerAreaResponse(
                area_id=row.area_id,
                area_name=row.area_name,
                total_cost=row.total_cost,
                cost_count=row.cost_count,
                average_cost=row.average_cost,
                max_cost=row.max_cost,
                min_cost=row.min_cost
            ))
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing cost aggregation query: {str(e)}"
        )


# ============================================================================
# QUERY 2: WORKER ALLOCATION PER AREA (GROUP BY + JOIN)
# ============================================================================

@router.get("/worker-allocation-per-area", response_model=list[WorkerAllocationResponse])
def get_worker_allocation_per_area(
    db: Session = Depends(get_db),
    min_workers: int = Query(1, ge=1),
    limit: int = 100
):
    """
    GET /advanced-queries/worker-allocation-per-area
    Analyze worker distribution and costs by area
    
    SQL CONCEPT - GROUP BY WITH SUBQUERY:
    SELECT 
        a.area_id,
        a.area_name,
        COUNT(DISTINCT w.worker_id) as total_workers,    -- COUNT DISTINCT
        SUM(w.cost_per_day) as total_daily_cost,         -- Aggregating monetary values
        AVG(w.cost_per_day) as average_worker_cost,
        (SELECT worker_name FROM Worker WHERE current_area_id = a.area_id 
         ORDER BY cost_per_day DESC LIMIT 1) as highest_paid_worker
    FROM Area a
    LEFT JOIN Worker w ON a.area_id = w.current_area_id
    GROUP BY a.area_id, a.area_name
    HAVING COUNT(DISTINCT w.worker_id) >= :min_workers
    
    DBMS PRINCIPLES:
    - COUNT(DISTINCT ...) prevents counting duplicates
    - Subquery for top-1 worker (alternative: window functions)
    - GROUP BY combines multiple aggregates for holistic view
    
    Query Params:
    - min_workers: Only return areas with at least this many workers
    - limit: Max results
    
    Returns: Worker allocation with cost analysis per area
    """
    query = """
    SELECT 
        a.area_id,
        a.name as area_name,
        COUNT(DISTINCT w.worker_id) as total_workers,
        COALESCE(SUM(w.cost_per_day), 0) as total_daily_cost,
        ROUND(COALESCE(AVG(w.cost_per_day), 0), 2) as average_worker_cost,
        (
            SELECT w2.worker_name 
            FROM Worker w2 
            WHERE w2.current_area_id = a.area_id 
            ORDER BY w2.cost_per_day DESC 
            LIMIT 1
        ) as highest_paid_worker,
        (
            SELECT w3.cost_per_day 
            FROM Worker w3 
            WHERE w3.current_area_id = a.area_id 
            ORDER BY w3.cost_per_day DESC 
            LIMIT 1
        ) as highest_paid_cost
    FROM Area a
    LEFT JOIN Worker w ON a.area_id = w.current_area_id
    GROUP BY a.area_id, a.name
    HAVING COUNT(DISTINCT w.worker_id) >= :min_workers
    ORDER BY total_daily_cost DESC
    LIMIT :limit
    """
    
    try:
        result = db.execute(text(query), {"min_workers": min_workers, "limit": limit})
        rows = result.fetchall()
        
        response = []
        for row in rows:
            response.append(WorkerAllocationResponse(
                area_id=row.area_id,
                area_name=row.area_name,
                total_workers=row.total_workers,
                total_daily_cost=row.total_daily_cost,
                average_worker_cost=row.average_worker_cost,
                highest_paid_worker=row.highest_paid_worker,
                highest_paid_cost=row.highest_paid_cost
            ))
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing worker allocation query: {str(e)}"
        )


# ============================================================================
# QUERY 3: TASKS DELAYED BY MORE THAN X DAYS (WHERE + DATE FUNCTIONS)
# ============================================================================

@router.get("/tasks-delayed-by-days", response_model=list[TaskDelayedResponse])
def get_tasks_delayed_by_days(
    db: Session = Depends(get_db),
    min_days_overdue: int = Query(1, ge=1),
    limit: int = 100
):
    """
    GET /advanced-queries/tasks-delayed-by-days
    Find tasks past deadline by specified number of days
    
    SQL CONCEPT - DATE FUNCTIONS AND FILTERING:
    SELECT 
        t.task_id,
        t.task_name,
        a.area_id,
        a.area_name,
        t.assigned_worker_id,
        w.worker_name,
        t.planned_end_date,
        DATEDIFF(NOW(), t.planned_end_date) as days_overdue  -- Date arithmetic
    FROM Task t
    JOIN Area a ON t.area_id = a.area_id
    LEFT JOIN Worker w ON t.assigned_worker_id = w.worker_id
    WHERE t.status != 'completed'                           -- Row-level filter
      AND t.planned_end_date < NOW()                        -- Date comparison
      AND DATEDIFF(NOW(), t.planned_end_date) >= :min_days  -- Calculated field filter
    ORDER BY days_overdue DESC
    
    DBMS PRINCIPLES:
    - DATEDIFF() calculates time difference at database layer
    - WHERE clause filters based on calculated expressions
    - JOIN brings context (area, worker names) without separate queries
    - Ordering by calculated column (days_overdue)
    
    Query Params:
    - min_days_overdue: Only return tasks overdue by at least this many days
    - limit: Max results
    
    Returns: Delayed tasks with worker assignments
    """
    query = """
    SELECT 
        t.task_id,
        t.task_name,
        a.area_id,
        a.name as area_name,
        t.assigned_worker_id,
        w.worker_name,
        t.planned_end_date,
        DATEDIFF(NOW(), t.planned_end_date) as days_overdue,
        t.progress_percent,
        t.status
    FROM Task t
    JOIN Area a ON t.area_id = a.area_id
    LEFT JOIN Worker w ON t.assigned_worker_id = w.worker_id
    WHERE t.status != 'completed'
      AND t.planned_end_date < NOW()
      AND DATEDIFF(NOW(), t.planned_end_date) >= :min_days
    ORDER BY days_overdue DESC
    LIMIT :limit
    """
    
    try:
        result = db.execute(text(query), {"min_days": min_days_overdue, "limit": limit})
        rows = result.fetchall()
        
        response = []
        for row in rows:
            response.append(TaskDelayedResponse(
                task_id=row.task_id,
                task_name=row.task_name,
                area_id=row.area_id,
                area_name=row.area_name,
                assigned_worker_id=row.assigned_worker_id,
                assigned_worker=row.worker_name,
                planned_end_date=row.planned_end_date,
                days_overdue=row.days_overdue,
                progress_percent=row.progress_percent,
                status=row.status
            ))
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing delayed tasks query: {str(e)}"
        )


# ============================================================================
# QUERY 4: MATERIALS BELOW REORDER THRESHOLD (COLUMN COMPARISON)
# ============================================================================

@router.get("/materials-below-threshold", response_model=list[MaterialBelowThresholdResponse])
def get_materials_below_threshold(
    db: Session = Depends(get_db),
    area_id: int = Query(None),
    limit: int = 100
):
    """
    GET /advanced-queries/materials-below-threshold
    Identify materials that need reordering
    
    SQL CONCEPT - COLUMN COMPARISON IN WHERE CLAUSE:
    SELECT 
        m.material_id,
        m.material_name,
        m.quantity,
        m.reorder_threshold,
        (m.reorder_threshold - m.quantity) as units_needed,
        (m.reorder_threshold - m.quantity) * m.unit_cost as reorder_cost
    FROM Material m
    WHERE m.quantity <= m.reorder_threshold               -- Comparing two columns
    AND (m.reorder_threshold - m.quantity) > 0           -- Calculated field comparison
    ORDER BY units_needed DESC
    
    DBMS PRINCIPLES:
    - WHERE clause can compare columns directly (not just column vs. constant)
    - Calculated fields in WHERE clause evaluated at database
    - ORDER BY calculated expression for meaningful sorting
    
    Query Params:
    - area_id: Optional filter by specific area
    - limit: Max results
    
    Returns: Materials below threshold with reorder information
    """
    query = """
    SELECT 
        m.material_id,
        m.material_name,
        m.area_id,
        a.name as area_name,
        m.quantity,
        m.unit,
        m.reorder_threshold,
        (m.reorder_threshold - m.quantity) as units_needed,
        m.unit_cost,
        ROUND((m.reorder_threshold - m.quantity) * m.unit_cost, 2) as reorder_cost,
        m.last_updated
    FROM Material m
    JOIN Area a ON m.area_id = a.area_id
    WHERE m.quantity <= m.reorder_threshold
    """
    
    params = {}
    if area_id:
        query += " AND m.area_id = :area_id"
        params["area_id"] = area_id
    
    query += """
    ORDER BY units_needed DESC
    LIMIT :limit
    """
    params["limit"] = limit
    
    try:
        result = db.execute(text(query), params)
        rows = result.fetchall()
        
        response = []
        for row in rows:
            response.append(MaterialBelowThresholdResponse(
                material_id=row.material_id,
                material_name=row.material_name,
                area_id=row.area_id,
                area_name=row.area_name,
                quantity=row.quantity,
                unit=row.unit,
                reorder_threshold=row.reorder_threshold,
                units_needed=row.units_needed,
                unit_cost=row.unit_cost,
                reorder_cost=row.reorder_cost,
                last_updated=row.last_updated
            ))
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing materials below threshold query: {str(e)}"
        )


# ============================================================================
# QUERY 5: HIGHEST COST WORKERS (ORDER BY + TOP-N)
# ============================================================================

@router.get("/highest-cost-workers", response_model=list[HighestCostWorkerResponse])
def get_highest_cost_workers(
    db: Session = Depends(get_db),
    limit: int = Query(10, ge=1, le=100)
):
    """
    GET /advanced-queries/highest-cost-workers
    Identify most expensive workers by daily cost rate
    
    SQL CONCEPT - ORDER BY WITH AGGREGATION (LEFT JOIN):
    SELECT 
        w.worker_id,
        w.worker_name,
        w.cost_per_day,
        COUNT(t.task_id) as total_tasks_assigned,         -- Aggregation
        SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks
    FROM Worker w
    LEFT JOIN Task t ON w.worker_id = t.assigned_worker_id
    GROUP BY w.worker_id, w.worker_name, w.cost_per_day
    ORDER BY w.cost_per_day DESC                          -- Sorting by monetary column
    LIMIT :limit
    
    DBMS PRINCIPLES:
    - ORDER BY on high-cardinality column (cost_per_day) for ranking
    - LIMIT clause for TOP-N query pattern
    - LEFT JOIN + GROUP BY for including workers with no tasks
    - CASE WHEN for conditional aggregation
    
    Query Params:
    - limit: Number of top workers to return (1-100)
    
    Returns: Most expensive workers with task statistics
    """
    query = """
    SELECT 
        w.worker_id,
        w.worker_name,
        w.current_area_id,
        a.name as area_name,
        w.cost_per_day,
        w.skill_level,
        COUNT(DISTINCT t.task_id) as total_tasks_assigned,
        COALESCE(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END), 0) as completed_tasks
    FROM Worker w
    LEFT JOIN Area a ON w.current_area_id = a.area_id
    LEFT JOIN Task t ON w.worker_id = t.assigned_worker_id
    GROUP BY w.worker_id, w.worker_name, w.current_area_id, a.name, w.cost_per_day, w.skill_level
    ORDER BY w.cost_per_day DESC
    LIMIT :limit
    """
    
    try:
        result = db.execute(text(query), {"limit": limit})
        rows = result.fetchall()
        
        response = []
        for row in rows:
            response.append(HighestCostWorkerResponse(
                worker_id=row.worker_id,
                worker_name=row.worker_name,
                current_area_id=row.current_area_id,
                area_name=row.area_name,
                cost_per_day=row.cost_per_day,
                skill_level=row.skill_level,
                total_tasks_assigned=row.total_tasks_assigned,
                completed_tasks=row.completed_tasks
            ))
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing highest cost workers query: {str(e)}"
        )


# ============================================================================
# QUERY 6: SAFETY INCIDENTS BY SEVERITY (GROUP BY CATEGORICAL)
# ============================================================================

@router.get("/safety-incidents-by-severity", response_model=list[SafetyIncidentBySeverityResponse])
def get_safety_incidents_by_severity(db: Session = Depends(get_db)):
    """
    GET /advanced-queries/safety-incidents-by-severity
    Aggregate safety incidents by severity level
    
    SQL CONCEPT - GROUP BY ON CATEGORICAL COLUMN:
    SELECT 
        si.severity,
        COUNT(*) as total_incidents,                      -- Simple COUNT
        COUNT(DISTINCT si.area_id) as area_count,        -- COUNT DISTINCT
        ROUND(AVG(... subquery ...), 2) as average_incidents_per_area
    FROM SafetyIncident si
    GROUP BY si.severity                                 -- Grouping by category
    ORDER BY FIELD(severity, 'high', 'medium', 'low')    -- Custom sort order
    
    DBMS PRINCIPLES:
    - GROUP BY on ENUM/categorical column for distribution analysis
    - COUNT(*) vs COUNT(DISTINCT column) for different metrics
    - GROUP BY without aggregate functions would error
    - Custom ordering for meaningful presentation
    
    Returns: Aggregated incident statistics by severity
    """
    query = """
    SELECT 
        si.severity,
        COUNT(*) as total_incidents,
        COUNT(DISTINCT si.area_id) as area_count,
        ROUND(COUNT(*) / COUNT(DISTINCT si.area_id), 2) as average_incidents_per_area
    FROM SafetyIncident si
    GROUP BY si.severity
    ORDER BY FIELD(si.severity, 'high', 'medium', 'low')
    """
    
    try:
        result = db.execute(text(query))
        rows = result.fetchall()
        
        response = []
        for row in rows:
            response.append(SafetyIncidentBySeverityResponse(
                severity=row.severity,
                total_incidents=row.total_incidents,
                area_count=row.area_count,
                average_incidents_per_area=row.average_incidents_per_area
            ))
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing safety incidents aggregation: {str(e)}"
        )


# ============================================================================
# BONUS: SAFETY INCIDENTS DETAIL (Detail-level with filtering)
# ============================================================================

@router.get("/safety-incidents-detail", response_model=list[SafetyIncidentDetailResponse])
def get_safety_incidents_detail(
    db: Session = Depends(get_db),
    severity: str = Query(None),
    area_id: int = Query(None),
    limit: int = 100
):
    """
    GET /advanced-queries/safety-incidents-detail
    Fetch detailed safety incident records with optional filtering
    
    SQL CONCEPT - WHERE CLAUSE WITH OPTIONAL CONDITIONS:
    SELECT ...
    FROM SafetyIncident si
    WHERE (severity = :severity OR :severity IS NULL)
      AND (area_id = :area_id OR :area_id IS NULL)
    
    DBMS PRINCIPLES:
    - Optional WHERE conditions using NULL checks
    - Dynamic query building for flexible filtering
    - JOIN for area context without N+1 queries
    
    Query Params:
    - severity: Optional filter (high, medium, low)
    - area_id: Optional filter by area
    - limit: Max results
    
    Returns: Detailed incident records with context
    """
    query = """
    SELECT 
        si.incident_id,
        si.area_id,
        a.name as area_name,
        si.incident_type,
        si.severity,
        si.incident_date,
        si.description,
        si.reported_by
    FROM SafetyIncident si
    JOIN Area a ON si.area_id = a.area_id
    WHERE 1=1
    """
    
    params = {}
    if severity:
        query += " AND si.severity = :severity"
        params["severity"] = severity
    
    if area_id:
        query += " AND si.area_id = :area_id"
        params["area_id"] = area_id
    
    query += """
    ORDER BY si.incident_date DESC
    LIMIT :limit
    """
    params["limit"] = limit
    
    try:
        result = db.execute(text(query), params)
        rows = result.fetchall()
        
        response = []
        for row in rows:
            response.append(SafetyIncidentDetailResponse(
                incident_id=row.incident_id,
                area_id=row.area_id,
                area_name=row.area_name,
                incident_type=row.incident_type,
                severity=row.severity,
                incident_date=row.incident_date,
                description=row.description,
                reported_by=row.reported_by
            ))
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing safety incidents detail query: {str(e)}"
        )


# ============================================================================
# BONUS QUERY: AREA COST SUMMARY WITH HAVING CLAUSE
# ============================================================================

@router.get("/area-cost-summary-with-threshold", response_model=list[AreaCostSummaryResponse])
def get_area_cost_summary_with_threshold(
    db: Session = Depends(get_db),
    cost_threshold: float = Query(5000, ge=0),
    limit: int = 100
):
    """
    GET /advanced-queries/area-cost-summary-with-threshold
    Analyze areas by total cost with HAVING clause for aggregate filtering
    
    SQL CONCEPT - HAVING CLAUSE (GROUP-LEVEL FILTERING):
    SELECT 
        a.area_id,
        a.area_name,
        SUM(c.amount) as total_cost,
        COUNT(c.cost_id) as cost_entries
    FROM Area a
    LEFT JOIN Cost c ON a.area_id = c.area_id
    GROUP BY a.area_id, a.area_name
    HAVING SUM(c.amount) > :threshold                   -- Filters aggregates (not WHERE!)
    
    CRITICAL DBMS PRINCIPLE:
    - WHERE filters INDIVIDUAL ROWS before grouping
    - HAVING filters GROUPS after aggregation
    - Cannot use aggregate functions in WHERE clause
    - HAVING enables: "Find areas where SUM of costs > X"
    
    Difference:
    WHERE: SUM(c.amount) > 5000    ❌ ERROR - can't use aggregates
    HAVING: SUM(c.amount) > 5000   ✓ CORRECT - filters groups
    
    Query Params:
    - cost_threshold: Only return areas with total cost exceeding this
    - limit: Max results
    
    Returns: Area costs filtered by aggregate HAVING clause
    """
    query = """
    SELECT 
        a.area_id,
        a.name as area_name,
        COALESCE(SUM(c.amount), 0) as total_cost,
        COUNT(DISTINCT c.cost_id) as cost_entries,
        ROUND(COALESCE(AVG(c.amount), 0), 2) as average_cost_per_entry,
        CASE 
            WHEN COALESCE(SUM(c.amount), 0) > :threshold THEN 'Over Threshold'
            WHEN COALESCE(SUM(c.amount), 0) = :threshold THEN 'At Threshold'
            ELSE 'Under Threshold'
        END as cost_status
    FROM Area a
    LEFT JOIN Cost c ON a.area_id = c.area_id
    GROUP BY a.area_id, a.name
    HAVING COALESCE(SUM(c.amount), 0) > :threshold
    ORDER BY total_cost DESC
    LIMIT :limit
    """
    
    try:
        result = db.execute(text(query), {"threshold": cost_threshold, "limit": limit})
        rows = result.fetchall()
        
        response = []
        for row in rows:
            response.append(AreaCostSummaryResponse(
                area_id=row.area_id,
                area_name=row.area_name,
                total_cost=row.total_cost,
                cost_entries=row.cost_entries,
                average_cost_per_entry=row.average_cost_per_entry,
                cost_status=row.cost_status
            ))
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing area cost summary query: {str(e)}"
        )
