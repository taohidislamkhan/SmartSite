/**
 * Schedules Page JavaScript
 * 
 * PURPOSE:
 * Load and display task schedule data, manage filters, and show schedule alerts.
 * Enables engineers to monitor planned vs actual task timelines.
 * 
 * DATA FLOW:
 * 1. Load current user (from common.js)
 * 2. Fetch schedule data from /api/dashboard/engineer/{engineer_id}/schedules
 * 3. Fetch schedule alerts from /api/alerts?type=schedule
 * 4. Apply client-side filters
 * 5. Render schedule table with visual indicators
 * 6. Update KPI cards
 */

// API_BASE is already defined in common.js
let allSchedules = [];
let allAlerts = [];

/**
 * Initialize schedules page on load
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('=== Schedules Page Loaded ===');
    
    try {
        // Initialize page header (user info, logout)
        await initializePageHeader();
        
        // Load schedule data
        console.log('Loading schedule data...');
        await loadScheduleData();
        
        // Load alerts
        console.log('Loading schedule alerts...');
        await loadScheduleAlerts();
        
        // Set up filter listeners
        setupFilterListeners();
        
        // Initial render
        applyFiltersAndRender();
        
        console.log('=== Schedules Page Initialization Complete ===');
    } catch (error) {
        console.error('Error initializing schedules page:', error);
        showEmptyState('Error loading schedules. Please refresh the page.');
    }
});

/**
 * Load schedule data from API
 * 
 * DBMS CONCEPT:
 * Data structure represents Task-Schedule relationship:
 * - task_id: Unique task identifier
 * - task_name: Description of task
 * - area_id: Project/Area where task is assigned
 * - area_name: Project/Area name
 * - worker_name: Engineer/Worker assigned
 * - planned_start_date: Scheduled start date
 * - planned_end_date: Scheduled completion date
 * - actual_start_date: When task actually started (NULL if not started)
 * - actual_end_date: When task actually ended (NULL if not completed)
 * - status: Task status (planned, in-progress, completed, on-hold)
 * - delay_days: Calculated delay (0 if on-time)
 */
async function loadScheduleData() {
    try {
        // Using sample data for now (API endpoint can be added later)
        // TODO: Replace with actual API call: /api/dashboard/engineer/{engineer_id}/schedules
        
        const sampleSchedules = [
            {
                task_id: 1,
                task_name: 'Site Preparation',
                area_id: 1,
                area_name: 'Foundation',
                worker_name: 'John Smith',
                planned_start_date: '2026-01-15',
                planned_end_date: '2026-01-25',
                actual_start_date: '2026-01-16',
                actual_end_date: '2026-01-28',
                status: 'completed',
                delay_days: 3
            },
            {
                task_id: 2,
                task_name: 'Concrete Pouring',
                area_id: 1,
                area_name: 'Foundation',
                worker_name: 'Maria Garcia',
                planned_start_date: '2026-01-26',
                planned_end_date: '2026-02-05',
                actual_start_date: '2026-01-28',
                actual_end_date: null,
                status: 'in-progress',
                delay_days: 5
            },
            {
                task_id: 3,
                task_name: 'Frame Assembly',
                area_id: 2,
                area_name: 'Main Structure',
                worker_name: 'James Wilson',
                planned_start_date: '2026-02-06',
                planned_end_date: '2026-02-20',
                actual_start_date: null,
                actual_end_date: null,
                status: 'planned',
                delay_days: 0
            },
            {
                task_id: 4,
                task_name: 'Electrical Wiring',
                area_id: 3,
                area_name: 'Electrical',
                worker_name: 'David Lee',
                planned_start_date: '2026-01-20',
                planned_end_date: '2026-02-10',
                actual_start_date: '2026-01-22',
                actual_end_date: null,
                status: 'in-progress',
                delay_days: 0
            },
            {
                task_id: 5,
                task_name: 'Plumbing Installation',
                area_id: 4,
                area_name: 'Plumbing',
                worker_name: 'Robert Brown',
                planned_start_date: '2026-02-01',
                planned_end_date: '2026-02-25',
                actual_start_date: null,
                actual_end_date: null,
                status: 'planned',
                delay_days: 0
            },
            {
                task_id: 6,
                task_name: 'Wall Installation',
                area_id: 2,
                area_name: 'Main Structure',
                worker_name: 'James Wilson',
                planned_start_date: '2026-02-15',
                planned_end_date: '2026-03-10',
                actual_start_date: '2026-02-18',
                actual_end_date: null,
                status: 'in-progress',
                delay_days: 3
            }
        ];
        
        allSchedules = sampleSchedules;
        console.log('Loaded schedules:', allSchedules.length);
        
    } catch (error) {
        console.error('Error loading schedule data:', error);
        throw error;
    }
}

/**
 * Load schedule-related alerts
 * 
 * ALERT TYPES (from database triggers):
 * - 'schedule_delay': Task has exceeded planned end date
 * - 'schedule_overdue': Task in-progress and past planned end date
 * - 'schedule_upcoming': Task starting soon
 */
async function loadScheduleAlerts() {
    try {
        // Sample alerts (replace with API call later)
        const sampleAlerts = [
            {
                alert_id: 101,
                type: 'schedule_delay',
                severity: 'error',
                title: 'Concrete Pouring - Task Delayed',
                message: 'Task "Concrete Pouring" in Foundation area is 5 days behind schedule',
                related_task_id: 2,
                created_at: '2026-02-01'
            },
            {
                alert_id: 102,
                type: 'schedule_overdue',
                severity: 'warning',
                title: 'Wall Installation - At Risk',
                message: 'Task "Wall Installation" is progressing behind schedule (3 days delayed)',
                related_task_id: 6,
                created_at: '2026-02-02'
            }
        ];
        
        allAlerts = sampleAlerts;
        console.log('Loaded alerts:', allAlerts.length);
        renderAlerts();
        
    } catch (error) {
        console.error('Error loading alerts:', error);
    }
}

/**
 * Calculate schedule status and delay information
 * 
 * LOGIC:
 * - On-time: actual_end_date <= planned_end_date OR task not yet completed
 * - At-risk: in-progress AND current_date > planned_end_date AND actual_end_date IS NULL
 * - Delayed: actual_end_date > planned_end_date
 */
function getScheduleStatus(schedule) {
    const today = new Date();
    
    // If task not started yet
    if (!schedule.actual_start_date) {
        return {
            indicator: 'on-time',
            displayText: 'On Schedule',
            color: 'green'
        };
    }
    
    // If task completed with delay
    if (schedule.actual_end_date && schedule.delay_days > 0) {
        return {
            indicator: 'delayed',
            displayText: `${schedule.delay_days} days late`,
            color: 'red'
        };
    }
    
    // If task in progress and past deadline
    if (schedule.status === 'in-progress' && !schedule.actual_end_date) {
        const plannedEnd = new Date(schedule.planned_end_date);
        if (today > plannedEnd && schedule.delay_days > 0) {
            return {
                indicator: 'at-risk',
                displayText: `${schedule.delay_days} days behind`,
                color: 'orange'
            };
        }
    }
    
    // Default: on time
    return {
        indicator: 'on-time',
        displayText: 'On Schedule',
        color: 'green'
    };
}

/**
 * Update KPI cards with schedule metrics
 */
function updateKPICards() {
    const filtered = getFilteredSchedules();
    
    const totalScheduled = filtered.length;
    const inProgress = filtered.filter(s => s.status === 'in-progress').length;
    const completed = filtered.filter(s => s.status === 'completed').length;
    const delayed = filtered.filter(s => s.delay_days > 0).length;
    
    document.getElementById('totalScheduledTasks').textContent = totalScheduled;
    document.getElementById('tasksInProgress').textContent = inProgress;
    document.getElementById('completedTasks').textContent = completed;
    document.getElementById('delayedTasks').textContent = delayed;
    
    console.log('KPI Update:', { totalScheduled, inProgress, completed, delayed });
}

/**
 * Get filtered schedules based on current filter values
 */
function getFilteredSchedules() {
    const projectFilter = document.getElementById('projectFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const startDateFilter = document.getElementById('startDateFilter').value;
    const endDateFilter = document.getElementById('endDateFilter').value;
    const delayedOnlyToggle = document.getElementById('delayedOnlyToggle').checked;
    
    return allSchedules.filter(schedule => {
        // Filter by project
        if (projectFilter && schedule.area_id !== parseInt(projectFilter)) {
            return false;
        }
        
        // Filter by status
        if (statusFilter && schedule.status !== statusFilter) {
            return false;
        }
        
        // Filter by date range (planned start)
        if (startDateFilter) {
            const filterDate = new Date(startDateFilter);
            const scheduleDate = new Date(schedule.planned_start_date);
            if (scheduleDate < filterDate) {
                return false;
            }
        }
        
        // Filter by end date range (planned end)
        if (endDateFilter) {
            const filterDate = new Date(endDateFilter);
            const scheduleDate = new Date(schedule.planned_end_date);
            if (scheduleDate > filterDate) {
                return false;
            }
        }
        
        // Filter by delayed only
        if (delayedOnlyToggle && schedule.delay_days === 0) {
            return false;
        }
        
        return true;
    });
}

/**
 * Apply filters and render the schedule table
 */
function applyFiltersAndRender() {
    const filtered = getFilteredSchedules();
    
    console.log('Applying filters. Showing', filtered.length, 'of', allSchedules.length, 'schedules');
    
    updateKPICards();
    
    if (filtered.length === 0) {
        showEmptyState('No schedules match current filters');
        return;
    }
    
    renderScheduleTable(filtered);
}

/**
 * Render schedule table with filtered data
 */
function renderScheduleTable(schedules) {
    const tableBody = document.getElementById('scheduleTableBody');
    const table = document.getElementById('scheduleTable');
    const spinner = document.getElementById('loadingSpinner');
    const emptyState = document.getElementById('emptyState');
    
    // Clear previous rows
    tableBody.innerHTML = '';
    
    // Hide loading and empty states
    spinner.style.display = 'none';
    emptyState.style.display = 'none';
    table.style.display = 'table';
    
    // Render each schedule row
    schedules.forEach(schedule => {
        const row = createScheduleRow(schedule);
        tableBody.appendChild(row);
    });
}

/**
 * Create a schedule table row element
 */
function createScheduleRow(schedule) {
    const row = document.createElement('tr');
    const status = getScheduleStatus(schedule);
    
    // Add row class for color coding
    row.className = `row-${status.indicator}`;
    
    // Format dates for display
    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
    };
    
    row.innerHTML = `
        <td>${escapeHtml(schedule.area_name)}</td>
        <td><strong>${escapeHtml(schedule.task_name)}</strong></td>
        <td>${escapeHtml(schedule.worker_name)}</td>
        <td class="date-cell">${formatDate(schedule.planned_start_date)}</td>
        <td class="date-cell">${formatDate(schedule.planned_end_date)}</td>
        <td class="date-cell ${!schedule.actual_start_date ? 'missing' : ''}">${formatDate(schedule.actual_start_date)}</td>
        <td class="date-cell ${!schedule.actual_end_date ? 'missing' : ''}">${formatDate(schedule.actual_end_date)}</td>
        <td>
            <span class="status-badge ${schedule.status}">
                ${schedule.status.replace('-', ' ')}
            </span>
        </td>
        <td>
            <span class="delay-value ${schedule.delay_days > 0 ? 'delayed' : ''}">
                ${schedule.delay_days > 0 ? '+' : ''}${schedule.delay_days}
            </span>
        </td>
        <td>
            <span class="delay-indicator ${status.indicator}">
                ${status.displayText}
            </span>
        </td>
        <td>
            <button class="action-button btn-edit" onclick="editSchedule(${schedule.task_id})">
                Edit
            </button>
        </td>
    `;
    
    return row;
}

/**
 * Render alerts list
 */
function renderAlerts() {
    const alertsList = document.getElementById('alertsList');
    
    if (allAlerts.length === 0) {
        alertsList.innerHTML = '<div class="empty-alerts">✅ No active schedule alerts</div>';
        return;
    }
    
    alertsList.innerHTML = allAlerts.map(alert => {
        const iconMap = {
            'schedule_delay': '⏱️',
            'schedule_overdue': '⚠️',
            'schedule_upcoming': '📢'
        };
        
        return `
            <div class="alert-item ${alert.severity}">
                <div class="alert-icon">${iconMap[alert.type] || '📌'}</div>
                <div class="alert-content">
                    <div class="alert-title">${escapeHtml(alert.title)}</div>
                    <p class="alert-message">${escapeHtml(alert.message)}</p>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Show empty state message
 */
function showEmptyState(message) {
    const table = document.getElementById('scheduleTable');
    const spinner = document.getElementById('loadingSpinner');
    const emptyState = document.getElementById('emptyState');
    
    table.style.display = 'none';
    spinner.style.display = 'none';
    emptyState.style.display = 'block';
    emptyState.querySelector('h3').textContent = message;
}

/**
 * Set up filter event listeners
 */
function setupFilterListeners() {
    const filters = [
        'projectFilter',
        'statusFilter',
        'startDateFilter',
        'endDateFilter',
        'delayedOnlyToggle'
    ];
    
    filters.forEach(filterId => {
        const element = document.getElementById(filterId);
        if (element) {
            element.addEventListener('change', applyFiltersAndRender);
        }
    });
    
    // Reset filters button
    const resetBtn = document.getElementById('resetFilters');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
    }
    
    // Populate project filter
    populateProjectFilter();
}

/**
 * Populate project dropdown with unique areas
 */
function populateProjectFilter() {
    const projectFilter = document.getElementById('projectFilter');
    const uniqueAreas = [...new Set(allSchedules.map(s => s.area_id))];
    
    const areaMap = {};
    allSchedules.forEach(s => {
        if (!areaMap[s.area_id]) {
            areaMap[s.area_id] = s.area_name;
        }
    });
    
    uniqueAreas.forEach(areaId => {
        const option = document.createElement('option');
        option.value = areaId;
        option.textContent = areaMap[areaId];
        projectFilter.appendChild(option);
    });
}

/**
 * Reset all filters to default values
 */
function resetFilters() {
    document.getElementById('projectFilter').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('startDateFilter').value = '';
    document.getElementById('endDateFilter').value = '';
    document.getElementById('delayedOnlyToggle').checked = false;
    
    applyFiltersAndRender();
}

/**
 * Edit schedule handler (placeholder)
 */
function editSchedule(taskId) {
    console.log('Edit schedule for task:', taskId);
    alert('Edit functionality to be implemented. Task ID: ' + taskId);
    // TODO: Implement edit modal or redirect to edit page
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
