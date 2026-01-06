# SmartSite - Construction Area Management System

## Project Overview

SmartSite is a comprehensive **Database Management System (DBMS)** designed for managing construction projects with role-based access control. It serves as an academic project demonstrating professional software engineering practices including authentication, authorization, and multi-user access patterns.

### Key Features

✅ **Role-Based Authentication**
- Engineer role: Full access to all project data
- Worker role: Limited access to assigned areas and tasks only
- Secure bcrypt password hashing
- HTTP-only session cookies (24-hour expiration)

✅ **Database Management**
- 12+ SQLAlchemy ORM models
- MySQL 8.0 with proper relationships and constraints
- Automatic table initialization via Python scripts
- Foreign key relationships with cascading deletes

✅ **Multi-User Dashboard**
- Engineer dashboard: KPI cards, analytics, full navigation
- Worker dashboard: Task-focused view with progress tracking
- Real-time data updates
- Professional UI with responsive design

✅ **API-Driven Architecture**
- RESTful FastAPI backend with 13+ routers
- Automatic API documentation (Swagger/OpenAPI)
- Stateless endpoints with session validation
- Error handling and validation

## Technology Stack

### Backend
- **Framework**: FastAPI (Python async web framework)
- **ORM**: SQLAlchemy 2.0 (Python SQL toolkit)
- **Database**: MySQL 8.0 (Relational database)
- **Authentication**: Passlib + Bcrypt (Password hashing)
- **Server**: Uvicorn (ASGI server)

### Frontend
- **HTML5**: Semantic markup with accessibility
- **CSS3**: Professional styling with responsive grid
- **JavaScript**: Vanilla ES6+ (No frameworks for simplicity)
- **API Client**: Fetch API with async/await

### Dependencies
```
fastapi==0.104.1
uvicorn==0.24.0
sqlalchemy==2.0.23
mysql-connector-python==8.0.34
pydantic==2.5.2
passlib==1.7.4
bcrypt==4.1.1
python-multipart==0.0.6
```

## Project Structure

```
SmartSite/Project/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── database.py             # SQLAlchemy configuration
│   ├── init_db.py              # Database initialization script
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py             # User model (auth)
│   │   ├── engineer.py
│   │   ├── area.py
│   │   ├── task.py
│   │   ├── worker.py
│   │   ├── equipment.py
│   │   ├── material.py
│   │   ├── cost.py
│   │   ├── budget.py
│   │   ├── schedule.py
│   │   ├── safety_incident.py
│   │   └── alert.py
│   ├── schemas/
│   │   ├── user_schema.py      # User validation schemas
│   │   ├── area_schema.py
│   │   ├── task_schema.py
│   │   ├── worker_schema.py
│   │   └── ... (other schemas)
│   └── routes/
│       ├── auth_routes.py      # Authentication endpoints
│       ├── area_routes.py
│       ├── task_routes.py
│       ├── worker_routes.py
│       └── ... (other routes)
├── frontend/
│   ├── login.html              # Login page
│   ├── signup.html             # Signup page
│   ├── engineer-dashboard.html # Engineer portal
│   ├── worker-dashboard.html   # Worker portal
│   ├── areas.html
│   ├── area-tasks.html
│   ├── workers.html
│   ├── engineers.html
│   ├── equipment.html
│   ├── materials.html
│   ├── cost-summary.html
│   ├── alerts-dashboard.html
│   ├── safety-incidents.html
│   ├── schedules.html
│   ├── reports.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── dashboard.js
├── database/
│   ├── schema.sql              # Database schema DDL
│   ├── sample_data.sql         # Sample test data
│   ├── triggers_views.sql      # Advanced views
│   └── create_user_table.sql   # User table migration
└── docs/
    └── (Documentation files)
```

## Installation & Setup

### 1. Prerequisites
- Python 3.8+
- MySQL 8.0+
- Git

### 2. Clone and Navigate
```bash
git clone <repository-url>
cd SmartSite/Project
```

### 3. Create Virtual Environment
```bash
# Windows (PowerShell)
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Windows (CMD)
python -m venv .venv
.venv\Scripts\activate.bat

# Linux/Mac
python -m venv .venv
source .venv/bin/activate
```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

### 5. Database Setup
```sql
-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS area_mgmt;
USE area_mgmt;

-- Load existing schema
SOURCE database/schema.sql;

-- Load sample data
SOURCE database/sample_data.sql;
```

### 6. Initialize User Table
```bash
cd backend
python init_db.py
```

This script creates the User table automatically using SQLAlchemy models.

### 7. Start the Server
```bash
cd backend
uvicorn main:app --reload
```

Server runs at: `http://localhost:8000`

### 8. Access the Application
Open browser and visit: `http://localhost:8000`
→ Automatically redirected to `/login.html`

## Authentication System

### Signup Flow

**Engineer Registration:**
1. Visit `/signup.html`
2. Select "Engineer" role
3. Enter email and password
4. Submit form
5. POST to `/api/auth/signup/engineer`
6. User created in database
7. Redirect to `/login.html`

**Worker Registration:**
1. Visit `/signup.html`
2. Select "Worker" role
3. Select assigned area from dropdown
4. Enter email and password
5. Submit form
6. POST to `/api/auth/signup/worker` (includes area_id)
7. User created with area assignment
8. Redirect to `/login.html`

### Login Flow

1. Visit `/login.html`
2. Select role (Engineer or Worker)
3. Enter email and password
4. POST to `/api/auth/login`
5. Server validates:
   - Email exists
   - Password hash matches
   - Role matches account type
6. Session created (stored in server memory)
7. HTTP-only cookie set (24-hour expiration)
8. Redirect based on role:
   - Engineer → `/engineer-dashboard.html`
   - Worker → `/worker-dashboard.html`

### Session Management

- **Storage**: Server-side in-memory dictionary
- **Token**: Random 32-character string (base64)
- **Cookie**: HTTP-only, SameSite=lax, Max-Age=86400 (24 hours)
- **Validation**: GET `/api/auth/me` checks session validity
- **Expiration**: 24 hours of inactivity

### Password Security

- **Hashing**: bcrypt (via passlib)
- **Cost**: 12 rounds (default)
- **Hash Length**: 60 characters
- **Never Stored**: Plain text passwords are never stored
- **Verification**: Constant-time comparison to prevent timing attacks

## API Endpoints

### Authentication Routes (`/api/auth`)

```
POST /api/auth/signup/engineer
  Register new engineer account
  Body: { email, password, password_confirm, role }
  Returns: 200 { message, user_id }
  Errors: 400 (validation), 409 (duplicate email)

POST /api/auth/signup/worker
  Register new worker account
  Body: { email, password, password_confirm, role, area_id }
  Returns: 200 { message, user_id }
  Errors: 400 (validation), 404 (area not found), 409 (duplicate email)

POST /api/auth/login
  Authenticate user and create session
  Body: { email, password, role }
  Returns: 200 { message, user_id, email, role }
  Cookie: Set-Cookie: session_token=...
  Errors: 401 (invalid credentials), 400 (role mismatch)

POST /api/auth/logout
  Destroy session and clear cookie
  Requires: Valid session cookie
  Returns: 200 { message }
  Cookie: Set-Cookie: session_token=; Max-Age=0
  Errors: 401 (not authenticated)

GET /api/auth/me
  Get current authenticated user
  Requires: Valid session cookie
  Returns: 200 { user_id, email, role, area_id }
  Errors: 401 (not authenticated)

GET /api/auth/protected/test
  Test protected endpoint
  Requires: Valid session cookie
  Returns: 200 { message, user }
  Errors: 401 (not authenticated)
```

### Other Routes (13+ routers available)
See `/docs` endpoint for full Swagger documentation.

## Database Schema

### User Table (Authentication)
```sql
CREATE TABLE `User` (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('engineer', 'worker') NOT NULL,
    area_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(area_id) REFERENCES Area(area_id) ON DELETE SET NULL,
    INDEX ix_User_email (email),
    INDEX ix_User_role (role)
);
```

### Other Key Tables
- **Engineer**: Professional staff managing projects
- **Area**: Construction zones with location and status
- **Worker**: Labor force assigned to areas
- **Task**: Work items with deadlines and progress
- **Equipment**: Tools and machinery inventory
- **Material**: Construction materials and supplies
- **Cost**: Financial tracking for project
- **Budget**: Budget allocation and planning
- **Schedule**: Timeline and milestones
- **SafetyIncident**: Incident logging and tracking
- **Alert**: Notifications for managers
- **Schedule**: Project timeline management

## Role-Based Access Control (RBAC)

### Engineer Role
- **Access**: Full access to all project data
- **Dashboard**: `/engineer-dashboard.html`
- **Permissions**:
  - View all areas
  - Create/edit tasks
  - Assign workers
  - View reports and analytics
  - Manage budgets and costs
  - Review safety incidents
- **API Access**: All endpoints except worker-specific operations
- **Area Assignment**: None required (view all areas)

### Worker Role
- **Access**: Limited to assigned area only
- **Dashboard**: `/worker-dashboard.html`
- **Permissions**:
  - View assigned area details
  - View assigned tasks
  - Update task progress
  - View safety guidelines
  - Cannot access other areas/workers
- **API Access**: Only /api/tasks with area_id filter
- **Area Assignment**: Required at signup
- **Data Isolation**: Filtered at frontend and enforced at backend

## Testing Guide

### Test Case 1: Engineer Signup & Login
```
1. Go to /signup.html
2. Select "Engineer" tab
3. Email: engineer@example.com
4. Password: Test123456
5. Confirm Password: Test123456
6. Submit
7. Verify: User created in database
8. Go to /login.html
9. Select Engineer tab
10. Email: engineer@example.com
11. Password: Test123456
12. Submit
13. Verify: Redirected to /engineer-dashboard.html
14. Verify: All KPI cards visible
```

### Test Case 2: Worker Signup & Login
```
1. Go to /signup.html
2. Select "Worker" tab
3. Email: worker@example.com
4. Password: Test123456
5. Select Area: (choose any area)
6. Confirm Password: Test123456
7. Submit
8. Verify: User created with area_id in database
9. Go to /login.html
10. Select Worker tab
11. Email: worker@example.com
12. Password: Test123456
13. Submit
14. Verify: Redirected to /worker-dashboard.html
15. Verify: Only assigned area visible
16. Verify: Only tasks for this worker shown
```

### Test Case 3: Role-Based Access Control
```
1. Login as worker
2. Note the URL
3. Try to access /engineer-dashboard.html directly
4. Verify: Access Denied message appears
5. Try to access API endpoint that requires engineer role
6. Verify: 403 Forbidden response
```

### Test Case 4: Session Expiration
```
1. Login successfully
2. Wait 24+ hours (or manually clear cookie)
3. Reload page
4. Verify: Redirected to /login.html
5. Verify: Session cookie cleared
```

### Test Case 5: Password Security
```
1. Signup with password
2. Check database: password stored as hash
3. Verify: Hash starts with $2b$ (bcrypt identifier)
4. Try login with wrong password
5. Verify: 401 Unauthorized response
6. Verify: No password matching errors (security)
```

## Security Features

### Authentication Security
- ✅ **Password Hashing**: bcrypt with 12 rounds
- ✅ **Secure Cookies**: HTTP-only, SameSite=lax
- ✅ **Session Validation**: Server-side verification on each request
- ✅ **CSRF Protection**: SameSite cookie attribute
- ✅ **Email Uniqueness**: UNIQUE constraint in database
- ✅ **Role Verification**: Login validates role matches account

### API Security
- ✅ **Input Validation**: Pydantic schema validation
- ✅ **Error Handling**: No sensitive data in error messages
- ✅ **Access Control**: Dependency injection for role verification
- ✅ **Rate Limiting**: Can be added with middleware
- ✅ **CORS**: Configured for same-origin requests

### Data Security
- ✅ **Foreign Key Constraints**: Referential integrity
- ✅ **Index Optimization**: Fast lookups on email, role
- ✅ **Data Isolation**: Workers see only assigned data
- ✅ **Timestamp Tracking**: Audit trail for user creation

## Troubleshooting

### Error: "Table 'area_mgmt.user' doesn't exist"
**Solution:**
```bash
cd backend
python init_db.py
```

### Error: "mysql.connector.errors.ProgrammingError"
**Solution:**
- Ensure MySQL is running
- Check database 'area_mgmt' exists
- Verify connection string in `backend/database.py`

### Error: "401 Unauthorized" on dashboard
**Solution:**
- Session may have expired
- Log in again at `/login.html`
- Check if cookies are enabled in browser

### Error: "403 Access Denied"
**Solution:**
- Role mismatch (engineer page as worker or vice versa)
- Ensure logged in with correct role
- Check role in database User table

### Error: "Duplicate entry for key 'ix_User_email'"
**Solution:**
- Email already registered
- Use different email for signup
- Or delete user from database and retry

## Development Notes

### Key Files for Authentication
- `backend/models/user.py` - User ORM model
- `backend/schemas/user_schema.py` - Pydantic validation
- `backend/routes/auth_routes.py` - Authentication endpoints
- `frontend/login.html` - Login UI
- `frontend/signup.html` - Signup UI
- `frontend/engineer-dashboard.html` - Engineer portal
- `frontend/worker-dashboard.html` - Worker portal

### Extending the System

**Add New Role:**
1. Update `user.py` - Add role to UserRole enum
2. Update `user_schema.py` - Add role validation
3. Update `auth_routes.py` - Add signup endpoint
4. Create new dashboard page for role
5. Add access control dependency

**Add New Data Model:**
1. Create model in `backend/models/`
2. Create schema in `backend/schemas/`
3. Create routes in `backend/routes/`
4. Register router in `backend/main.py`
5. Create/update database table

### Performance Optimization

**Database Indexes:**
- User email: UNIQUE index for fast login
- User role: Regular index for role-based queries
- Area id: FK index for worker area assignment

**API Optimization:**
- Use `select()` with `join()` for complex queries
- Implement pagination for large datasets
- Cache frequently accessed data
- Use database connection pooling

## Academic Submission

This project demonstrates:
- ✅ Relational database design with proper normalization
- ✅ Multi-user authentication and authorization
- ✅ Secure password handling with hashing
- ✅ Role-based access control
- ✅ RESTful API design patterns
- ✅ Frontend-backend integration
- ✅ Data validation and error handling
- ✅ Session management
- ✅ SQL query optimization
- ✅ Professional code structure and documentation

## License

This project is for academic purposes as part of a Database Management System course.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation at `/docs`
3. Check database schema in `database/schema.sql`
4. Review code comments in relevant files

---

**Last Updated**: [Current Date]
**Version**: 1.0 - Authentication & RBAC Complete
