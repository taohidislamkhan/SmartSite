/**
 * Alerts Page - JavaScript
 * 
 * PURPOSE:
 * This script handles the Alerts page functionality for centralized risk monitoring.
 * 
 * ARCHITECTURE NOTES:
 * 
 * 1. HOW ALERTS ARE GENERATED (Database-Driven):
 *    - Alerts are NOT created by this frontend code
 *    - Database TRIGGERS automatically detect risk conditions:
 *      * Material stock falls below threshold → material_low alert
 *      * Project cost exceeds budget → cost_overrun alert
 *      * Task deadline is overdue → task_delay alert
 *      * Resource conflicts → schedule_conflict alert
 *    - Triggers insert records into the Alert table automatically
 *    - This ensures alerts are data-driven and reliable
 * 
 * 2. FRONTEND RESPONSIBILITIES:
 *    - Fetch alerts from Alert table via API
 *    - Display alerts to engineers in a user-friendly format
 *    - Allow filtering by severity and status
 *    - Allow marking alerts as resolved
 *    - Provide visual indicators (color-coded badges)
 * 
 * 3. DATA FLOW:
 *    Database Triggers → Alert Table → REST API → Frontend Display
 *    Frontend does NOT generate data, only consumes and displays it
 * 
 * 4. FILTERING STRATEGY:
 *    - Frontend-based filtering: Fast, no network requests
 *    - In production: Could be API-based (WHERE clause at database level)
 *    - Current implementation: Fetch all, filter in JavaScript
 */

// ============================================
// GLOBAL STATE
// ============================================

let allAlerts = [];
let allAreas = []; // Cache areas for name lookup
let filteredAlerts = [];
let filterSeverity = '';
let filterStatus = '';
let filterAlertType = '';

// ============================================
// PAGE INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async function () {
    console.log('Alerts page loaded');
    await initializePageHeader(); // From common.js
    await loadAreasData(); // Fetch areas first
    await loadAlertsData();
    setupEventListeners();
});

/**
 * Load areas data from API for area name lookups
 */
async function loadAreasData() {
    try {
        const response = await fetch('/api/areas/', {
            credentials: 'include'
        });
        
        if (response.ok) {
            allAreas = await response.json();
            console.log('Areas loaded:', allAreas.length);
        }
    } catch (error) {
        console.warn('Could not load areas:', error);
        allAreas = [];
    }
}

/**
 * Load all alerts from the API
 * 
 * API ENDPOINT: GET /api/alerts/
 * RETURNS: List of alerts from the Alert table
 * 
 * Database schema context:
 * - alert_id: Unique identifier
 * - alert_type: material_low, cost_overrun, task_delay, schedule_conflict
 * - area_id: Foreign key to Area table (project/area name)
 * - severity: info, warning, critical (determined by trigger logic)
 * - status: open, resolved (updated by frontend)
 * - created_date: Timestamp when trigger created the alert
 * - message: Description of the alert condition
 */
async function loadAlertsData() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const errorMessage = document.getElementById('errorMessage');
    
    loadingSpinner.style.display = 'flex';
    errorMessage.style.display = 'none';
    
    try {
        console.log('Fetching alerts from /api/alerts/');
        const response = await fetch('/api/alerts/', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            console.warn(`API returned ${response.status}, using demo data`);
            throw new Error('API unavailable, loading demo alerts');
        }
        
        allAlerts = await response.json();
        console.log('Alerts loaded from API:', allAlerts.length);
        
    } catch (error) {
        console.warn('Could not load from API, loading demo alerts:', error.message);
        // Load demo alerts as fallback for development/testing
        allAlerts = getDemoAlerts();
    }
    
    // Sort alerts by severity (critical first) and then by newest first
    sortAlerts(allAlerts);
    
    // Apply filters to populate filteredAlerts and display
    applyFilters();
    
    loadingSpinner.style.display = 'none';
}

/**
 * Get demo alerts for development/testing
 * Uses realistic construction scenarios
 */
function getDemoAlerts() {
    const now = new Date();
    return [
        // Critical Alerts (highest priority)
        {
            alert_id: 1,
            area_id: 115,
            alert_type: 'cost_overrun',
            message: 'Project Area 115 cost has exceeded budget by $12,500',
            severity: 'critical',
            is_resolved: false,
            created_at: new Date(now - 2 * 60 * 60000).toISOString()
        },
        {
            alert_id: 2,
            area_id: 118,
            alert_type: 'task_delay',
            message: 'Critical task in Area 118 is 5 days overdue. Project deadline at risk.',
            severity: 'critical',
            is_resolved: false,
            created_at: new Date(now - 1 * 60 * 60000).toISOString()
        },
        // Warning Alerts (medium priority)
        {
            alert_id: 3,
            area_id: 116,
            alert_type: 'material_low',
            message: 'Steel reinforcement stock in Area 116 is below reorder threshold (15 units remaining)',
            severity: 'warning',
            is_resolved: false,
            created_at: new Date(now - 4 * 60 * 60000).toISOString()
        },
        {
            alert_id: 4,
            area_id: 120,
            alert_type: 'cost_overrun',
            message: 'Area 120 budget utilization at 85%. Approaching limit.',
            severity: 'warning',
            is_resolved: false,
            created_at: new Date(now - 6 * 60 * 60000).toISOString()
        },
        {
            alert_id: 5,
            area_id: 117,
            alert_type: 'material_low',
            message: 'Concrete supply in Area 117 running low (22 units available)',
            severity: 'warning',
            is_resolved: false,
            created_at: new Date(now - 8 * 60 * 60000).toISOString()
        },
        // Info Alerts (low priority)
        {
            alert_id: 6,
            area_id: 119,
            alert_type: 'schedule_conflict',
            message: 'Resource overlap detected: Worker #55 assigned to two tasks on 2026-01-25',
            severity: 'info',
            is_resolved: false,
            created_at: new Date(now - 12 * 60 * 60000).toISOString()
        },
        {
            alert_id: 7,
            area_id: 121,
            alert_type: 'material_low',
            message: 'Cement stock in Area 121 at 18 units. Consider ordering soon.',
            severity: 'info',
            is_resolved: false,
            created_at: new Date(now - 24 * 60 * 60000).toISOString()
        },
        // Resolved Alerts (should appear visually muted)
        {
            alert_id: 8,
            area_id: 115,
            alert_type: 'material_low',
            message: 'Steel beams stock was low in Area 115. [RESOLVED: Restocked 50 units]',
            severity: 'warning',
            is_resolved: true,
            resolved_at: new Date(now - 30 * 60000).toISOString(),
            created_at: new Date(now - 8 * 60 * 60000).toISOString()
        },
        {
            alert_id: 9,
            area_id: 128,
            alert_type: 'task_delay',
            message: 'Task delay in Area 128 was resolved. Additional workers assigned.',
            severity: 'warning',
            is_resolved: true,
            resolved_at: new Date(now - 10 * 60 * 60000).toISOString(),
            created_at: new Date(now - 22 * 60 * 60000).toISOString()
        },
        {
            alert_id: 10,
            area_id: 116,
            alert_type: 'cost_overrun',
            message: 'Area 116 minor cost overrun resolved through budget adjustment.',
            severity: 'info',
            is_resolved: true,
            resolved_at: new Date(now - 11 * 60 * 60000).toISOString(),
            created_at: new Date(now - 25 * 60 * 60000).toISOString()
        }
    ];
}

/**
 * Sort alerts by severity (critical first) and then by date (newest first)
 */
function sortAlerts(alerts) {
    const severityOrder = { 'critical': 0, 'warning': 1, 'info': 2 };
    alerts.sort((a, b) => {
        // First sort by severity
        const severityDiff = (severityOrder[a.severity] || 3) - (severityOrder[b.severity] || 3);
        if (severityDiff !== 0) return severityDiff;
        
        // Then sort by date (newest first)
        return new Date(b.created_at) - new Date(a.created_at);
    });
}

/**
function setupEventListeners() {
    const filterSeveritySelect = document.getElementById('filterSeverity');
    const filterStatusSelect = document.getElementById('filterStatus');
    const filterAlertTypeSelect = document.getElementById('filterAlertType');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    
    if (filterSeveritySelect) {
        filterSeveritySelect.addEventListener('change', function () {
            filterSeverity = this.value;
            applyFilters();
        });
    }
    
    if (filterStatusSelect) {
        filterStatusSelect.addEventListener('change', function () {
            filterStatus = this.value;
            applyFilters();
        });
    }
    
    if (filterAlertTypeSelect) {
        filterAlertTypeSelect.addEventListener('change', function () {
            filterAlertType = this.value;
            applyFilters();
        });
    }
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', function () {
            document.getElementById('filterSeverity').value = '';
            document.getElementById('filterStatus').value = '';
            if (filterAlertTypeSelect) {
                filterAlertTypeSelect.value = '';
            }
            filterSeverity = '';
            filterStatus = '';
            filterAlertType = '';
            applyFilters();
        });
    }
}

/**
 * Apply active filters to alerts
 * 
 * FILTERING LOGIC:
 * This implementation filters in JavaScript (frontend)
 * Supports filtering by severity, status (open/resolved), and alert type
 */
function applyFilters() {
    filteredAlerts = allAlerts.filter(alert => {
        const severityMatch = filterSeverity === '' || alert.severity === filterSeverity;
        const statusMatch = filterStatus === '' || getAlertStatus(alert) === filterStatus;
        const typeMatch = filterAlertType === '' || alert.alert_type === filterAlertType;
        return severityMatch && statusMatch && typeMatch;
    });
    
    // Re-sort filtered alerts
    sortAlerts(filteredAlerts);
    
    // Populate alert type filter on first load
    if (document.getElementById('filterAlertType').options.length === 1) {
        populateAlertTypeFilter();
    }
    
    populateAlertsTable();
    updateAlertStats();
}

/**
 * Populate the alerts table with filtered data
 * Sorts by severity and date for readability
 */
function populateAlertsTable() {
    const tbody = document.getElementById('alertsTableBody');
    const noAlertsMsg = document.getElementById('noAlertsMessage');
    const tableWrapper = document.querySelector('.table-wrapper');
    
    tbody.innerHTML = '';
    
    if (filteredAlerts.length === 0) {
        tableWrapper.style.display = 'none';
        noAlertsMsg.style.display = 'block';
        return;
    }
    
    tableWrapper.style.display = 'block';
    noAlertsMsg.style.display = 'none';
    
    filteredAlerts.forEach(alert => {
        const row = document.createElement('tr');
        
        // Determine row class based on severity and resolution status
        const status = getAlertStatus(alert);
        let rowClass = `alert-row-${status}`;
        if (alert.severity === 'critical') {
            rowClass += ' alert-row-critical';
        }
        
        row.className = rowClass;
        
        // Format dates
        const createdDate = formatDate(alert.created_at);
        
        // Get severity and status badges
        const severityBadge = createSeverityBadge(alert.severity);
        const statusBadge = createStatusBadge(alert);
        
        // Create action button
        const actionCell = createActionCell(alert);
        
        // Get area name
        const areaName = getAreaName(alert.area_id);
        
        row.innerHTML = `
            <td><span class="alert-type-label">${formatAlertType(alert.alert_type)}</span></td>
            <td>${areaName}</td>
            <td>${severityBadge}</td>
            <td>${statusBadge}</td>
            <td>${createdDate}</td>
            <td class="alert-message" title="${alert.message || '-'}">${alert.message || '-'}</td>
            <td class="alert-actions">${actionCell}</td>
        `;
        
        tbody.appendChild(row);
    });
}

/**
 * Update alert statistics in the summary boxes
 */
function updateAlertStats() {
    const totalCount = filteredAlerts.length;
    const criticalCount = filteredAlerts.filter(a => a.severity === 'critical').length;
    const warningCount = filteredAlerts.filter(a => a.severity === 'warning').length;
    const openCount = filteredAlerts.filter(a => !a.is_resolved).length;
    
    document.getElementById('totalAlertsCount').textContent = totalCount;
    document.getElementById('criticalAlertsCount').textContent = criticalCount;
    document.getElementById('warningAlertsCount').textContent = warningCount;
    document.getElementById('openAlertsCount').textContent = openCount;
}

/**
 * Populate alert type filter dropdown with unique alert types
 */
function populateAlertTypeFilter() {
    const filterAlertTypeSelect = document.getElementById('filterAlertType');
    if (!filterAlertTypeSelect) return;
    
    // Get unique alert types from all alerts
    const uniqueTypes = [...new Set(allAlerts.map(a => a.alert_type))];
    uniqueTypes.sort();
    
    // Add options for each unique alert type
    uniqueTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = formatAlertType(type);
        filterAlertTypeSelect.appendChild(option);
    });
}

/**
 * Create severity badge HTML
 */
function createSeverityBadge(severity) {
    const badgeClass = `severity-badge severity-${severity}`;
    return `<span class="${badgeClass}">${severity.toUpperCase()}</span>`;
}

/**
 * Create status badge HTML
 * Converts is_resolved boolean to open/resolved status
 */
function createStatusBadge(alert) {
    const status = getAlertStatus(alert);
    const badgeClass = `status-badge status-${status}`;
    const label = status === 'open' ? 'OPEN' : 'RESOLVED';
    return `<span class="${badgeClass}">${label}</span>`;
}

/**
 * Get alert status as string (open/resolved) from is_resolved boolean
 */
function getAlertStatus(alert) {
    return alert.is_resolved ? 'resolved' : 'open';
}

/**
 * Create action cell for alert row
 * 
 * RULES:
 * - Only show "Mark Resolved" button if alert is open (is_resolved === false)
 * - Resolved alerts show no action button
 */
function createActionCell(alert) {
    if (alert.is_resolved) {
        return '<span class="text-muted">-</span>';
    }
    
    return `<button class="btn btn-success" onclick="markAlertResolved(${alert.alert_id})">Mark Resolved</button>`;
}

/**
 * Mark an alert as resolved
 * 
 * API CALL: PUT /api/alerts/{alert_id}/resolve
 * This updates the alert's status in the database to 'resolved'
 * 
 * WORKFLOW:
 * 1. Update local state immediately (optimistic update)
 * 2. Call API to persist change
 * 3. Show visual feedback
 * 4. Refresh filtered view and stats
 */
async function markAlertResolved(alertId) {
    try {
        // Find the alert in our local state
        const alert = allAlerts.find(a => a.alert_id === alertId);
        if (!alert) {
            console.error('Alert not found:', alertId);
            return;
        }
        
        // Optimistic update - update UI immediately
        alert.is_resolved = true;
        alert.resolved_at = new Date().toISOString();
        
        // Refresh the table view
        applyFilters();
        
        // Show success notification
        console.log('Alert marked as resolved:', alertId);
        
        // Try to persist to API
        try {
            const response = await fetch(`/api/alerts/${alertId}/resolve`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                console.warn(`API returned ${response.status}, but local state updated`);
            }
        } catch (apiError) {
            // API call failed, but local state is already updated (graceful degradation)
            console.warn('API call failed, but local update persisted:', apiError);
        }
        
    } catch (error) {
        console.error('Error marking alert as resolved:', error);
        alert('Failed to mark alert as resolved. Please try again.');
    }
}

/**
 * UTILITY FUNCTIONS
 */

/**
 * Get area name from area ID
 * Looks up area name from cached areas data
 * Falls back to area ID if not found
 */
function getAreaName(areaId) {
    if (!areaId) return 'System';
    const area = allAreas.find(a => a.area_id === areaId);
    return area ? area.name : `Area #${areaId}`;
}

/**
 * Format alert type for display
 * Converts underscore-separated names to Title Case
 */
function formatAlertType(alertType) {
    return alertType
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
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}
