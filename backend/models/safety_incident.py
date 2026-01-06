"""
SafetyIncident Model
Represents safety incidents and inspections per area
DBMS Role: Entity with FK to Area; tracks incidents by date, type, and severity
"""

from sqlalchemy import Column, Integer, String, Date, Enum, Text, DateTime, ForeignKey, func
from database import Base


class SafetyIncident(Base):
    """
    SafetyIncident Table
    Stores incident reports: date, type, severity, description, reporter
    PK: incident_id (AUTO_INCREMENT)
    FK: area_id -> Area(area_id) [CASCADE delete]
    
    DBMS Note: ON DELETE CASCADE - incident records deleted when area is deleted
    Severity levels: low, medium, high
    """
    __tablename__ = 'SafetyIncident'

    # Primary Key
    incident_id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Foreign Key: Area where incident occurred
    area_id = Column(Integer, ForeignKey('Area.area_id', ondelete='CASCADE'), nullable=False)
    
    # Incident information
    incident_date = Column(Date, nullable=False)
    incident_type = Column(String(150), nullable=True)  # e.g., "fall", "exposure", "equipment"
    
    # Severity enum
    severity = Column(
        Enum('low', 'medium', 'high'),
        default='low',
        nullable=False
    )
    
    # Details
    description = Column(Text, nullable=True)
    reported_by = Column(String(150), nullable=True)
    
    # Metadata
    created_at = Column(DateTime, server_default=func.now())

    def __repr__(self):
        return f"<SafetyIncident(incident_id={self.incident_id}, severity='{self.severity}', area_id={self.area_id})>"
