"""
Worker Model
Represents construction workers assigned to areas
DBMS Role: Entity with FK to Area; referenced by Task
"""

from sqlalchemy import Column, Integer, String, Numeric, ForeignKey
from database import Base


class Worker(Base):
    """
    Worker Table
    Stores worker information: name, skill, cost per day, contact, current area assignment
    PK: worker_id (AUTO_INCREMENT)
    FK: current_area_id -> Area(area_id)
    """
    __tablename__ = 'Worker'

    # Primary Key
    worker_id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Core attributes
    name = Column(String(150), nullable=False)
    skill = Column(String(100), nullable=True)
    cost_per_day = Column(Numeric(10, 2), default=0.00)
    contact = Column(String(80), nullable=True)
    
    # Foreign Key: Current area assignment
    current_area_id = Column(Integer, ForeignKey('Area.area_id', ondelete='SET NULL'), nullable=True)

    def __repr__(self):
        return f"<Worker(worker_id={self.worker_id}, name='{self.name}', skill='{self.skill}')>"
