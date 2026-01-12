"""
Worker Model
Represents construction workers assigned to areas
"""

from sqlalchemy import Column, Integer, String, Numeric, ForeignKey
from database import Base


class Worker(Base):
    """
    Worker Table
    Stores worker information: name, skill, cost per day, contact, current area assignment, current task assignment
    """
    __tablename__ = 'Worker'

    worker_id = Column(Integer, primary_key=True, autoincrement=True)
    
    name = Column(String(150), nullable=False)
    skill = Column(String(100), nullable=True)
    cost_per_day = Column(Numeric(10, 2), default=0.00)
    contact = Column(String(80), nullable=True)
    
    current_area_id = Column(Integer, ForeignKey('Area.area_id', ondelete='SET NULL'), nullable=True)
    current_task_id = Column(Integer, ForeignKey('Task.task_id', ondelete='SET NULL'), nullable=True)

    def __repr__(self):
        return f"<Worker(worker_id={self.worker_id}, name='{self.name}', skill='{self.skill}')>"
