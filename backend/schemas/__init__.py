"""
Pydantic Schemas
Data validation and serialization models for API requests/responses
Each entity has: Base, Create, and Response schemas
"""

# Engineer schemas
from .engineer_schema import EngineerBase, EngineerCreate, EngineerResponse

# Area schemas
from .area_schema import AreaBase, AreaCreate, AreaResponse

# Worker schemas
from .worker_schema import WorkerBase, WorkerCreate, WorkerResponse

# Equipment schemas
from .equipment_schema import EquipmentBase, EquipmentCreate, EquipmentResponse

# Material schemas
from .material_schema import MaterialBase, MaterialCreate, MaterialResponse

# Task schemas
from .task_schema import TaskBase, TaskCreate, TaskResponse

# Schedule schemas
from .schedule_schema import ScheduleBase, ScheduleCreate, ScheduleResponse

# Cost schemas
from .cost_schema import CostBase, CostCreate, CostResponse

# Budget schemas
from .budget_schema import BudgetBase, BudgetCreate, BudgetResponse

# SafetyIncident schemas
from .safety_incident_schema import SafetyIncidentBase, SafetyIncidentCreate, SafetyIncidentResponse

# Alert schemas
from .alert_schema import AlertBase, AlertCreate, AlertResponse

__all__ = [
    # Engineer
    "EngineerBase", "EngineerCreate", "EngineerResponse",
    # Area
    "AreaBase", "AreaCreate", "AreaResponse",
    # Worker
    "WorkerBase", "WorkerCreate", "WorkerResponse",
    # Equipment
    "EquipmentBase", "EquipmentCreate", "EquipmentResponse",
    # Material
    "MaterialBase", "MaterialCreate", "MaterialResponse",
    # Task
    "TaskBase", "TaskCreate", "TaskResponse",
    # Schedule
    "ScheduleBase", "ScheduleCreate", "ScheduleResponse",
    # Cost
    "CostBase", "CostCreate", "CostResponse",
    # Budget
    "BudgetBase", "BudgetCreate", "BudgetResponse",
    # SafetyIncident
    "SafetyIncidentBase", "SafetyIncidentCreate", "SafetyIncidentResponse",
    # Alert
    "AlertBase", "AlertCreate", "AlertResponse",
]
