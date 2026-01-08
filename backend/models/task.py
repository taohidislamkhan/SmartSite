"""
Task Model
Represents construction tasks/activities assigned to areas and workers
"""

from sqlalchemy import Column, Integer, String, Text, Date, Enum, ForeignKey, DateTime, func
from database import Base


class Task(Base):
    """
    Task Table
    Stores task information: title, description, dates, progress, assignment, status
    """
    __tablename__ = 'Task'

    task_id = Column(Integer, primary_key=True, autoincrement=True)
    
    area_id = Column(Integer, ForeignKey('Area.area_id', ondelete='CASCADE'), nullable=False)
    assigned_worker_id = Column(Integer, ForeignKey('Worker.worker_id', ondelete='SET NULL'), nullable=True)
    
    title = Column(String(250), nullable=False)
    description = Column(Text, nullable=True)
    
    planned_start = Column(Date, nullable=True)
    planned_end = Column(Date, nullable=True)
    actual_start = Column(Date, nullable=True)
    actual_end = Column(Date, nullable=True)
    
    progress_percent = Column(Integer, default=0)
    
    status = Column(
        Enum('pending', 'in-progress', 'completed', 'blocked'),
        default='pending',
        nullable=False
    )
    
    created_at = Column(DateTime, server_default=func.now())

    def __repr__(self):
        return f"<Task(task_id={self.task_id}, title='{self.title}', status='{self.status}')>"
