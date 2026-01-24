"""
Worker Model
Represents construction workers assigned to areas
"""

from sqlalchemy import Column, Integer, String, Numeric, ForeignKey
from database import Base


class Worker(Base):
    """
    Worker Table
    Stores worker information: name, skill, cost per day, contact, address, current area assignment, current task assignment
    """
    __tablename__ = 'Worker'

    worker_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('User.user_id', ondelete='CASCADE'), nullable=True)  # Link to User account
    
    # Personal Information
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    name = Column(String(150), nullable=False)  # Full name (first_name + last_name)
    
    # Contact Information
    contact = Column(String(80), nullable=True)  # Phone number
    address = Column(String(255), nullable=True)  # Residential address
    
    # Work Information
    skill = Column(String(100), nullable=True)
    cost_per_day = Column(Numeric(10, 2), default=0.00)
    
    # Assignment Information
    current_area_id = Column(Integer, ForeignKey('Area.area_id', ondelete='SET NULL'), nullable=True)
    current_task_id = Column(Integer, ForeignKey('Task.task_id', ondelete='SET NULL'), nullable=True)

    def __repr__(self):
        return f"<Worker(worker_id={self.worker_id}, name='{self.name}', skill='{self.skill}')>"
