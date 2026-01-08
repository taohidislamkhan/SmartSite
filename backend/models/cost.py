"""
Cost Model
Represents cost entries tracked per area
"""

from sqlalchemy import Column, Integer, Numeric, Date, String, Enum, DateTime, ForeignKey, func
from database import Base


class Cost(Base):
    """
    Cost Table
    Stores cost records: type, amount, date, description
    """
    __tablename__ = 'Cost'

    cost_id = Column(Integer, primary_key=True, autoincrement=True)
    
    area_id = Column(Integer, ForeignKey('Area.area_id', ondelete='CASCADE'), nullable=False)
    
    type = Column(
        Enum('material', 'labor', 'equipment', 'other'),
        nullable=False
    )
    
    amount = Column(Numeric(14, 2), nullable=False)
    incurred_date = Column(Date, nullable=True)
    description = Column(String(255), nullable=True)
    
    recorded_at = Column(DateTime, server_default=func.now())

    def __repr__(self):
        return f"<Cost(cost_id={self.cost_id}, type='{self.type}', amount={self.amount})>"
