"""
Equipment Model
Represents construction equipment used in areas
"""

from sqlalchemy import Column, Integer, String, Enum, ForeignKey
from database import Base


class Equipment(Base):
    """
    Equipment Table
    Stores equipment information: name, serial number, status, current area location
    """
    __tablename__ = 'Equipment'

    equipment_id = Column(Integer, primary_key=True, autoincrement=True)
    
    name = Column(String(150), nullable=True)
    serial_no = Column(String(100), nullable=True)
    
    status = Column(
        Enum('available', 'in-use', 'maintenance', 'retired'),
        default='available',
        nullable=False
    )
    
    current_area_id = Column(Integer, ForeignKey('Area.area_id', ondelete='SET NULL'), nullable=True)

    def __repr__(self):
        return f"<Equipment(equipment_id={self.equipment_id}, name='{self.name}', status='{self.status}')>"
