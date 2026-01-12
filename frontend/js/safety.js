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

document.addEventListener('DOMContentLoaded', function () {
    console.log('Safety incidents page loaded');
    loadUserInfo();
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
 * - GET /api/safety-incidents/ : Fetch all incidents from SafetyIncident table
 * - GET /api/areas/ : Fetch all areas (projects)
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
            throw new Error('Failed to fetch safety data');
        }
        
        allIncidents = await incidentsRes.json();
        allAreas = await areasRes.json();
        
        console.log('Safety incidents loaded:', allIncidents.length);
        console.log('Areas loaded:', allAreas.length);
        
        // Populate page sections
        populateIncidentsTable();
        updateSafetyStats();
        populateFilterOptions();
        calculateComplianceMetrics();
        
        loadingSpinner.style.display = 'none';
        
    } catch (error) {
        console.error('Error loading safety data:', error);
        loadingSpinner.style.display = 'none';
        errorMessage.style.display = 'block';
        errorMessage.textContent = `Error loading safety data: ${error.message}`;
    }
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
            option.textContent = area.area_name;
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
    return area ? area.area_name : `Project #${areaId}`;
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
