"""
Engineer Model
Represents project engineers responsible for supervising construction areas
"""

from sqlalchemy import Column, Integer, String, DateTime, func
from database import Base


class Engineer(Base):
    """
    Engineer Table
    Stores engineer information: ID, name, contact, expertise level
    """
    __tablename__ = 'Engineer'

    engineer_id = Column(Integer, primary_key=True, autoincrement=True)
    
    name = Column(String(150), nullable=False)
    email = Column(String(150), nullable=True)
    phone = Column(String(30), nullable=True)
    expertise = Column(String(100), nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())

    def __repr__(self):
        return f"<Engineer(engineer_id={self.engineer_id}, name='{self.name}')>"
