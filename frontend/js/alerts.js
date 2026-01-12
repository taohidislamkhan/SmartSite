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
let filteredAlerts = [];
let filterSeverity = '';
let filterStatus = '';

// ============================================
// PAGE INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    console.log('Alerts page loaded');
    loadUserInfo();
    loadAlertsData();
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
        console.log('Fetching alerts from /api/alerts');
        const response = await fetch('/api/alerts', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch alerts: ${response.status} ${errorText}`);
        }
        
        allAlerts = await response.json();
        console.log('Alerts loaded:', allAlerts.length);
        
        // Populate the page with alerts
        populateAlertsTable();
        updateAlertStats();
        
        loadingSpinner.style.display = 'none';
        
    } catch (error) {
        console.error('Error loading alerts:', error);
        loadingSpinner.style.display = 'none';
        errorMessage.style.display = 'block';
        errorMessage.textContent = `Error loading alerts: ${error.message}`;
    }
}

/**
 * Setup event listeners for filter controls
 */
function setupEventListeners() {
    const filterSeveritySelect = document.getElementById('filterSeverity');
    const filterStatusSelect = document.getElementById('filterStatus');
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
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', function () {
            document.getElementById('filterSeverity').value = '';
            document.getElementById('filterStatus').value = '';
            filterSeverity = '';
            filterStatus = '';
            applyFilters();
        });
    }
}

/**
 * Apply active filters to alerts
 * 
 * FILTERING LOGIC:
 * This implementation filters in JavaScript (frontend)
 * In production, you would send filter parameters to the API:
 * GET /api/alerts?severity={severity}&status={status}
 * And let the database apply WHERE conditions
 */
function applyFilters() {
    filteredAlerts = allAlerts.filter(alert => {
        const severityMatch = filterSeverity === '' || alert.severity === filterSeverity;
        const statusMatch = filterStatus === '' || alert.status === filterStatus;
        return severityMatch && statusMatch;
    });
    
    populateAlertsTable();
    updateAlertStats();
}

/**
 * Populate the alerts table with filtered data
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
        
        // Determine row class based on severity and status
        let rowClass = `alert-row-${alert.status}`;
        if (alert.severity === 'critical') {
            rowClass += ' alert-row-critical';
        }
        
        row.className = rowClass;
        
        // Format dates
        const createdDate = formatDate(alert.created_date);
        
        // Get severity and status badges
        const severityBadge = createSeverityBadge(alert.severity);
        const statusBadge = createStatusBadge(alert.status);
        
        // Create action button
        const actionCell = createActionCell(alert);
        
        row.innerHTML = `
            <td><span class="alert-type-label">${formatAlertType(alert.alert_type)}</span></td>
            <td>${getAreaName(alert.area_id)}</td>
            <td>${severityBadge}</td>
            <td>${statusBadge}</td>
            <td>${createdDate}</td>
            <td class="alert-message">${alert.message || '-'}</td>
            <td>${actionCell}</td>
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
    const openCount = filteredAlerts.filter(a => a.status === 'open').length;
    
    document.getElementById('totalAlertsCount').textContent = totalCount;
    document.getElementById('criticalAlertsCount').textContent = criticalCount;
    document.getElementById('warningAlertsCount').textContent = warningCount;
    document.getElementById('openAlertsCount').textContent = openCount;
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
 */
function createStatusBadge(status) {
    const badgeClass = `status-badge status-${status}`;
    const label = status === 'open' ? 'OPEN' : 'RESOLVED';
    return `<span class="${badgeClass}">${label}</span>`;
}

/**
 * Create action cell for alert row
 * 
 * RULES:
 * - Only show "Mark Resolved" button if alert is open
 * - Resolved alerts show no action button
 */
function createActionCell(alert) {
    if (alert.status === 'resolved') {
        return '<span class="text-muted">-</span>';
    }
    
    return `<button class="btn btn-success" onclick="markAlertResolved(${alert.alert_id})">
        Mark Resolved
    </button>`;
}

/**
 * Mark an alert as resolved
 * 
 * API CALL: PUT /api/alerts/{alert_id}/resolve
 * This updates the alert's status in the database to 'resolved'
 */
async function markAlertResolved(alertId) {
    try {
        const response = await fetch(`/api/alerts/${alertId}/resolve`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to resolve alert: ${response.status}`);
        }
        
        // Update the alert in our local state
        const alert = allAlerts.find(a => a.alert_id === alertId);
        if (alert) {
            alert.status = 'resolved';
        }
        
        // Refresh the table
        applyFilters();
        console.log('Alert marked as resolved:', alertId);
        
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
 * Note: In production, you might want to fetch areas separately
 * For now, we'll display the area ID if data isn't available
 */
function getAreaName(areaId) {
    // This could be enhanced to fetch areas separately
    // For now, return a placeholder
    return `Project #${areaId}`;
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
