"""
Load Sample Data into Database (Core Data Only - Robust Version)
This script inserts essential sample data using actual IDs from the database
"""

import sys
import mysql.connector

def load_sample_data():
    """Load core sample data (Areas, Engineers, Workers, Tasks)"""
    print("Loading sample data...")
    print("="*60)
    
    try:
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password='root',
            database='area_mgmt'
        )
        
        cursor = conn.cursor()
        
        # 1. AREA DATA
        area_data = [
            ("Foundation Area", "Site A - East Wing", 1500.50, "construction", "active"),
            ("Electrical Section", "Site A - Ground Floor", 800.00, "electrical", "active"),
            ("Plumbing Section", "Site A - Basement", 600.25, "plumbing", "planned"),
            ("Structural Steel", "Site B - Tower", 2000.75, "structural", "active"),
            ("Interior Finishing", "Site A - Upper Floors", 1200.00, "finishing", "planned"),
            ("HVAC Section", "Site B - All Levels", 950.50, "hvac", "planned"),
            ("Landscaping Area", "Site A - Perimeter", 500.00, "landscaping", "planned"),
        ]
        
        print("\nInserting Area data...")
        for area in area_data:
            cursor.execute(
                "INSERT INTO Area (name, location, boundary_size, area_type, status) VALUES (%s, %s, %s, %s, %s)",
                area
            )
        print(f"  Inserted {len(area_data)} areas")
        conn.commit()
        
        # Get the area IDs that were just created
        cursor.execute("SELECT area_id FROM Area ORDER BY area_id DESC LIMIT %s", (len(area_data),))
        area_ids = sorted([row[0] for row in cursor.fetchall()])
        print(f"  Area IDs: {area_ids}")
        
        # 2. ENGINEER DATA
        engineer_data = [
            ("John Smith", "john.smith@company.com", "555-0101", "Structural Engineering"),
            ("Sarah Johnson", "sarah.johnson@company.com", "555-0102", "Electrical Engineering"),
            ("Mike Davis", "mike.davis@company.com", "555-0103", "Civil Engineering"),
            ("Emily Wilson", "emily.wilson@company.com", "555-0104", "HVAC Engineering"),
            ("Robert Brown", "robert.brown@company.com", "555-0105", "Project Management"),
            ("Jennifer Lee", "jennifer.lee@company.com", "555-0106", "Materials Engineering"),
            ("David Martinez", "david.martinez@company.com", "555-0107", "Safety Engineering"),
            ("Lisa Anderson", "lisa.anderson@company.com", "555-0108", "Quality Assurance"),
        ]
        
        print("\nInserting Engineer data...")
        for eng in engineer_data:
            cursor.execute(
                "INSERT INTO Engineer (name, email, phone, expertise) VALUES (%s, %s, %s, %s)",
                eng
            )
        print(f"  Inserted {len(engineer_data)} engineers")
        conn.commit()
        
        # 3. WORKER DATA
        worker_data = [
            ("Ahmed Hassan", "intermediate", 150.00, "555-1001", area_ids[0]),
            ("Raj Patel", "advanced", 200.00, "555-1002", area_ids[1]),
            ("Carlos Rodriguez", "beginner", 100.00, "555-1003", area_ids[2]),
            ("James Wilson", "intermediate", 150.00, "555-1004", area_ids[0]),
            ("Mohamed Ali", "advanced", 200.00, "555-1005", area_ids[1]),
            ("Antonio Giallo", "intermediate", 150.00, "555-1006", area_ids[3]),
            ("Zhang Wei", "beginner", 100.00, "555-1007", area_ids[4]),
            ("Yuki Tanaka", "advanced", 200.00, "555-1008", area_ids[5]),
            ("Sofia Santos", "beginner", 100.00, "555-1009", area_ids[0]),
            ("Peter Mueller", "intermediate", 150.00, "555-1010", area_ids[6]),
        ]
        
        print("\nInserting Worker data...")
        for worker in worker_data:
            cursor.execute(
                "INSERT INTO Worker (name, skill, cost_per_day, contact, current_area_id) VALUES (%s, %s, %s, %s, %s)",
                worker
            )
        print(f"  Inserted {len(worker_data)} workers")
        conn.commit()
        
        # Get worker IDs for task assignments
        cursor.execute(f"SELECT worker_id FROM Worker ORDER BY worker_id LIMIT {len(worker_data)}")
        worker_ids = [row[0] for row in cursor.fetchall()]
        
        # 4. TASK DATA
        task_data = [
            (area_ids[0], "Excavation", "Ground excavation and site preparation", "2024-02-15", "2024-03-15", worker_ids[0]),
            (area_ids[0], "Foundation Pouring", "Concrete foundation preparation and pouring", "2024-03-15", "2024-03-20", worker_ids[1]),
            (area_ids[1], "Electrical Wiring - Phase 1", "Install primary electrical conduit", "2024-03-01", "2024-03-18", worker_ids[2]),
            (area_ids[1], "Power Panel Installation", "Install main power distribution panel", "2024-03-18", "2024-03-28", worker_ids[3]),
            (area_ids[2], "Pipe Installation", "Install plumbing pipes for water system", "2024-03-20", "2024-04-10", worker_ids[4]),
            (area_ids[3], "Steel Frame Assembly", "Assemble structural steel framework", "2024-03-01", "2024-03-30", worker_ids[5]),
            (area_ids[4], "Drywall Installation", "Install interior drywall partitions", "2024-04-01", "2024-04-20", worker_ids[6]),
            (area_ids[4], "Painting Base Coats", "Apply base coat paint to interior walls", "2024-04-20", "2024-04-25", worker_ids[7]),
            (area_ids[5], "HVAC Ductwork", "Install HVAC distribution ductwork", "2024-03-25", "2024-04-22", worker_ids[8]),
            (area_ids[6], "Site Landscaping", "Landscape and prepare exterior grounds", "2024-04-15", "2024-05-15", worker_ids[9]),
        ]
        
        print("\nInserting Task data...")
        for task in task_data:
            cursor.execute(
                "INSERT INTO Task (area_id, title, description, planned_start, planned_end, assigned_worker_id) VALUES (%s, %s, %s, %s, %s, %s)",
                task
            )
        print(f"  Inserted {len(task_data)} tasks")
        conn.commit()
        
        print("\n" + "="*60)
        print("All core sample data loaded successfully!")
        
        # Verify
        print("\nVerifying core data loads:")
        tables = ['Area', 'Engineer', 'Worker', 'Task']
        
        for table_name in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            count = cursor.fetchone()[0]
            print(f"  {table_name}: {count} records")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = load_sample_data()
    sys.exit(0 if success else 1)
