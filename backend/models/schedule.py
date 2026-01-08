"""
Schedule Model
Represents detailed schedule information for tasks
"""

from sqlalchemy import Column, Integer, Text, Date, ForeignKey
from database import Base


class Schedule(Base):
    """
    Schedule Table
    Stores detailed schedule for tasks: planned/actual dates, notes
    """
    __tablename__ = 'Schedule'

    schedule_id = Column(Integer, primary_key=True, autoincrement=True)
    
    task_id = Column(Integer, ForeignKey('Task.task_id', ondelete='CASCADE'), nullable=False, unique=True)
    
    planned_start = Column(Date, nullable=True)
    planned_end = Column(Date, nullable=True)
    actual_start = Column(Date, nullable=True)
    actual_end = Column(Date, nullable=True)
    
    notes = Column(Text, nullable=True)

    def __repr__(self):
        return f"<Schedule(schedule_id={self.schedule_id}, task_id={self.task_id})>"
