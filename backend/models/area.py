"""
Area Model
Represents construction areas/sites in the project
DBMS Role: Central entity; has foreign key to Engineer, one-to-many with Workers, Tasks, Materials, Costs, Budget, SafetyIncidents
"""

from sqlalchemy import Column, Integer, String, Numeric, DateTime, Enum, ForeignKey, func
from database import Base


class Area(Base):
    """
    Area Table (Construction Sites)
    Stores area/site information with location, size, type, assigned engineer, and status
    PK: area_id (AUTO_INCREMENT)
    FK: assigned_engineer_id -> Engineer(engineer_id)
    """
    __tablename__ = 'Area'

    # Primary Key
    area_id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Core attributes
    name = Column(String(200), nullable=False)
    location = Column(String(255), nullable=True)
    boundary_size = Column(Numeric(12, 2), nullable=True)  # Square meters
    area_type = Column(String(50), nullable=True)  # e.g., "construction", "electrical"
    
    # Foreign Key: Assigned Engineer
    assigned_engineer_id = Column(Integer, ForeignKey('Engineer.engineer_id', ondelete='SET NULL'), nullable=True)
    
    # Status tracking
    status = Column(
        Enum('planned', 'active', 'completed', 'on-hold'),
        default='planned',
        nullable=False
    )
    
    # Metadata
    created_at = Column(DateTime, server_default=func.now())

    def __repr__(self):
        return f"<Area(area_id={self.area_id}, name='{self.name}', status='{self.status}')>"
