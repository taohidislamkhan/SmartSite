"""
SmartSite Backend API
Construction Area Management System
Database: area_mgmt (MySQL)
"""

import os
import sys
from pathlib import Path

backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse

from routes.engineer_routes import router as engineer_router
from routes.area_routes import router as area_router
from routes.worker_routes import router as worker_router
from routes.equipment_routes import router as equipment_router
from routes.material_routes import router as material_router
from routes.task_routes import router as task_router
from routes.schedule_routes import router as schedule_router
from routes.cost_routes import router as cost_router
from routes.budget_routes import router as budget_router
from routes.alert_routes import router as alert_router
from routes.safety_incident_routes import router as safety_incident_router
from routes.analytics_routes import router as analytics_router
from routes.advanced_query_routes import router as advanced_query_router
from routes.auth_routes import router as auth_router
from routes.dashboard_routes import router as dashboard_router
from routes.projects_routes import router as projects_router

app = FastAPI(
    title="SmartSite API",
    description="Construction Area Management System",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(engineer_router, prefix="/api/engineers", tags=["Engineers"])
app.include_router(area_router, prefix="/api/areas", tags=["Areas"])
app.include_router(worker_router, prefix="/api/workers", tags=["Workers"])
app.include_router(equipment_router, prefix="/api/equipment", tags=["Equipment"])
app.include_router(material_router, prefix="/api/materials", tags=["Materials"])
app.include_router(task_router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(schedule_router, prefix="/api/schedules", tags=["Schedules"])
app.include_router(cost_router, prefix="/api/costs", tags=["Costs"])
app.include_router(budget_router, prefix="/api/budgets", tags=["Budgets"])
app.include_router(alert_router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(safety_incident_router, prefix="/api/safety-incidents", tags=["Safety Incidents"])
app.include_router(analytics_router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(advanced_query_router, prefix="/api/advanced-queries", tags=["Advanced Queries"])
app.include_router(dashboard_router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(projects_router, prefix="/api/projects", tags=["Projects"])

@app.get("/")
def root_redirect():
    """
    GET /
    Redirect unauthenticated users to login page
    """
    return RedirectResponse(url="/login.html", status_code=303)


@app.get("/api", tags=["Health"])
def api_root():
    """
    GET /api
    API health check
    Returns: JSON with API status
    """
    return {
        "message": "SmartSite API Running",
        "status": "online",
        "database": "area_mgmt",
        "endpoints": {
            "engineers": "/api/engineers",
            "areas": "/api/areas",
            "workers": "/api/workers",
            "equipment": "/api/equipment",
            "materials": "/api/materials",
            "tasks": "/api/tasks",
            "costs": "/api/costs",
            "budgets": "/api/budgets",
            "docs": "/docs",
            "redoc": "/redoc"
        }
    }


@app.get("/health", tags=["Health"])
def health_check():
    """
    GET /health
    Detailed health check endpoint
    Returns: JSON with system status
    """
    return {
        "status": "healthy",
        "api_version": "1.0.0",
        "database": "connected"
    }


@app.get("/api/health", tags=["Health"])
def api_health_check():
    """
    GET /api/health
    API health check endpoint (called by dashboard.js)
    Returns: JSON with API and database connection status
    """
    return {
        "status": "healthy",
        "api": "connected",
        "database": "connected",
        "api_version": "1.0.0"
    }


frontend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")

if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="static")
