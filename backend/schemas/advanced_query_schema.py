"""
Advanced Query Response Schemas
Schemas for complex SQL aggregation queries using GROUP BY, HAVING, JOINs
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TotalCostPerAreaResponse(BaseModel):
    """GROUP BY area_id aggregation"""
    area_id: int
    area_name: str
    total_cost: float
    cost_count: int
    average_cost: float
    max_cost: float
    min_cost: float

    class Config:
        from_attributes = True


class WorkerAllocationResponse(BaseModel):
    """GROUP BY area_id aggregation for workers"""
    area_id: int
    area_name: str
    total_workers: int
    total_daily_cost: float
    average_worker_cost: float
    highest_paid_worker: Optional[str]
    highest_paid_cost: Optional[float]

    class Config:
        from_attributes = True


class TaskDelayedResponse(BaseModel):
    """WHERE clause with DATEDIFF and date comparison"""
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
        from_attributes = True


class MaterialBelowThresholdResponse(BaseModel):
    """WHERE clause filtering inventory levels"""
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
        from_attributes = True


class HighestCostWorkerResponse(BaseModel):
    """ORDER BY aggregated column with LIMIT"""
    worker_id: int
    worker_name: str
    current_area_id: Optional[int]
    area_name: Optional[str]
    cost_per_day: float
    skill_level: Optional[str]
    total_tasks_assigned: int
    completed_tasks: int

    class Config:
        from_attributes = True


class SafetyIncidentBySeverityResponse(BaseModel):
    """GROUP BY severity with COUNT aggregation"""
    severity: str
    total_incidents: int
    area_count: int
    average_incidents_per_area: float

    class Config:
        from_attributes = True


class SafetyIncidentDetailResponse(BaseModel):
    """Detail-level breakdown of safety incidents"""
    incident_id: int
    area_id: int
    area_name: str
    incident_type: str
    severity: str
    incident_date: datetime
    description: Optional[str]
    reported_by: Optional[str]

    class Config:
        from_attributes = True


class AreaCostSummaryResponse(BaseModel):
    """GROUP BY with HAVING clause for advanced filtering"""
    area_id: int
    area_name: str
    total_cost: float
    cost_entries: int
    average_cost_per_entry: float
    cost_status: str

    class Config:
        from_attributes = True
