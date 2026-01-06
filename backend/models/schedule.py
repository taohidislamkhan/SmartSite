"""
Schedule Model
Represents detailed schedule information for tasks
DBMS Role: Extension of Task entity; one-to-one relationship with Task (UNIQUE FK)
"""

from sqlalchemy import Column, Integer, Text, Date, ForeignKey
from database import Base


class Schedule(Base):
    """
    Schedule Table
    Stores detailed schedule for tasks: planned/actual dates, notes
    PK: schedule_id (AUTO_INCREMENT)
    FK: task_id -> Task(task_id) [UNIQUE - one-to-one relationship, CASCADE delete]
    
    DBMS Note: This is a separate table for NORMALIZATION - avoids NULL columns in Task
    """
    __tablename__ = 'Schedule'

    # Primary Key
    schedule_id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Foreign Key: One-to-one relationship with Task (UNIQUE)
    task_id = Column(Integer, ForeignKey('Task.task_id', ondelete='CASCADE'), nullable=False, unique=True)
    
    # Schedule information
    planned_start = Column(Date, nullable=True)
    planned_end = Column(Date, nullable=True)
    actual_start = Column(Date, nullable=True)
    actual_end = Column(Date, nullable=True)
    
    # Notes
    notes = Column(Text, nullable=True)

    def __repr__(self):
        return f"<Schedule(schedule_id={self.schedule_id}, task_id={self.task_id})>"
