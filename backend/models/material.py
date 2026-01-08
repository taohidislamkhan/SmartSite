"""
Material Model
Represents construction materials tracked per area
"""

from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, func
from database import Base


class Material(Base):
    """
    Material Table
    Stores material inventory per area: name, quantity, unit, cost, reorder threshold
    """
    __tablename__ = 'Material'

    material_id = Column(Integer, primary_key=True, autoincrement=True)
    
    area_id = Column(Integer, ForeignKey('Area.area_id', ondelete='CASCADE'), nullable=False)
    
    name = Column(String(150), nullable=False)
    quantity = Column(Numeric(12, 3), default=0)
    unit = Column(String(30), nullable=True)
    unit_cost = Column(Numeric(12, 2), default=0)
    reorder_threshold = Column(Numeric(12, 3), default=0)
    
    last_updated = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Material(material_id={self.material_id}, name='{self.name}', area_id={self.area_id})>"
