"""
Authentication Routes
User signup, login, logout, and role-based access control

AUTHENTICATION STRATEGY:
- Password hashing: passlib with bcrypt
- Session management: Simple session-based auth with HTTP-only cookies
- Role verification: Dependency functions check user role and permissions
- Stateless: Each request validates session token

DBMS PRINCIPLES:
- User table normalized separately from domain entities
- Role as ENUM for data integrity
- Email unique index for fast lookups
- Worker area_id foreign key enables role-based filtering
"""

from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
import secrets

from database import SessionLocal
from models.user import User
from models.area import Area
from models.task import Task
from models.worker import Worker
from models.engineer import Engineer
from schemas.user_schema import (
    UserCreate,
    UserResponse,
    LoginRequest,
    LoginResponse,
    TokenResponse,
    LogoutResponse
)

router = APIRouter()

pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto"
)

sessions = {}

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def hash_password(password: str) -> str:
    """Hash password using argon2 (no byte limits)"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against hashed password"""
    return pwd_context.verify(plain_password, hashed_password)


def create_session_token() -> str:
    """Generate secure random session token"""
    return secrets.token_urlsafe(32)


def get_db():
    """Dependency: Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ============================================================================
# DEPENDENCY FUNCTIONS - Role-Based Access Control
# ============================================================================

def get_current_user(request: Request, db: Session = Depends(get_db)):
    """
    Dependency: Extract current user from session
    Raises 401 if not authenticated
    """
    token = request.cookies.get("session_token")
    
    if not token or token not in sessions:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated. Please log in."
        )
    
    session_data = sessions[token]
    user = db.query(User).filter(User.user_id == session_data["user_id"]).first()
    
    if not user:
        del sessions[token]
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user


def require_engineer(current_user: User = Depends(get_current_user)) -> User:
    """Dependency: Ensure user is an Engineer"""
    if not current_user.is_engineer():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Engineer role required."
        )
    return current_user


def require_worker(current_user: User = Depends(get_current_user)) -> User:
    """Dependency: Ensure user is a Worker"""
    if not current_user.is_worker():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Worker role required."
        )
    return current_user


# ============================================================================
# AUTHENTICATION ENDPOINTS
# ============================================================================

@router.post("/signup/engineer", response_model=UserResponse, tags=["Auth"])
def signup_engineer(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    POST /auth/signup/engineer
    Register a new Engineer account
    
    Request body:
    {
        "email": "engineer@example.com",
        "password": "secure_password",
        "password_confirm": "secure_password",
        "role": "engineer"
    }
    
    Returns: New engineer user details
    """
    if user_data.password != user_data.password_confirm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Engineers cannot be assigned to area during signup
    if user_data.area_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Engineers are not assigned to areas during signup. Areas are managed separately."
        )
    
    # Create new engineer user
    new_user = User(
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role="engineer",
        area_id=None  # Engineers don't have assigned area
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@router.post("/signup/worker", response_model=UserResponse, tags=["Auth"])
def signup_worker(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    POST /auth/signup/worker
    Register a new Worker account
    
    Request body:
    {
        "email": "worker@example.com",
        "password": "secure_password",
        "password_confirm": "secure_password",
        "role": "worker",
        "area_id": 1
    }
    
    Returns: New worker user details
    """
    # Validate password match
    if user_data.password != user_data.password_confirm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Validate area_id exists (workers must be assigned to an area)
    if not user_data.area_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Worker must be assigned to an area"
        )
    
    area = db.query(Area).filter(Area.area_id == user_data.area_id).first()
    if not area:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Area with ID {user_data.area_id} not found"
        )
    
    # Create new worker user
    new_user = User(
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role="worker",
        area_id=user_data.area_id  # Workers assigned to area
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@router.post("/login", response_model=LoginResponse, tags=["Auth"])
def login(
    credentials: LoginRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    POST /auth/login
    Authenticate user with email and password
    
    Request body:
    {
        "email": "user@example.com",
        "password": "password123",
        "role": "engineer"
    }
    
    Returns: User info with session cookie set
    
    AUTHENTICATION FLOW:
    1. Find user by email
    2. Verify password matches stored hash
    3. Verify role matches (prevents workers from logging in as engineers)
    4. Create session token
    5. Store session in memory
    6. Return session cookie to client
    """
    # Find user by email
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify role matches (security check)
    if user.role != credentials.role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"This account is registered as a {user.role}, not a {credentials.role}"
        )
    
    # Create session
    session_token = create_session_token()
    sessions[session_token] = {
        "user_id": user.user_id,
        "email": user.email,
        "role": user.role,
        "area_id": user.area_id,
        "created_at": datetime.now()
    }
    
    # Set HTTP-only cookie (secure in production, use https=True)
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        max_age=86400,  # 24 hours
        samesite="lax"
    )
    
    # Find engineer_id if user is an engineer
    engineer_id = None
    if user.role == 'engineer':
        engineer = db.query(Engineer).filter(Engineer.email == user.email).first()
        if engineer:
            engineer_id = engineer.engineer_id
    
    return LoginResponse(
        user_id=user.user_id,
        email=user.email,
        role=user.role,
        area_id=user.area_id,
        engineer_id=engineer_id,
        message="Login successful"
    )


@router.post("/logout", response_model=LogoutResponse, tags=["Auth"])
def logout(
    request: Request,
    response: Response
):
    """
    POST /auth/logout
    End user session
    
    Returns: Logout confirmation
    """
    token = request.cookies.get("session_token")
    
    if token and token in sessions:
        del sessions[token]
    
    # Clear cookie
    response.delete_cookie("session_token")
    
    return LogoutResponse(message="Logged out successfully")


@router.get("/me", response_model=UserResponse, tags=["Auth"])
def get_current_user_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    GET /auth/me
    Get current logged-in user information
    
    For engineers: Also returns engineer_id from Engineer table (matched by email)
    
    Returns: Current user details with engineer_id if engineer role
    """
    # If engineer, find engineer_id by email
    engineer_id = None
    if current_user.role == 'engineer':
        engineer = db.query(Engineer).filter(Engineer.email == current_user.email).first()
        if engineer:
            engineer_id = engineer.engineer_id
    
    # Build response with engineer_id
    return UserResponse(
        user_id=current_user.user_id,
        email=current_user.email,
        role=current_user.role,
        area_id=current_user.area_id,
        engineer_id=engineer_id,
        created_at=current_user.created_at
    )


@router.get("/protected/test", tags=["Auth"])
def test_protected_endpoint(
    current_user: User = Depends(get_current_user)
):
    """
    GET /auth/protected/test
    Test endpoint - requires authentication
    """
    return {
        "message": f"Hello {current_user.email}",
        "role": current_user.role,
        "user_id": current_user.user_id
    }

@router.get("/debug/engineer-lookup", tags=["Debug"])
def debug_engineer_lookup(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    GET /auth/debug/engineer-lookup
    Debug endpoint - check if engineer exists for current user
    """
    from models.engineer import Engineer
    
    engineer = db.query(Engineer).filter(Engineer.email == current_user.email).first()
    
    if engineer:
        return {
            "found": True,
            "user_email": current_user.email,
            "user_role": current_user.role,
            "engineer_id": engineer.engineer_id,
            "engineer_email": engineer.email,
            "engineer_name": engineer.name
        }
    else:
        return {
            "found": False,
            "user_email": current_user.email,
            "user_role": current_user.role,
            "message": f"No engineer found with email {current_user.email}"
        }