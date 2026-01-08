"""
SafetyIncident Model
Represents safety incidents and inspections per area
"""

from sqlalchemy import Column, Integer, String, Date, Enum, Text, DateTime, ForeignKey, func
from database import Base


class SafetyIncident(Base):
    """
    SafetyIncident Table
    Stores incident reports: date, type, severity, description, reporter
    """
    __tablename__ = 'SafetyIncident'

    incident_id = Column(Integer, primary_key=True, autoincrement=True)
    
    area_id = Column(Integer, ForeignKey('Area.area_id', ondelete='CASCADE'), nullable=False)
    
    incident_date = Column(Date, nullable=False)
    incident_type = Column(String(150), nullable=True)
    
    severity = Column(
        Enum('low', 'medium', 'high'),
        default='low',
        nullable=False
    )
    
    description = Column(Text, nullable=True)
    reported_by = Column(String(150), nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())

    def __repr__(self):
        return f"<SafetyIncident(incident_id={self.incident_id}, severity='{self.severity}', area_id={self.area_id})>"
