"""Clear all data from database"""
import mysql.connector

c = mysql.connector.connect(host='localhost', user='root', password='root', database='area_mgmt')
cur = c.cursor()

# Disable foreign keys temporarily
cur.execute('SET FOREIGN_KEY_CHECKS=0')

# Delete all data from all tables
tables = ['Alert', 'Budget', 'Cost', 'Material', 'Equipment', 'Task', 'Worker', 'Engineer', 'Area', 'SafetyIncident']
for table in tables:
    try:
        cur.execute(f'DELETE FROM {table}')
        print(f'Cleared {table}')
    except Exception as e:
        print(f'Error clearing {table}: {e}')

# Re-enable foreign keys
cur.execute('SET FOREIGN_KEY_CHECKS=1')
c.commit()
cur.close()
c.close()
print('Database cleared successfully')
