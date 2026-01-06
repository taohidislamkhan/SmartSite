"""
Material Model
Represents construction materials tracked per area
DBMS Role: Entity with FK to Area; tracks inventory with reorder threshold
"""

from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, func
from database import Base


class Material(Base):
    """
    Material Table
    Stores material inventory per area: name, quantity, unit, cost, reorder threshold
    PK: material_id (AUTO_INCREMENT)
    FK: area_id -> Area(area_id)
    
    DBMS Note: ON DELETE CASCADE - material records deleted when area is deleted
    """
    __tablename__ = 'Material'

    # Primary Key
    material_id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Foreign Key: Area this material belongs to
    area_id = Column(Integer, ForeignKey('Area.area_id', ondelete='CASCADE'), nullable=False)
    
    # Core attributes
    name = Column(String(150), nullable=False)
    quantity = Column(Numeric(12, 3), default=0)  # Quantity in units
    unit = Column(String(30), nullable=True)  # e.g., "kg", "liter", "meter"
    unit_cost = Column(Numeric(12, 2), default=0)
    reorder_threshold = Column(Numeric(12, 3), default=0)  # Alert when below this
    
    # Metadata
    last_updated = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Material(material_id={self.material_id}, name='{self.name}', area_id={self.area_id})>"
