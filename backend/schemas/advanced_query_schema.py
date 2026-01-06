"""
Advanced Query Response Schemas
Schemas for complex SQL aggregation queries using GROUP BY, HAVING, JOINs
Purpose: Demonstrate SQL-level business logic for DBMS exam
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ============================================================================
# QUERY 1: TOTAL COST PER AREA
# ============================================================================

class TotalCostPerAreaResponse(BaseModel):
    """
    GROUP BY area_id aggregation
    SQL Logic: SUM(cost.amount) GROUP BY area_id
    Demonstrates: Basic aggregation with proper naming
    """
    area_id: int
    area_name: str
    total_cost: float
    cost_count: int  # Number of cost entries
    average_cost: float  # Average cost per entry
    max_cost: float  # Single highest cost entry
    min_cost: float  # Single lowest cost entry

    class Config:
        orm_mode = True


# ============================================================================
# QUERY 2: WORKER ALLOCATION PER AREA
# ============================================================================

class WorkerAllocationResponse(BaseModel):
    """
    GROUP BY area_id aggregation for workers
    SQL Logic: COUNT(worker_id) GROUP BY area_id
    Demonstrates: Counting resources per location with cost analysis
    """
    area_id: int
    area_name: str
    total_workers: int
    total_daily_cost: float  # SUM(cost_per_day) for all workers in area
    average_worker_cost: float  # AVG(cost_per_day)
    highest_paid_worker: Optional[str]  # Worker name
    highest_paid_cost: Optional[float]  # Their cost_per_day

    class Config:
        orm_mode = True


# ============================================================================
# QUERY 3: TASKS DELAYED BY MORE THAN X DAYS
# ============================================================================

class TaskDelayedResponse(BaseModel):
    """
    WHERE clause with DATEDIFF and date comparison
    SQL Logic: WHERE planned_end_date < NOW() AND status != 'completed'
    Demonstrates: Date arithmetic, filtering by calculated fields
    """
    task_id: int
    task_name: str
    area_id: int
    area_name: str
    assigned_worker_id: Optional[int]
    assigned_worker: Optional[str]
    planned_end_date: Optional[datetime]
    days_overdue: int
    progress_percent: int
    status: str

    class Config:
        orm_mode = True


# ============================================================================
# QUERY 4: MATERIALS BELOW REORDER THRESHOLD
# ============================================================================

class MaterialBelowThresholdResponse(BaseModel):
    """
    WHERE clause filtering inventory levels
    SQL Logic: WHERE quantity <= reorder_threshold
    Demonstrates: Comparing columns, business rule enforcement at DB layer
    """
    material_id: int
    material_name: str
    area_id: int
    area_name: str
    quantity: float
    unit: str
    reorder_threshold: float
    units_needed: float
    unit_cost: float
    reorder_cost: float
    last_updated: Optional[datetime]

    class Config:
        orm_mode = True


# ============================================================================
# QUERY 5: HIGHEST COST WORKERS
# ============================================================================

class HighestCostWorkerResponse(BaseModel):
    """
    ORDER BY aggregated column with LIMIT
    SQL Logic: ORDER BY cost_per_day DESC LIMIT N
    Demonstrates: Sorting by monetary value, top-N queries
    """
    worker_id: int
    worker_name: str
    current_area_id: Optional[int]
    area_name: Optional[str]
    cost_per_day: float
    skill_level: Optional[str]
    total_tasks_assigned: int  # COUNT of tasks where assigned_worker_id
    completed_tasks: int  # COUNT of completed tasks

    class Config:
        orm_mode = True


# ============================================================================
# QUERY 6: SAFETY INCIDENTS BY SEVERITY
# ============================================================================

class SafetyIncidentBySeverityResponse(BaseModel):
    """
    GROUP BY severity with COUNT aggregation
    SQL Logic: COUNT(*) GROUP BY severity
    Demonstrates: Categorical grouping, status distribution analysis
    """
    severity: str  # low, medium, high
    total_incidents: int
    area_count: int  # Number of different areas with this severity
    average_incidents_per_area: float

    class Config:
        orm_mode = True


# ============================================================================
# QUERY 7: SAFETY INCIDENTS DETAIL BY SEVERITY
# ============================================================================

class SafetyIncidentDetailResponse(BaseModel):
    """
    Detail-level breakdown of safety incidents
    Supports filtering by severity for analysis
    """
    incident_id: int
    area_id: int
    area_name: str
    incident_type: str
    severity: str
    incident_date: datetime
    description: Optional[str]
    reported_by: Optional[str]

    class Config:
        orm_mode = True


# ============================================================================
# BONUS: AREA COST SUMMARY WITH HAVING CLAUSE
# ============================================================================

class AreaCostSummaryResponse(BaseModel):
    """
    GROUP BY with HAVING clause for advanced filtering
    SQL Logic: SUM(cost) GROUP BY area_id HAVING SUM(cost) > threshold
    Demonstrates: Filtering aggregated results (not individual rows)
    Business Use: Find areas exceeding cost threshold
    """
    area_id: int
    area_name: str
    total_cost: float
    cost_entries: int
    average_cost_per_entry: float
    cost_status: str  # Over Threshold, At Threshold, Under Threshold

    class Config:
        orm_mode = True
