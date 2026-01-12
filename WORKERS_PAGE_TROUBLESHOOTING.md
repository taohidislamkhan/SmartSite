# Workers Page Error - Step-by-Step Fix Guide

## Problem
When accessing `/workers.html`, you see: "Error loading worker data. Please refresh the page."

## Root Cause
The Workers Management page requires:
1. Database schema update (add `current_task_id` column to Worker table)
2. New API endpoints for task and area assignment
3. Updated Worker schema to include the new field

## Solution Steps

### Step 1: Update Database Schema

Run the migration SQL:

```bash
# Option A: Via command line
mysql -u root -p area_mgmt < database/workers_migration.sql

# Option B: Via MySQL Workbench
1. Open MySQL Workbench
2. Connect to your database
3. Open database/workers_migration.sql
4. Execute the script
```

**SQL to execute:**
```sql
ALTER TABLE `Worker` 
ADD COLUMN current_task_id INT NULL AFTER current_area_id,
ADD FOREIGN KEY (current_task_id) REFERENCES `Task` (task_id) ON DELETE SET NULL;
```

### Step 2: Verify Backend Files

The following files have been updated automatically. Verify they exist:

- ✅ `backend/models/worker.py` - Updated with `current_task_id` field
- ✅ `backend/schemas/worker_schema.py` - Updated with `current_task_id` field  
- ✅ `backend/routes/worker_routes.py` - Added task and area assignment endpoints
- ✅ `frontend/js/workers.js` - Enhanced error handling and logging

### Step 3: Restart Backend Server

Stop and restart the uvicorn server to load the updated code:

```bash
# In PowerShell, press Ctrl+C to stop the current uvicorn process
# Then run:
cd backend
uvicorn main:app --reload
```

### Step 4: Test the Workers Page

1. Open browser and go to: `http://127.0.0.1:8000/workers.html`
2. Open browser console (F12 → Console tab)
3. You should see logs like:
   - "Workers page loaded"
   - "Workers loaded: X"
   - "Areas loaded: X"
   - "Tasks loaded: X"

## Verification Checklist

- [ ] Database migration SQL executed successfully
- [ ] `DESCRIBE Worker;` shows both `current_area_id` and `current_task_id` columns
- [ ] Backend server restarted (uvicorn running)
- [ ] No errors in browser console
- [ ] Workers table displays with data
- [ ] Filter dropdowns are populated
- [ ] "Assign Task" and "Reassign Project" buttons work

## If Still Getting Errors

### Check 1: Browser Console (F12)
Look for specific error messages like:
- "Failed to fetch workers" → API endpoint issue
- "Error decoding token" → Authentication issue
- Network tab shows 404/500 → Endpoint not found/server error

### Check 2: Backend Logs
Look at uvicorn terminal for error messages

### Check 3: Database
Verify database has sample data:
```sql
USE area_mgmt;
SELECT * FROM Worker LIMIT 5;
SELECT * FROM Area LIMIT 5;
SELECT * FROM Task LIMIT 5;
```

### Check 4: API Health
Test the API directly:
```bash
# Open browser and navigate to:
http://127.0.0.1:8000/api/workers
http://127.0.0.1:8000/api/areas
http://127.0.0.1:8000/api/tasks
```

You should see JSON data. If you get 500 errors, check the uvicorn logs.

## API Endpoints Added

### Assign Task to Worker
```
PUT /api/workers/{worker_id}/task
Body: { "task_id": int }
Response: Updated worker object
```

### Reassign Worker to Area
```
PUT /api/workers/{worker_id}/area
Body: { "area_id": int, "retain_task": bool (optional) }
Response: Updated worker object
```

## Summary of Changes

| File | Change | Purpose |
|------|--------|---------|
| `backend/models/worker.py` | Added `current_task_id` column | Enable task assignments |
| `backend/schemas/worker_schema.py` | Added `current_task_id` field | Serialize task data in API |
| `backend/routes/worker_routes.py` | Added 2 new endpoints | Handle task and area assignments |
| `frontend/js/workers.js` | Enhanced error handling | Better debugging info |
| `database/workers_migration.sql` | New migration file | Database schema update |
| `backend/migrate_worker_table.py` | New script | Automated migration tool |

## Common Issues & Solutions

### "Failed to fetch workers: 401"
- **Issue**: Authentication token is invalid/expired
- **Solution**: Logout and login again to get a fresh token

### "Failed to fetch workers: 500"
- **Issue**: Backend error, likely database connection issue
- **Solution**: Check uvicorn logs, verify MySQL is running

### "Failed to fetch areas: 404"
- **Issue**: Area endpoint not found (unlikely since we didn't modify it)
- **Solution**: Verify routes are properly imported in `main.py`

### "Table shows empty"
- **Issue**: No sample data in database
- **Solution**: Run `python backend/load_sample_data.py` to populate test data

### "Filters not populating"
- **Issue**: Area data not loading correctly
- **Solution**: Check browser console, verify areas exist in database

## Need More Help?

1. Check the detailed logs in `WORKERS_PAGE_FIXES.txt`
2. Review error messages in browser console (F12)
3. Check uvicorn server logs for backend errors
4. Verify MySQL is running and database is accessible
5. Run sample data loader if database is empty
