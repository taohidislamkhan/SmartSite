"""
Analytics Schemas
Response models for database views (read-only)
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date


class DelayedTaskResponse(BaseModel):
    """Schema for vw_delayed_tasks view"""
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
    severity: str

    class Config:
        from_attributes = True


class LowMaterialStockResponse(BaseModel):
    """Schema for vw_low_material_stock view"""
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
    stock_level: str

    class Config:
        from_attributes = True


class CostOverBudgetResponse(BaseModel):
    """Schema for vw_cost_over_budget view"""
    budget_id: int
    area_id: int
    area_name: str
    fiscal_year: Optional[str]
    estimated_budget: float
    actual_cost: float
    remaining_budget: float
    utilization_percent: float
    budget_status: str
    cost_entries: int
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


class AreaProgressSummaryResponse(BaseModel):
    """Schema for vw_area_progress_summary view"""
    area_id: int
    area_name: str
    area_type: Optional[str]
    status: str
    boundary_size: Optional[float]

    total_tasks: int
    completed_tasks: int
    in_progress_tasks: int
    pending_tasks: int
    blocked_tasks: int
    overall_progress_percent: float
    avg_task_progress: float

    assigned_workers: int
    total_worker_cost_per_day: float

    total_equipment: int
    equipment_in_use: int
    equipment_maintenance: int

    total_actual_cost: float
    total_budgeted: float

    safety_incidents: int
    high_severity_incidents: int

    total_materials: int
    low_stock_materials: int

    last_activity: Optional[datetime]

    class Config:
        from_attributes = True
