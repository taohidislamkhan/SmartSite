"""
Area Model
Represents construction areas/sites in the project
"""

from sqlalchemy import Column, Integer, String, Numeric, DateTime, Enum, ForeignKey, func
from database import Base


class Area(Base):
    """
    Area Table (Construction Sites)
    Stores area/site information with location, size, type, assigned engineer, and status
    """
    __tablename__ = 'Area'

    area_id = Column(Integer, primary_key=True, autoincrement=True)
    
    name = Column(String(200), nullable=False)
    location = Column(String(255), nullable=True)
    boundary_size = Column(Numeric(12, 2), nullable=True)
    area_type = Column(String(50), nullable=True)
    
    assigned_engineer_id = Column(Integer, ForeignKey('Engineer.engineer_id', ondelete='SET NULL'), nullable=True)
    
    status = Column(
        Enum('planned', 'active', 'completed', 'on-hold'),
        default='planned',
        nullable=False
    )
    
    created_at = Column(DateTime, server_default=func.now())

    def __repr__(self):
        return f"<Area(area_id={self.area_id}, name='{self.name}', status='{self.status}')>"
