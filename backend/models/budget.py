"""
Budget Model
Represents budget allocation per area per fiscal year
"""

from sqlalchemy import Column, Integer, Numeric, String, DateTime, ForeignKey, func
from database import Base


class Budget(Base):
    """
    Budget Table
    Stores estimated budget per area per fiscal year
    """
    __tablename__ = 'Budget'

    budget_id = Column(Integer, primary_key=True, autoincrement=True)
    
    area_id = Column(Integer, ForeignKey('Area.area_id', ondelete='CASCADE'), nullable=False)
    
    estimated_budget = Column(Numeric(14, 2), nullable=False)
    fiscal_year = Column(String(4), nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())

    def __repr__(self):
        return f"<Budget(budget_id={self.budget_id}, area_id={self.area_id}, budget={self.estimated_budget})>"
