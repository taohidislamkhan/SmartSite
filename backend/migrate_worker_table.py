"""
Database Migration Script - Add current_task_id to Worker table
Run this script to add the new column needed for task assignment functionality
"""

from sqlalchemy import create_engine, text

def migrate_worker_table():
    """Add current_task_id column to Worker table"""
    try:
        DATABASE_URL = "mysql+mysqlconnector://root:root@localhost:3306/area_mgmt"
        
        engine = create_engine(DATABASE_URL)
        
        print("Adding current_task_id column to Worker table...")
        
        alter_worker_sql = """
        ALTER TABLE `Worker` 
        ADD COLUMN current_task_id INT NULL,
        ADD FOREIGN KEY (current_task_id) REFERENCES `Task` (task_id) ON DELETE SET NULL
        """
        
        with engine.connect() as conn:
            # First check if column already exists
            check_column = """
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Worker' AND COLUMN_NAME = 'current_task_id'
            """
            result = conn.execute(text(check_column))
            if result.fetchone():
                print("✅ Column current_task_id already exists in Worker table!")
            else:
                conn.execute(text(alter_worker_sql))
                conn.commit()
                print("✅ current_task_id column added successfully to Worker table!")
        
        engine.dispose()
        
    except Exception as e:
        print(f"❌ Error migrating database: {e}")
        print("\nTroubleshooting:")
        print("  1. Ensure MySQL is running")
        print("  2. Ensure database 'area_mgmt' exists")
        print("  3. Check username and password (currently: root:root)")
        print("  4. If column already exists, it's safe to ignore this error")
        raise

if __name__ == "__main__":
    migrate_worker_table()
