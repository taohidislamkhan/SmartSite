"""
User Model
Represents users in the system with role-based access (Engineer vs Worker)
"""

from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey, func
from database import Base


class User(Base):
    """
    User Table (Authentication & Authorization)
    Stores login credentials and role information
    """
    __tablename__ = 'User'

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(
        Enum('engineer', 'worker'),
        default='worker',
        nullable=False,
        index=True
    )
    
    area_id = Column(
        Integer,
        ForeignKey('Area.area_id', ondelete='SET NULL'),
        nullable=True
    )
    
    created_at = Column(DateTime, server_default=func.now())
    
    def __repr__(self):
        return f"<User(user_id={self.user_id}, email='{self.email}', role='{self.role}')>"
    
    def is_engineer(self) -> bool:
        """Check if user has engineer role"""
        return self.role == 'engineer'
    
    def is_worker(self) -> bool:
        """Check if user has worker role"""
        return self.role == 'worker'
