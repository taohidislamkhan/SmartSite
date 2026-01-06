"""
Budget Model
Represents budget allocation per area per fiscal year
DBMS Role: Entity with FK to Area; used for budget vs actual cost comparisons
"""

from sqlalchemy import Column, Integer, Numeric, String, DateTime, ForeignKey, func
from database import Base


class Budget(Base):
    """
    Budget Table
    Stores estimated budget per area per fiscal year
    PK: budget_id (AUTO_INCREMENT)
    FK: area_id -> Area(area_id) [CASCADE delete]
    
    DBMS Note: ON DELETE CASCADE - budget records deleted when area is deleted
    Used with Cost table to track budget vs actual spending
    """
    __tablename__ = 'Budget'

    # Primary Key
    budget_id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Foreign Key: Area this budget applies to
    area_id = Column(Integer, ForeignKey('Area.area_id', ondelete='CASCADE'), nullable=False)
    
    # Budget information
    estimated_budget = Column(Numeric(14, 2), nullable=False)
    fiscal_year = Column(String(4), nullable=True)  # YEAR type in MySQL - stored as string
    
    # Metadata
    created_at = Column(DateTime, server_default=func.now())

    def __repr__(self):
        return f"<Budget(budget_id={self.budget_id}, area_id={self.area_id}, budget={self.estimated_budget})>"
