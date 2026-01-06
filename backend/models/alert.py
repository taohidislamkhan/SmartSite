"""
Alert Model
Represents system-generated alerts (from triggers and business logic)
DBMS Role: Log table for alerts; referenced by area but can have NULL area for global alerts
"""

from sqlalchemy import Column, Integer, String, Enum, Boolean, DateTime, ForeignKey, func
from database import Base


class Alert(Base):
    """
    Alert Table
    Stores generated alerts: type, reference to entity, message, severity, resolution status
    PK: alert_id (AUTO_INCREMENT)
    FK: area_id -> Area(area_id) [SET NULL - optional, can be global alerts]
    
    DBMS Note: This table is populated by TRIGGERS in MySQL for automatic alerts
    Alert types: material_low, cost_overrun, task_delay, safety_incident, etc.
    Severity: info, warning, critical
    
    Example trigger usage: When material.quantity < reorder_threshold -> insert Alert
    """
    __tablename__ = 'Alert'

    # Primary Key
    alert_id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Foreign Key: Area (optional - can be null for global alerts)
    area_id = Column(Integer, ForeignKey('Area.area_id', ondelete='SET NULL'), nullable=True)
    
    # Alert content
    alert_type = Column(String(100), nullable=False)  # e.g., 'material_low', 'cost_overrun', 'task_delay'
    ref_table = Column(String(64), nullable=True)  # Reference table: 'Material', 'Cost', 'Task', etc.
    ref_id = Column(Integer, nullable=True)  # Reference record ID
    message = Column(String(400), nullable=True)
    
    # Severity enum
    severity = Column(
        Enum('info', 'warning', 'critical'),
        default='warning',
        nullable=False
    )
    
    # Resolution tracking
    is_resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, server_default=func.now())

    def __repr__(self):
        return f"<Alert(alert_id={self.alert_id}, type='{self.alert_type}', severity='{self.severity}')>"
