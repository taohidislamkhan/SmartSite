"""
Database Initialization Script
Creates the User table for authentication
Run this script once to set up the database schema
"""

from sqlalchemy import create_engine, text

def init_db():
    """Initialize database - create User table using raw SQL"""
    try:
        # Use the same database URL as configured in database.py
        DATABASE_URL = "mysql+mysqlconnector://root:root@localhost:3306/area_mgmt"
        
        engine = create_engine(DATABASE_URL)
        
        print("Creating User table...")
        
        # SQL to create User table (if not exists)
        create_user_sql = """
        CREATE TABLE IF NOT EXISTS `User` (
            user_id INT NOT NULL AUTO_INCREMENT,
            email VARCHAR(255) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            `role` ENUM('engineer','worker') NOT NULL,
            area_id INT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id),
            UNIQUE KEY ix_User_email (email),
            KEY ix_User_role (`role`),
            FOREIGN KEY(area_id) REFERENCES `Area` (area_id) ON DELETE SET NULL
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
        """
        
        # Execute SQL
        with engine.connect() as conn:
            conn.execute(text(create_user_sql))
            conn.commit()
            print("✅ User table created successfully!")
        
        engine.dispose()
        
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        print("\nTroubleshooting:")
        print("  1. Ensure MySQL is running")
        print("  2. Ensure database 'area_mgmt' exists")
        print("  3. Check username and password in init_db.py (currently: root:root)")
        raise

if __name__ == "__main__":
    init_db()
