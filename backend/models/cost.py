"""
Cost Model
Represents cost entries tracked per area
DBMS Role: Entity with FK to Area; tracks different cost types (material, labor, equipment, other)
"""

from sqlalchemy import Column, Integer, Numeric, Date, String, Enum, DateTime, ForeignKey, func
from database import Base


class Cost(Base):
    """
    Cost Table
    Stores cost records: type, amount, date, description
    PK: cost_id (AUTO_INCREMENT)
    FK: area_id -> Area(area_id) [CASCADE delete]
    
    DBMS Note: ON DELETE CASCADE - cost records deleted when area is deleted
    Cost types: material, labor, equipment, other
    """
    __tablename__ = 'Cost'

    # Primary Key
    cost_id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Foreign Key: Area this cost belongs to
    area_id = Column(Integer, ForeignKey('Area.area_id', ondelete='CASCADE'), nullable=False)
    
    # Cost type enum
    type = Column(
        Enum('material', 'labor', 'equipment', 'other'),
        nullable=False
    )
    
    # Cost information
    amount = Column(Numeric(14, 2), nullable=False)
    incurred_date = Column(Date, nullable=True)
    description = Column(String(255), nullable=True)
    
    # Metadata
    recorded_at = Column(DateTime, server_default=func.now())

    def __repr__(self):
        return f"<Cost(cost_id={self.cost_id}, type='{self.type}', amount={self.amount})>"
