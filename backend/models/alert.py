"""
Alert Model
Represents system-generated alerts (from triggers and business logic)
"""

from sqlalchemy import Column, Integer, String, Enum, Boolean, DateTime, ForeignKey, func
from database import Base


class Alert(Base):
    """
    Alert Table
    Stores generated alerts: type, reference to entity, message, severity, resolution status
    """
    __tablename__ = 'Alert'

    alert_id = Column(Integer, primary_key=True, autoincrement=True)
    
    area_id = Column(Integer, ForeignKey('Area.area_id', ondelete='SET NULL'), nullable=True)
    
    alert_type = Column(String(100), nullable=False)
    ref_table = Column(String(64), nullable=True)
    ref_id = Column(Integer, nullable=True)
    message = Column(String(400), nullable=True)
    
    severity = Column(
        Enum('info', 'warning', 'critical'),
        default='warning',
        nullable=False
    )
    
    is_resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())

    def __repr__(self):
        return f"<Alert(alert_id={self.alert_id}, type='{self.alert_type}', severity='{self.severity}')>"
