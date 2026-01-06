"""
Analytics Schemas
Response models for database views (read-only)
These schemas represent query results from optimized database views
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date


# ============================================================================
# VIEW 1: DELAYED TASKS SCHEMA
# ============================================================================

class DelayedTaskResponse(BaseModel):
    """
    Schema for vw_delayed_tasks view
    Represents tasks that are past their planned end date
    DBMS Benefit: Database calculates DATEDIFF and severity, not Python
    """
    task_id: int
    area_id: int
    area_name: str
    task_name: str
    description: Optional[str]
    task_type: Optional[str]
    status: str
    planned_start_date: Optional[datetime]
    planned_end_date: Optional[datetime]
    actual_start_date: Optional[datetime]
    actual_end_date: Optional[datetime]
    progress_percent: int
    assigned_worker_id: Optional[int]
    assigned_worker: Optional[str]
    days_overdue: int
    severity: str  # Critical, High, Medium, Low

    class Config:
        orm_mode = True


# ============================================================================
# VIEW 2: LOW MATERIAL STOCK SCHEMA
# ============================================================================

class LowMaterialStockResponse(BaseModel):
    """
    Schema for vw_low_material_stock view
    Represents materials below reorder threshold per area
    DBMS Benefit: Database filters by threshold, calculates units_needed, reorder_cost
    Optimization: One query with all logic vs. Python loop through materials
    """
    material_id: int
    area_id: int
    area_name: str
    material_name: str
    material_type: Optional[str]
    quantity: float
    unit: str
    unit_cost: float
    reorder_threshold: float
    units_needed: float
    reorder_cost: float
    last_updated: Optional[datetime]
    stock_level: str  # Critical, High, Medium, OK

    class Config:
        orm_mode = True


# ============================================================================
# VIEW 3: COST OVER BUDGET SCHEMA
# ============================================================================

class CostOverBudgetResponse(BaseModel):
    """
    Schema for vw_cost_over_budget view
    Compares actual costs against budgeted amounts per area
    DBMS Benefit: Database aggregates costs with SUM and GROUP BY
    Avoids: N+1 query problem (one query instead of budget + costs for each area)
    """
    budget_id: int
    area_id: int
    area_name: str
    fiscal_year: Optional[str]
    estimated_budget: float
    actual_cost: float
    remaining_budget: float
    utilization_percent: float  # Percentage of budget used
    budget_status: str  # Over Budget, Caution, On Track, Under Budget
    cost_entries: int  # Count of cost records
    created_at: Optional[datetime]

    class Config:
        orm_mode = True


# ============================================================================
# VIEW 4: AREA PROGRESS SUMMARY SCHEMA
# ============================================================================

class AreaProgressSummaryResponse(BaseModel):
    """
    Schema for vw_area_progress_summary view
    Comprehensive area progress metrics (tasks, workers, equipment, costs, safety)
    DBMS Benefit: Replaces 7+ separate API calls with ONE database view
    Optimization: Pre-calculated aggregations (COUNT, SUM, AVG) at database layer
    Business Logic: Progress percentage = completed_tasks / total_tasks * 100 (DB calculates)
    """
    # Area identification
    area_id: int
    area_name: str
    area_type: Optional[str]
    status: str
    boundary_size: Optional[float]

    # Task metrics
    total_tasks: int
    completed_tasks: int
    in_progress_tasks: int
    pending_tasks: int
    blocked_tasks: int
    overall_progress_percent: float  # 0-100
    avg_task_progress: float  # Average of all task progress_percent values

    # Worker metrics
    assigned_workers: int
    total_worker_cost_per_day: float

    # Equipment metrics
    total_equipment: int
    equipment_in_use: int
    equipment_maintenance: int

    # Cost metrics
    total_actual_cost: float
    total_budgeted: float

    # Safety metrics
    safety_incidents: int
    high_severity_incidents: int

    # Material metrics
    total_materials: int
    low_stock_materials: int

    # Last activity timestamp
    last_activity: Optional[datetime]

    class Config:
        orm_mode = True
