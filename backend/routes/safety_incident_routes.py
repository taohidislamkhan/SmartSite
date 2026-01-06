"""
SafetyIncident Routes
CRUD endpoints for Safety Incident management
Automatically triggers Alert creation via database trigger
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database import SessionLocal
from models.safety_incident import SafetyIncident
from schemas.safety_incident_schema import SafetyIncidentCreate, SafetyIncidentResponse

router = APIRouter()


def get_db():
    """Dependency: Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[SafetyIncidentResponse])
def get_safety_incidents(
    area_id: int = None,
    severity: str = None,
    db: Session = Depends(get_db)
):
    """
    GET /safety-incidents
    Retrieve all safety incidents with optional filters
    
    Query params:
      - area_id: filter by area
      - severity: low|medium|high
    
    Returns: List of SafetyIncidentResponse objects
    
    DBMS Trigger: AFTER INSERT -> creates Alert with type='safety_alert'
    """
    query = db.query(SafetyIncident)
    if area_id:
        query = query.filter(SafetyIncident.area_id == area_id)
    if severity:
        query = query.filter(SafetyIncident.severity == severity)
    return query.order_by(SafetyIncident.incident_date.desc()).all()


@router.get("/{incident_id}", response_model=SafetyIncidentResponse)
def get_safety_incident(incident_id: int, db: Session = Depends(get_db)):
    """
    GET /safety-incidents/{incident_id}
    Retrieve safety incident by ID
    Returns: SafetyIncidentResponse object or 404 if not found
    """
    incident = db.query(SafetyIncident).filter(SafetyIncident.incident_id == incident_id).first()
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Safety incident with ID {incident_id} not found"
        )
    return incident


@router.post("/", response_model=SafetyIncidentResponse, status_code=status.HTTP_201_CREATED)
def create_safety_incident(
    incident_data: SafetyIncidentCreate,
    db: Session = Depends(get_db)
):
    """
    POST /safety-incidents
    Create new safety incident report
    
    Required: area_id, incident_date
    
    DBMS Trigger Interaction:
    1. Backend inserts SafetyIncident record
    2. MySQL trigger AFTER INSERT fires
    3. Trigger creates Alert record with:
       - alert_type: 'safety_alert'
       - severity: matches incident severity (low|medium|high)
       - ref_table: 'SafetyIncident'
       - ref_id: new incident_id
       - message: auto-generated from incident details
    4. Frontend queries /alerts to display to user
    
    Returns: Created SafetyIncidentResponse object
    """
    try:
        new_incident = SafetyIncident(**incident_data.dict())
        db.add(new_incident)
        db.commit()
        db.refresh(new_incident)
        return new_incident
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid incident data or invalid area ID"
        )


@router.put("/{incident_id}", response_model=SafetyIncidentResponse)
def update_safety_incident(
    incident_id: int,
    incident_data: SafetyIncidentCreate,
    db: Session = Depends(get_db)
):
    """
    PUT /safety-incidents/{incident_id}
    Update safety incident by ID
    Returns: Updated SafetyIncidentResponse object or 404 if not found
    """
    incident = db.query(SafetyIncident).filter(SafetyIncident.incident_id == incident_id).first()
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Safety incident with ID {incident_id} not found"
        )
    
    try:
        for key, value in incident_data.dict(exclude_unset=True).items():
            setattr(incident, key, value)
        db.commit()
        db.refresh(incident)
        return incident
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid update data or invalid area ID"
        )


@router.delete("/{incident_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_safety_incident(incident_id: int, db: Session = Depends(get_db)):
    """
    DELETE /safety-incidents/{incident_id}
    Delete safety incident by ID
    """
    incident = db.query(SafetyIncident).filter(SafetyIncident.incident_id == incident_id).first()
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Safety incident with ID {incident_id} not found"
        )
    
    try:
        db.delete(incident)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error deleting safety incident"
        )
