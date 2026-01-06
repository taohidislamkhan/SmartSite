"""
User Model
Represents users in the system with role-based access (Engineer vs Worker)

DBMS DESIGN:
- Normalized approach: Separate User table for authentication
- Role-based separation: 'role' ENUM field distinguishes Engineer/Worker
- Engineer: Can manage multiple areas (via Area.assigned_engineer_id)
- Worker: Assigned to ONE current area, gets tasks via Task.assigned_worker_id
- Password security: Hashed using bcrypt (never store plain text)

Why this design:
1. Separation of concerns - Auth separate from domain entities
2. Role-based access control - Middleware checks this field
3. Scalable - Can add more roles (Admin, Manager) without schema changes
4. Audit-friendly - Tracks user creation time
"""

from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey, func
from database import Base


class User(Base):
    """
    User Table (Authentication & Authorization)
    Stores login credentials and role information
    PK: user_id (AUTO_INCREMENT)
    FK: area_id -> Area(area_id) [Only for Workers; NULL for Engineers]
    """
    __tablename__ = 'User'

    # Primary Key
    user_id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Authentication
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)  # bcrypt hash, ~60 chars
    
    # Authorization
    role = Column(
        Enum('engineer', 'worker'),
        default='worker',
        nullable=False,
        index=True
    )
    
    # For Workers: Current assigned area (FK to Area.area_id)
    # For Engineers: NULL (they are assigned to areas via Area.assigned_engineer_id)
    area_id = Column(
        Integer,
        ForeignKey('Area.area_id', ondelete='SET NULL'),
        nullable=True
    )
    
    # Metadata
    created_at = Column(DateTime, server_default=func.now())
    
    def __repr__(self):
        return f"<User(user_id={self.user_id}, email='{self.email}', role='{self.role}')>"
    
    def is_engineer(self) -> bool:
        """Check if user has engineer role"""
        return self.role == 'engineer'
    
    def is_worker(self) -> bool:
        """Check if user has worker role"""
        return self.role == 'worker'
