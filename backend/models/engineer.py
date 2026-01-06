"""
Engineer Model
Represents project engineers responsible for supervising construction areas
DBMS Role: Core entity; has one-to-many relationship with Area
"""

from sqlalchemy import Column, Integer, String, DateTime, func
from database import Base


class Engineer(Base):
    """
    Engineer Table
    Stores engineer information: ID, name, contact, expertise level
    PK: engineer_id (AUTO_INCREMENT)
    """
    __tablename__ = 'Engineer'

    # Primary Key
    engineer_id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Core attributes
    name = Column(String(150), nullable=False)
    email = Column(String(150), nullable=True)
    phone = Column(String(30), nullable=True)
    expertise = Column(String(100), nullable=True)
    
    # Metadata
    created_at = Column(DateTime, server_default=func.now())

    def __repr__(self):
        return f"<Engineer(engineer_id={self.engineer_id}, name='{self.name}')>"
