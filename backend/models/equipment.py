"""
Equipment Model
Represents construction equipment used in areas
DBMS Role: Entity with FK to Area for tracking equipment location
"""

from sqlalchemy import Column, Integer, String, Enum, ForeignKey
from database import Base


class Equipment(Base):
    """
    Equipment Table
    Stores equipment information: name, serial number, status, current area location
    PK: equipment_id (AUTO_INCREMENT)
    FK: current_area_id -> Area(area_id)
    """
    __tablename__ = 'Equipment'

    # Primary Key
    equipment_id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Core attributes
    name = Column(String(150), nullable=True)
    serial_no = Column(String(100), nullable=True)
    
    # Status tracking (available, in-use, maintenance, retired)
    status = Column(
        Enum('available', 'in-use', 'maintenance', 'retired'),
        default='available',
        nullable=False
    )
    
    # Foreign Key: Current area location
    current_area_id = Column(Integer, ForeignKey('Area.area_id', ondelete='SET NULL'), nullable=True)

    def __repr__(self):
        return f"<Equipment(equipment_id={self.equipment_id}, name='{self.name}', status='{self.status}')>"
