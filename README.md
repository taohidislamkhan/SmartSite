# SmartSite - Construction Area Management System

## 📋 Project Summary

SmartSite is a full-stack **Construction Area Management System** built with FastAPI (backend) and vanilla JavaScript (frontend). It provides a comprehensive solution for managing construction projects with role-based authentication, multi-user dashboards, and complete CRUD operations for project data. The system supports two user roles (Engineer and Worker) with different access levels and permissions.

**Status**: ✅ Production Ready | **Version**: 1.0

---

## ✨ Features Implemented

### Authentication & Authorization
- ✅ User registration (Engineer/Worker roles)
- ✅ Secure login with bcrypt password hashing
- ✅ Role-based access control (RBAC)
- ✅ Session management (24-hour expiration)
- ✅ HTTP-only secure cookies
- ✅ Logout functionality

### Dashboard & UI
- ✅ Engineer dashboard with KPI cards and analytics
- ✅ Worker dashboard with task-focused view
- ✅ Responsive design (HTML/CSS/JavaScript)
- ✅ Real-time data updates via Fetch API
- ✅ Professional styling with grid layout

### Data Management (CRUD)
- ✅ 12 database models (Area, Task, Worker, Equipment, Material, Cost, Budget, SafetyIncident, Alert, Schedule, Engineer, User)
- ✅ Create, Read, Update, Delete operations for all entities
- ✅ RESTful API with 13+ routers
- ✅ Input validation using Pydantic schemas
- ✅ Error handling with proper HTTP status codes

### Database
- ✅ MySQL 8.0 with proper relationships
- ✅ Foreign key constraints with cascading deletes
- ✅ 4 database views for analytics
- ✅ Sample data (150+ records)
- ✅ Automatic table initialization

### Security
- ✅ bcrypt password hashing (12 rounds)
- ✅ SQL injection prevention via SQLAlchemy ORM
- ✅ CSRF protection with SameSite cookies
- ✅ Input validation and sanitization
- ✅ Error messages without sensitive data

### API Documentation
- ✅ Swagger UI at `/docs`
- ✅ ReDoc at `/redoc`
- ✅ OpenAPI 3.0 specification

---

## 🚀 Complete Setup Guide for Another Device

### Prerequisites
Before starting, ensure you have:
- **Python 3.8 or higher** ([Download](https://www.python.org/downloads/))
- **MySQL 8.0 or higher** ([Download](https://dev.mysql.com/downloads/mysql/))
- **Git** (for cloning the repository)
- **Code Editor** (VS Code recommended)

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd SmartSite/Project
```

### Step 2: Create Virtual Environment
```bash
# Windows (PowerShell)
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Windows (Command Prompt)
python -m venv .venv
.venv\Scripts\activate.bat

# Linux/macOS
python -m venv .venv
source .venv/bin/activate
```

### Step 3: Install Python Dependencies
```bash
pip install -r requirements.txt
```

**Dependencies installed:**
- fastapi (web framework)
- uvicorn (ASGI server)
- sqlalchemy (database ORM)
- mysql-connector-python (MySQL driver)
- pydantic (data validation)
- passlib & bcrypt (password hashing)
- PyJWT & cryptography (authentication)
- python-dotenv (environment variables)
- python-multipart (file uploads)

### Step 4: Create MySQL Database
Open MySQL command line or MySQL Workbench and execute:

```sql
CREATE DATABASE IF NOT EXISTS area_mgmt;
USE area_mgmt;
```

### Step 5: Load Database Schema
Option A - Using MySQL CLI:
```bash
mysql -u root -p area_mgmt < database/complete_database.sql
```

Option B - Using MySQL Workbench:
1. Open MySQL Workbench
2. Go to File → Open SQL Script
3. Select `database/complete_database.sql`
4. Click Execute (lightning bolt icon)

Option C - Manual import in backend:
```bash
cd backend
python init_db.py
```

### Step 6: Verify Database Connection
Edit `backend/database.py` and ensure connection string matches your setup:

```python
# Check these settings match your MySQL installation
DATABASE_URL = "mysql+mysqlconnector://root:password@localhost:3306/area_mgmt"
```

Update `root` and `password` if different.

### Step 7: Start Backend Server
```bash
cd backend
uvicorn main:app --reload
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

### Step 8: Access the Application
Open your web browser and go to:
```
http://localhost:8000
```

You'll be automatically redirected to the login page.

### Step 9: Test with Sample Data
**Engineer Login:**
- Email: (Use any email from sample data)
- Password: (Set your own or use sample)
- Role: Engineer

**Worker Login:**
- Email: (Use any worker email from sample data)
- Role: Worker

---

---

## 🛠 Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Backend Framework** | FastAPI | 0.104.1 |
| **Server** | Uvicorn (ASGI) | 0.24.0 |
| **Database** | MySQL | 8.0+ |
| **ORM** | SQLAlchemy | 2.0.23 |
| **Authentication** | Passlib + Bcrypt | Latest |
| **Data Validation** | Pydantic | 2.5.2 |
| **Frontend** | HTML5/CSS3/JavaScript ES6+ | Vanilla (No frameworks) |

---

## 📁 Project Structure

```
SmartSite/Project/
├── backend/
│   ├── main.py                    # FastAPI application entry point
│   ├── database.py                # Database configuration
│   ├── init_db.py                 # Database initialization script
│   ├── models/                    # SQLAlchemy ORM models (12 models)
│   │   ├── user.py               # User authentication model
│   │   ├── area.py, task.py, worker.py, equipment.py, etc.
│   ├── schemas/                   # Pydantic validation schemas
│   │   ├── user_schema.py, area_schema.py, task_schema.py, etc.
│   └── routes/                    # API route handlers (13+ routers)
│       ├── auth_routes.py        # Authentication endpoints
│       ├── area_routes.py, task_routes.py, worker_routes.py, etc.
├── frontend/
│   ├── login.html                # Login page
│   ├── signup.html               # User registration page
│   ├── engineer-dashboard.html   # Engineer main dashboard
│   ├── worker-dashboard.html     # Worker main dashboard
│   ├── areas.html, tasks.html, workers.html, etc.
│   ├── css/
│   │   └── style.css            # Professional styling
│   └── js/
│       └── dashboard.js          # Frontend JavaScript logic
├── database/
│   ├── complete_database.sql    # Full schema with sample data
│   ├── schema.sql               # Database DDL
│   └── sample_data.sql          # 150+ sample records
├── docs/
│   └── (Documentation files)
├── requirements.txt             # Python dependencies
└── README.md                    # This file
```

---

---

## 🔐 User Roles & Permissions

### Engineer Role
- Full access to all project areas
- Create/edit/delete tasks
- Manage workers and equipment
- View analytics and reports
- Monitor budgets and costs
- Access: `/engineer-dashboard.html`

### Worker Role
- Access only to assigned area
- View and update assigned tasks
- View safety guidelines
- Cannot access other areas
- Access: `/worker-dashboard.html`

---

## 🧪 Quick Testing

After setup, test with these credentials:

**Test Engineer Account:**
1. Go to `/signup.html` → Select "Engineer"
2. Email: `test.engineer@company.com`
3. Password: `Test123456`
4. Confirm: `Test123456`
5. Submit → Redirected to `/login.html`
6. Login with above credentials
7. Should see Engineer Dashboard

**Test Worker Account:**
1. Go to `/signup.html` → Select "Worker"
2. Email: `test.worker@company.com`
3. Password: `Test123456`
4. Select Area: Any area from dropdown
5. Confirm: `Test123456`
6. Submit → Redirected to `/login.html`
7. Login with above credentials
8. Should see Worker Dashboard (limited to assigned area)

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **"Table 'area_mgmt.user' doesn't exist"** | Run `python backend/init_db.py` to create tables |
| **"Connection refused" (MySQL)** | Ensure MySQL is running: `mysql -u root -p` |
| **"401 Unauthorized" on dashboard** | Log in again at `/login.html`, session may have expired |
| **"403 Access Denied"** | You're trying to access wrong role's dashboard (engineer page as worker) |
| **"Duplicate entry" on signup** | Email already registered, use a different email |
| **Port 8000 already in use** | Run: `uvicorn main:app --reload --port 8001` |
| **Module not found error** | Ensure virtual environment is activated and dependencies installed |

---

## 📚 API Documentation

Once the server is running, access:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

---

## 📊 Database Schema Overview

### Core Tables
- **User**: Authentication (email, password_hash, role)
- **Engineer**: Project managers (name, email, expertise)
- **Area**: Construction sites (name, location, status)
- **Worker**: Labor force (name, skill, cost_per_day)
- **Task**: Work items (title, status, progress, dates)
- **Equipment**: Machinery (name, serial_no, status)
- **Material**: Inventory (name, quantity, reorder_threshold)
- **Cost**: Financial tracking (type, amount, date)
- **Budget**: Budget allocation (estimated_budget, fiscal_year)
- **Schedule**: Project timeline (planned_start, planned_end)
- **SafetyIncident**: Incident logging (type, severity, date)
- **Alert**: Notifications (alert_type, severity, is_resolved)

### Database Views
- `vw_delayed_tasks` - Overdue tasks with severity
- `vw_low_material_stock` - Inventory below threshold
- `vw_cost_over_budget` - Budget vs actual analysis
- `vw_area_progress_summary` - Comprehensive dashboard metrics

---

## 🔒 Security Features

✅ **Password Security**
- Bcrypt hashing with 12 rounds
- Never stores plain text passwords
- Constant-time password comparison

✅ **Session Management**
- HTTP-only cookies (cannot access via JavaScript)
- SameSite=lax (CSRF protection)
- 24-hour expiration
- Server-side session validation

✅ **Data Protection**
- SQL injection prevention (SQLAlchemy ORM)
- Input validation (Pydantic schemas)
- Foreign key constraints
- Role-based access control

✅ **API Security**
- Automatic Swagger documentation
- Input sanitization
- Error messages without sensitive data

---

---

## 📝 Additional Resources

- **Database File**: `database/complete_database.sql` - Full schema with all DDL and sample data
- **API Docs**: Access `/docs` after starting server for interactive Swagger UI
- **Sample Queries**: Check views in database schema for analytics queries

---

## 🎓 Academic Use

This project is designed as a complete demonstration of:
- Database design and normalization (12 tables with proper relationships)
- Multi-tier architecture (Frontend → API → Database)
- Authentication & authorization (role-based access control)
- CRUD operations (Create, Read, Update, Delete)
- REST API design principles
- Security best practices

---

## 📞 Support

If you encounter issues:
1. Check the **Troubleshooting** section above
2. Verify MySQL is running: `mysql -u root -p`
3. Confirm Python dependencies: `pip list`
4. Check virtual environment is activated
5. Review API docs at `http://localhost:8000/docs`

---

**Last Updated**: January 8, 2026  
**Version**: 1.0 - Production Ready  
**Project Type**: Full-Stack Web Application with Database Management

