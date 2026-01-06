"""
Task Model
Represents construction tasks/activities assigned to areas and workers
DBMS Role: Central entity; has FK to Area and Worker; referenced by Schedule
"""

from sqlalchemy import Column, Integer, String, Text, Date, Enum, ForeignKey, DateTime, func
from database import Base


class Task(Base):
    """
    Task Table
    Stores task information: title, description, dates, progress, assignment, status
    PK: task_id (AUTO_INCREMENT)
    FK: area_id -> Area(area_id) [CASCADE delete]
    FK: assigned_worker_id -> Worker(worker_id) [SET NULL on delete]
    
    DBMS Note: ON DELETE CASCADE - tasks deleted when area is deleted
    """
    __tablename__ = 'Task'

    # Primary Key
    task_id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Foreign Keys
    area_id = Column(Integer, ForeignKey('Area.area_id', ondelete='CASCADE'), nullable=False)
    assigned_worker_id = Column(Integer, ForeignKey('Worker.worker_id', ondelete='SET NULL'), nullable=True)
    
    # Core attributes
    title = Column(String(250), nullable=False)
    description = Column(Text, nullable=True)
    
    # Schedule dates
    planned_start = Column(Date, nullable=True)
    planned_end = Column(Date, nullable=True)
    actual_start = Column(Date, nullable=True)
    actual_end = Column(Date, nullable=True)
    
    # Progress tracking (0-100%)
    progress_percent = Column(Integer, default=0)  # TINYINT UNSIGNED in MySQL
    
    # Status enum
    status = Column(
        Enum('pending', 'in-progress', 'completed', 'blocked'),
        default='pending',
        nullable=False
    )
    
    # Metadata
    created_at = Column(DateTime, server_default=func.now())

    def __repr__(self):
        return f"<Task(task_id={self.task_id}, title='{self.title}', status='{self.status}')>"
