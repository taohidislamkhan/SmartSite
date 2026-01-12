#!/usr/bin/env python
"""
Insert sample materials and equipment into the database
"""

import sys
sys.path.insert(0, '.')

from database import SessionLocal
from models.material import Material
from models.equipment import Equipment
from datetime import datetime

# Create session
db = SessionLocal()

try:
    # Get an existing area to associate with materials/equipment
    from models.area import Area
    area = db.query(Area).first()
    if not area:
        print("ERROR: No areas found in database. Please create an area first.")
        sys.exit(1)
    
    area_id = area.area_id
    print(f"Using area: {area.name} (ID: {area_id})")
    
    # Clear existing data
    db.query(Material).delete()
    db.query(Equipment).delete()
    db.commit()
    print("Cleared existing materials and equipment")
    
    # Sample Materials (consumables)
    materials_data = [
        {
            "area_id": area_id,
            "name": "Cement",
            "quantity": 500,
            "unit": "kg",
            "unit_cost": 5.00,
            "reorder_threshold": 100
        },
        {
            "area_id": area_id,
            "name": "Steel Rebar",
            "quantity": 250,
            "unit": "units",
            "unit_cost": 12.50,
            "reorder_threshold": 50
        },
        {
            "area_id": area_id,
            "name": "Concrete Blocks",
            "quantity": 1000,
            "unit": "units",
            "unit_cost": 2.00,
            "reorder_threshold": 200
        },
        {
            "area_id": area_id,
            "name": "Sand",
            "quantity": 30,
            "unit": "tons",
            "unit_cost": 25.00,
            "reorder_threshold": 10
        },
        {
            "area_id": area_id,
            "name": "Gravel",
            "quantity": 20,
            "unit": "tons",
            "unit_cost": 30.00,
            "reorder_threshold": 5
        },
        {
            "area_id": area_id,
            "name": "Paint (Red)",
            "quantity": 45,
            "unit": "liters",
            "unit_cost": 15.00,
            "reorder_threshold": 10
        },
        {
            "area_id": area_id,
            "name": "Wood Plywood",
            "quantity": 25,
            "unit": "sheets",
            "unit_cost": 35.00,
            "reorder_threshold": 8
        },
        {
            "area_id": area_id,
            "name": "Electrical Wire",
            "quantity": 8,
            "unit": "rolls",
            "unit_cost": 50.00,
            "reorder_threshold": 2
        }
    ]
    
    for mat_data in materials_data:
        material = Material(**mat_data)
        db.add(material)
    
    db.commit()
    print(f"[OK] Added {len(materials_data)} materials")
    
    # Sample Equipment (reusable assets)
    equipment_data = [
        {
            "name": "Excavator CAT-320",
            "serial_no": "EXC-2024-001",
            "status": "available",
            "current_area_id": area_id
        },
        {
            "name": "Bulldozer Komatsu D65",
            "serial_no": "BULL-2024-001",
            "status": "in-use",
            "current_area_id": area_id
        },
        {
            "name": "Concrete Mixer",
            "serial_no": "MIX-2024-005",
            "status": "available",
            "current_area_id": area_id
        },
        {
            "name": "Scaffolding Set (50m)",
            "serial_no": "SCAF-2024-010",
            "status": "in-use",
            "current_area_id": area_id
        },
        {
            "name": "Power Drill Kit",
            "serial_no": "DRILL-2024-015",
            "status": "available",
            "current_area_id": area_id
        },
        {
            "name": "Wheel Loader",
            "serial_no": "WHEEL-2024-001",
            "status": "maintenance",
            "current_area_id": area_id
        },
        {
            "name": "Hydraulic Jack (10ton)",
            "serial_no": "JACK-2024-003",
            "status": "available",
            "current_area_id": area_id
        },
        {
            "name": "Air Compressor",
            "serial_no": "COMP-2024-008",
            "status": "retired",
            "current_area_id": area_id
        },
        {
            "name": "Safety Harness Set",
            "serial_no": "SAFE-2024-020",
            "status": "available",
            "current_area_id": area_id
        },
        {
            "name": "Laser Level",
            "serial_no": "LASER-2024-002",
            "status": "available",
            "current_area_id": area_id
        }
    ]
    
    for equip_data in equipment_data:
        equipment = Equipment(**equip_data)
        db.add(equipment)
    
    db.commit()
    print(f"[OK] Added {len(equipment_data)} equipment items")
    print("\n[OK] Sample resources inserted successfully!")
    print(f"  - Materials: {len(materials_data)}")
    print(f"  - Equipment: {len(equipment_data)}")
    print("\nRefresh your Resources page to see the data.")
    
except Exception as e:
    db.rollback()
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
finally:
    db.close()
