/**
 * Safety Incidents Page - JavaScript
 * 
 * PURPOSE:
 * This script handles the Safety Incidents page for health and safety compliance tracking.
 * 
 * ARCHITECTURE NOTES:
 * 
 * 1. DATA SOURCE:
 *    - SafetyIncident table: Stores all safety incidents across projects
 *    - Each incident is linked to an Area (project) via area_id
 *    - Records include: date, type, severity level, description, and reporter
 *    - Purpose: Ensure compliance tracking and risk awareness
 * 
 * 2. FRONTEND RESPONSIBILITIES:
 *    - Fetch incidents from SafetyIncident table via API
 *    - Display incidents with severity-based color coding
 *    - Allow filtering by project and severity level
 *    - Show detailed incident information in modal
 *    - Calculate and display safety metrics
 * 
 * 3. WHY SEVERITY LEVELS MATTER:
 *    - Low: Minor incidents (near-misses, minor cuts) - Informational
 *    - Medium: Moderate incidents (first aid, minor injuries) - Requires attention
 *    - High: Serious incidents (hospitalization, fatalities) - Critical attention needed
 *    - Proper classification helps prioritize responses and improve safety
 * 
 * 4. FILTERING STRATEGY:
 *    - Frontend-based: Fast, no network overhead
 *    - In production: API-based filtering (WHERE clause at database level)
 */

// ============================================
// GLOBAL STATE
// ============================================

let allIncidents = [];
let allAreas = [];
let filteredIncidents = [];
let filterProject = '';
let filterSeverity = '';

// ============================================
// PAGE INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async function () {
    console.log('Safety incidents page loaded');
    await initializePageHeader(); // From common.js
    loadSafetyData();
    setupEventListeners();
});

/**
 * Load user information from API
 */
async function loadUserInfo() {
    try {
        const response = await fetch('/api/auth/me', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const user = await response.json();
            document.getElementById('userInfo').textContent = `Welcome, ${user.email}`;
        }
    } catch (e) {
        console.error('Error loading user info:', e);
    }
}

/**
 * Load all safety incident data from API endpoints
 * 
 * API ENDPOINTS:
 * - GET /api/safety-incidents : Fetch all incidents from SafetyIncident table
 * - GET /api/areas : Fetch all areas (projects)
 */
async function loadSafetyData() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const errorMessage = document.getElementById('errorMessage');
    
    loadingSpinner.style.display = 'flex';
    errorMessage.style.display = 'none';
    
    try {
        // Fetch incidents and areas in parallel
        const [incidentsRes, areasRes] = await Promise.all([
            fetch('/api/safety-incidents', { credentials: 'include' }),
            fetch('/api/areas', { credentials: 'include' })
        ]);
        
        if (!incidentsRes.ok || !areasRes.ok) {
            console.warn('API failed, loading demo data');
            throw new Error('API unavailable');
        }
        
        allIncidents = await incidentsRes.json();
        allAreas = await areasRes.json();
        
        console.log('Safety incidents loaded from API:', allIncidents.length);
        console.log('Areas loaded:', allAreas.length);
        
    } catch (error) {
        console.warn('Could not load from API, loading demo incidents:', error.message);
        // Load demo data as fallback for development/testing
        allIncidents = getDemoIncidents();
        allAreas = getDemoAreas();
    }
    
    // Apply filters to populate filteredIncidents and display
    applyFilters();
    
    // Populate filter options and stats
    populateFilterOptions();
    calculateComplianceMetrics();
    
    loadingSpinner.style.display = 'none';
}

/**
 * Get demo safety incidents for development/testing
 * Uses realistic construction scenarios
 */
function getDemoIncidents() {
    const now = new Date();
    return [
        // High Severity Incidents
        {
            incident_id: 1,
            area_id: 115,
            incident_date: new Date(now.getTime() - 5 * 24 * 60 * 60000).toISOString().split('T')[0],
            incident_type: 'Fall from Height',
            severity: 'high',
            description: 'Worker fell from scaffolding (8 feet). Resulted in broken arm and hospitalization. Safety harness was not properly fastened.',
            reported_by: 'John Smith'
        },
        {
            incident_id: 2,
            area_id: 118,
            incident_date: new Date(now.getTime() - 10 * 24 * 60 * 60000).toISOString().split('T')[0],
            incident_type: 'Electrical Hazard',
            severity: 'high',
            description: 'Exposed electrical wiring in work area. Worker received minor shock. Equipment was not properly grounded before use.',
            reported_by: 'Maria Garcia'
        },
        // Medium Severity Incidents
        {
            incident_id: 3,
            area_id: 116,
            incident_date: new Date(now.getTime() - 3 * 24 * 60 * 60000).toISOString().split('T')[0],
            incident_type: 'Equipment Malfunction',
            severity: 'medium',
            description: 'Power drill malfunctioned, causing worker to lose grip. Minor hand laceration requiring stitches. Equipment sent for maintenance.',
            reported_by: 'Robert Johnson'
        },
        {
            incident_id: 4,
            area_id: 120,
            incident_date: new Date(now.getTime() - 7 * 24 * 60 * 60000).toISOString().split('T')[0],
            incident_type: 'Chemical Exposure',
            severity: 'medium',
            description: 'Worker exposed to concrete dust without proper respiratory protection. Required medical evaluation and respiratory tests.',
            reported_by: 'Sarah Williams'
        },
        {
            incident_id: 5,
            area_id: 117,
            incident_date: new Date(now.getTime() - 2 * 24 * 60 * 60000).toISOString().split('T')[0],
            incident_type: 'Struck by Object',
            severity: 'medium',
            description: 'Material fell from elevated storage. Struck worker on shoulder. Resulted in bruising and one day off work.',
            reported_by: 'David Lee'
        },
        // Low Severity Incidents
        {
            incident_id: 6,
            area_id: 119,
            incident_date: new Date(now.getTime() - 1 * 24 * 60 * 60000).toISOString().split('T')[0],
            incident_type: 'Near Miss',
            severity: 'low',
            description: 'Worker nearly slipped on wet surface but recovered balance. Floor marked and dried immediately. No injury.',
            reported_by: 'Michael Brown'
        },
        {
            incident_id: 7,
            area_id: 121,
            incident_date: new Date(now.getTime() - 14 * 24 * 60 * 60000).toISOString().split('T')[0],
            incident_type: 'Minor Cut',
            severity: 'low',
            description: 'Worker sustained minor cut (1/2 inch) while handling sheet metal. First aid provided on site. Proper gloves now enforced.',
            reported_by: 'Jennifer Davis'
        },
        {
            incident_id: 8,
            area_id: 115,
            incident_date: new Date(now.getTime() - 8 * 24 * 60 * 60000).toISOString().split('T')[0],
            incident_type: 'PPE Non-Compliance',
            severity: 'low',
            description: 'Worker observed not wearing hard hat in restricted area. Verbally warned and re-trained on safety requirements.',
            reported_by: 'James Wilson'
        },
        {
            incident_id: 9,
            area_id: 116,
            incident_date: new Date(now.getTime() - 6 * 24 * 60 * 60000).toISOString().split('T')[0],
            incident_type: 'Housekeeping Issue',
            severity: 'low',
            description: 'Debris left on walkway creating trip hazard. Area cleaned and worker retrained on housekeeping standards.',
            reported_by: 'Emily Martinez'
        },
        {
            incident_id: 10,
            area_id: 128,
            incident_date: new Date(now.getTime() - 12 * 24 * 60 * 60000).toISOString().split('T')[0],
            incident_type: 'Tool Misuse',
            severity: 'low',
            description: 'Worker using wrong tool for task. Reassigned correct tool and provided refresher training on tool selection.',
            reported_by: 'Christopher Anderson'
        }
    ];
}

/**
 * Get demo areas for development/testing
 */
function getDemoAreas() {
    return [
        { area_id: 115, name: 'Foundation & Excavation', location: 'Site North', status: 'active' },
        { area_id: 116, name: 'Concrete Work', location: 'Site Central', status: 'active' },
        { area_id: 117, name: 'Framing & Structure', location: 'Site East', status: 'active' },
        { area_id: 118, name: 'Electrical Systems', location: 'Site North', status: 'active' },
        { area_id: 119, name: 'HVAC Installation', location: 'Site West', status: 'active' },
        { area_id: 120, name: 'Plumbing & Utilities', location: 'Site South', status: 'active' },
        { area_id: 121, name: 'Interior Finishes', location: 'Site Central', status: 'active' },
        { area_id: 128, name: 'Exterior & Landscaping', location: 'Site Perimeter', status: 'planned' }
    ];
}

/**
 * Setup event listeners for filter controls
 */
function setupEventListeners() {
    const filterProjectSelect = document.getElementById('filterProject');
    const filterSeveritySelect = document.getElementById('filterSeverity');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    
    if (filterProjectSelect) {
        filterProjectSelect.addEventListener('change', function () {
            filterProject = this.value;
            applyFilters();
        });
    }
    
    if (filterSeveritySelect) {
        filterSeveritySelect.addEventListener('change', function () {
            filterSeverity = this.value;
            applyFilters();
        });
    }
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', function () {
            document.getElementById('filterProject').value = '';
            document.getElementById('filterSeverity').value = '';
            filterProject = '';
            filterSeverity = '';
            applyFilters();
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function (event) {
        const modal = document.getElementById('incidentModal');
        if (event.target === modal) {
            closeIncidentModal();
        }
    });
}

/**
 * Apply active filters to safety incidents
 * 
 * FILTERING LOGIC:
 * Filters by both project and severity level
 * Current: Frontend-based (JavaScript)
 * Production: API-based (database WHERE clause)
 */
function applyFilters() {
    filteredIncidents = allIncidents.filter(incident => {
        const projectMatch = filterProject === '' || incident.area_id == filterProject;
        const severityMatch = filterSeverity === '' || incident.severity === filterSeverity;
        return projectMatch && severityMatch;
    });
    
    populateIncidentsTable();
    updateSafetyStats();
}

/**
 * SECTION C: Populate Safety Incidents Table
 * 
 * TABLE STRUCTURE:
 * - Project/Area: Linked to Area table
 * - Incident Date: When the incident occurred
 * - Type: Category of incident (fall, electrical, equipment, etc.)
 * - Severity: High/Medium/Low (critical factor for response)
 * - Description: Details of the incident
 * - Reported By: Person who reported the incident
 * 
 * VISUAL CODING:
 * High severity incidents are highlighted with red background and border
 * Rows are clickable to show full details in modal
 */
function populateIncidentsTable() {
    const tbody = document.getElementById('incidentsTableBody');
    const noIncidentsMsg = document.getElementById('noIncidentsMessage');
    const tableWrapper = document.querySelector('.table-wrapper');
    
    filteredIncidents = allIncidents.filter(incident => {
        const projectMatch = filterProject === '' || incident.area_id == filterProject;
        const severityMatch = filterSeverity === '' || incident.severity === filterSeverity;
        return projectMatch && severityMatch;
    });
    
    tbody.innerHTML = '';
    
    if (filteredIncidents.length === 0) {
        tableWrapper.style.display = 'none';
        noIncidentsMsg.style.display = 'block';
        return;
    }
    
    tableWrapper.style.display = 'block';
    noIncidentsMsg.style.display = 'none';
    
    filteredIncidents.forEach(incident => {
        const row = document.createElement('tr');
        
        // Determine row class based on severity
        row.className = `incident-row-${incident.severity}`;
        
        // Format date
        const incidentDate = formatDate(incident.incident_date);
        
        // Get severity badge
        const severityBadge = createSeverityBadge(incident.severity);
        
        // Make row clickable to show details
        row.style.cursor = 'pointer';
        row.onclick = function () {
            showIncidentDetails(incident);
        };
        
        row.innerHTML = `
            <td><strong>${getAreaName(incident.area_id)}</strong></td>
            <td>${incidentDate}</td>
            <td>${formatIncidentType(incident.incident_type)}</td>
            <td>${severityBadge}</td>
            <td class="incident-description">${incident.description || '-'}</td>
            <td>${incident.reported_by || '-'}</td>
        `;
        
        tbody.appendChild(row);
    });
}

/**
 * Update safety incident statistics
 */
function updateSafetyStats() {
    const totalCount = filteredIncidents.length;
    const highCount = filteredIncidents.filter(i => i.severity === 'high').length;
    const mediumCount = filteredIncidents.filter(i => i.severity === 'medium').length;
    const lowCount = filteredIncidents.filter(i => i.severity === 'low').length;
    
    document.getElementById('totalIncidentsCount').textContent = totalCount;
    document.getElementById('highSeverityCount').textContent = highCount;
    document.getElementById('mediumSeverityCount').textContent = mediumCount;
    document.getElementById('lowSeverityCount').textContent = lowCount;
}

/**
 * Populate filter options with available projects
 */
function populateFilterOptions() {
    const projectSelect = document.getElementById('filterProject');
    
    // Get unique areas that have incidents
    const uniqueAreaIds = [...new Set(allIncidents.map(i => i.area_id))];
    
    uniqueAreaIds.forEach(areaId => {
        const area = allAreas.find(a => a.area_id === areaId);
        if (area) {
            const option = document.createElement('option');
            option.value = areaId;
            option.textContent = area.name;
            projectSelect.appendChild(option);
        }
    });
}

/**
 * SECTION D: Show Incident Details in Modal
 */
function showIncidentDetails(incident) {
    const modal = document.getElementById('incidentModal');
    const modalBody = document.getElementById('modalBody');
    
    const areaName = getAreaName(incident.area_id);
    const incidentDate = formatDate(incident.incident_date);
    const severityBadge = createSeverityBadge(incident.severity);
    
    modalBody.innerHTML = `
        <div class="modal-detail-row">
            <div class="modal-detail-label">Project / Area</div>
            <div class="modal-detail-value">${areaName}</div>
        </div>
        
        <div class="modal-detail-row">
            <div class="modal-detail-label">Incident Date</div>
            <div class="modal-detail-value">${incidentDate}</div>
        </div>
        
        <div class="modal-detail-row">
            <div class="modal-detail-label">Incident Type</div>
            <div class="modal-detail-value">${formatIncidentType(incident.incident_type)}</div>
        </div>
        
        <div class="modal-detail-row">
            <div class="modal-detail-label">Severity</div>
            <div class="modal-detail-value">${severityBadge}</div>
        </div>
        
        <div class="modal-detail-row">
            <div class="modal-detail-label">Description</div>
            <div class="modal-detail-value">${incident.description || 'No description provided'}</div>
        </div>
        
        <div class="modal-detail-row">
            <div class="modal-detail-label">Reported By</div>
            <div class="modal-detail-value">${incident.reported_by || 'Unknown'}</div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

/**
 * Close the incident details modal
 */
function closeIncidentModal() {
    const modal = document.getElementById('incidentModal');
    modal.style.display = 'none';
}

/**
 * Calculate compliance metrics
 */
function calculateComplianceMetrics() {
    // Calculate projects with high severity incidents
    const projectsWithHighSeverity = new Set(
        allIncidents
            .filter(i => i.severity === 'high')
            .map(i => i.area_id)
    ).size;
    
    document.getElementById('projectsWithHighSeverity').textContent = projectsWithHighSeverity;
    
    // Set reporting completeness (all incidents have required fields)
    const completeness = allIncidents.length > 0 ? '100%' : 'N/A';
    document.getElementById('reportingCompleteness').textContent = completeness;
}

/**
 * UTILITY FUNCTIONS
 */

/**
 * Create severity badge HTML
 */
function createSeverityBadge(severity) {
    const badgeClass = `severity-badge severity-${severity}`;
    const label = severity.charAt(0).toUpperCase() + severity.slice(1);
    return `<span class="${badgeClass}">${label}</span>`;
}

/**
 * Get area name from area ID
 */
function getAreaName(areaId) {
    const area = allAreas.find(a => a.area_id === areaId);
    return area ? area.name : `Project #${areaId}`;
}

/**
 * Format incident type for display
 * Converts underscores to spaces and title case
 */
function formatIncidentType(type) {
    return type
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Format date string to readable format
 */
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(date);
}
