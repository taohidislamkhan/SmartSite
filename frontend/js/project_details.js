/**
 * Project Details Page JavaScript
 * 
 * DBMS Concept:
 * - "Project" in UI = "Area" in database
 * - area_id is passed via URL parameter: project_details.html?area_id=X
 * - Page fetches all related data in separate API calls:
 *   1. Area details (basic info)
 *   2. Tasks for this area
 *   3. Workers assigned to this area
 *   4. Materials for this area
 *   5. Equipment in this area
 *   6. Budget/Cost summary
 *   7. Alerts for this area
 *   8. Safety incidents for this area
 * 
 * Design:
 * - Tab-based section navigation for better UX
 * - Fetch data on demand as sections are viewed
 * - Cache data to avoid duplicate API calls
 */

// API_BASE is already defined in common.js
// currentUser is already defined in common.js, reuse it
let currentProjectId = null;
let projectData = null;
let allData = {
    tasks: [],
    workers: [],
    materials: [],
    equipment: [],
    alerts: [],
    incidents: [],
    budget: null
};

/**
 * Initialize page on load
 */
document.addEventListener('DOMContentLoaded', async function() {
    console.log('=== Project Details Page Initialization ===');
    
    try {
        // Step 0: Initialize page header (user info, logout) - from common.js
        await initializePageHeader();
        
        // Step 1: Get current user
        await loadCurrentUser();
        // updateUserDisplay(); - now handled by initializePageHeader()
        
        // Step 2: Get project ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        currentProjectId = parseInt(urlParams.get('area_id'));
        
        if (!currentProjectId) {
            showError('No project ID provided. Please select a project from the projects list.');
            return;
        }
        
        console.log('Loading project ID:', currentProjectId);
        
        // Step 3: Load project overview
        await loadProjectOverview();
        
        // Step 4: Show content and hide loading spinner
        document.getElementById('loadingSpinner').style.display = 'none';
        document.getElementById('projectContent').style.display = 'block';
        
        // Step 5: Setup tab navigation
        setupTabNavigation();
        
        // Step 6: Load initial section data
        await loadSectionData('overview');
        
        console.log('=== Initialization Complete ===');
    } catch (error) {
        console.error('Error initializing page:', error);
        showError('Failed to load project details. Please try again.');
    }
});

/**
 * Load current user info
 */
async function loadCurrentUser() {
    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            currentUser = await response.json();
            console.log('Current user:', currentUser);
        }
    } catch (error) {
        console.error('Error loading current user:', error);
    }
}

/**
 * Update user display in navbar
 */
function updateUserDisplay() {
    if (!currentUser) return;
    
    const userInfoElement = document.getElementById('userInfo');
    if (userInfoElement) {
        const name = currentUser.email.split('@')[0];
        userInfoElement.textContent = `Welcome, ${name.charAt(0).toUpperCase() + name.slice(1)}`;
    }
}

/**
 * Load project overview data
 * DBMS: Query Area table with assigned_engineer_id lookup
 */
async function loadProjectOverview() {
    try {
        const response = await fetch(
            `${API_BASE}/dashboard/engineer/${currentUser.engineer_id}/projects`,
            {
                credentials: 'include'
            }
        );
        
        if (response.ok) {
            const projects = await response.json();
            projectData = projects.find(p => p.area_id === currentProjectId);
            
            if (projectData) {
                renderProjectOverview();
            } else {
                showError('Project not found.');
            }
        }
    } catch (error) {
        console.error('Error loading project overview:', error);
    }
}

/**
 * Render project overview section
 */
function renderProjectOverview() {
    if (!projectData) return;
    
    // Set project name and status
    document.getElementById('projectName').textContent = projectData.name || 'Unknown Project';
    document.getElementById('projectLocation').textContent = projectData.location || '-';
    document.getElementById('areaType').textContent = projectData.area_type || 'General';
    document.getElementById('boundarySize').textContent = projectData.boundary_size ? 
        `${projectData.boundary_size} sq.m` : '-';
    document.getElementById('assignedEngineer').textContent = currentUser.email || '-';
    
    // Set status badge
    const statusBadge = document.getElementById('statusBadge');
    statusBadge.textContent = projectData.status || 'Active';
    statusBadge.className = `badge ${(projectData.status || 'active').toLowerCase()}`;
    
    // Calculate and render progress
    const totalTasks = projectData.task_count || 0;
    const completedTasks = projectData.completed_tasks || 0;
    const inProgressTasks = totalTasks - completedTasks;
    const pendingTasks = totalTasks - completedTasks;
    
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    document.getElementById('progressPercent').textContent = progress;
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('completedTasks').textContent = completedTasks;
    document.getElementById('inProgressTasks').textContent = inProgressTasks;
    document.getElementById('pendingTasks').textContent = pendingTasks;
    
    // Set timeline dates (placeholder - would come from database)
    document.getElementById('plannedStart').textContent = '2026-01-15';
    document.getElementById('plannedEnd').textContent = '2026-06-30';
    document.getElementById('daysRemaining').textContent = '172 days';
}

/**
 * Setup tab navigation
 */
function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.project-section');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const sectionId = this.getAttribute('data-section');
            
            // Update active button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update active section
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');
            
            // Load section data
            await loadSectionData(sectionId);
        });
    });
}

/**
 * Load data for specific section
 */
async function loadSectionData(sectionId) {
    switch(sectionId) {
        case 'tasks':
            if (allData.tasks.length === 0) {
                await loadTasks();
            }
            renderTasks();
            break;
        case 'workers':
            if (allData.workers.length === 0) {
                await loadWorkers();
            }
            renderWorkers();
            break;
        case 'materials':
            if (allData.materials.length === 0) {
                await loadMaterials();
            }
            renderMaterials();
            break;
        case 'equipment':
            if (allData.equipment.length === 0) {
                await loadEquipment();
            }
            renderEquipment();
            break;
        case 'budget':
            if (!allData.budget) {
                await loadBudget();
            }
            renderBudget();
            break;
        case 'alerts':
            if (allData.alerts.length === 0) {
                await loadAlerts();
            }
            renderAlerts();
            break;
        case 'incidents':
            if (allData.incidents.length === 0) {
                await loadIncidents();
            }
            renderIncidents();
            break;
    }
}

/**
 * Load tasks for this project
 * DBMS: Query Task table WHERE area_id = currentProjectId
 */
async function loadTasks() {
    try {
        const response = await fetch(`${API_BASE}/tasks/?area_id=${currentProjectId}`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to load tasks');
        }
        
        allData.tasks = await response.json();
        console.log(`Loaded ${allData.tasks.length} tasks for area ${currentProjectId}`);
    } catch (error) {
        console.error('Error loading tasks:', error);
        allData.tasks = [];
    }
}

/**
 * Render tasks in table
 */
function renderTasks() {
    const tbody = document.getElementById('tasksTableBody');
    const emptyState = document.getElementById('noTasksState');
    const container = document.getElementById('tasksContainer');
    
    if (allData.tasks.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    container.style.display = 'block';
    emptyState.style.display = 'none';
    tbody.innerHTML = '';
    
    allData.tasks.forEach(task => {
        const row = document.createElement('tr');
        const isDelayed = Math.random() > 0.8; // Placeholder
        
        row.innerHTML = `
            <td><strong>${escapeHtml(task.title)}</strong></td>
            <td>
                <span class="table-status ${task.status}">
                    ${task.status === 'completed' ? '✓' : task.status === 'in-progress' ? '⟳' : '○'} 
                    ${task.status}
                </span>
            </td>
            <td>${escapeHtml(task.worker || '-')}</td>
            <td>${task.planned_end || task.deadline || '-'}</td>
            <td>
                <div class="progress-bar" style="margin-bottom: 0;">
                    <div class="progress-fill" style="width: ${task.progress_percent || task.progress || 0}%"></div>
                </div>
                <small>${task.progress_percent || task.progress || 0}%</small>
            </td>
            <td>
                ${isDelayed ? '<span style="color: #e74c3c; font-weight: bold;">⚠ Delayed</span>' : '<span style="color: #27ae60;">On Track</span>'}
            </td>
            <td>
                <button class="btn btn-action btn-sm" onclick="editTask(${task.task_id})">Edit</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * Load workers assigned to this project
 * DBMS: Query Worker table WHERE current_area_id = currentProjectId
 */
async function loadWorkers() {
    try {
        // Fetch workers for current area from API
        const response = await fetch(`${API_BASE}/workers?area_id=${currentProjectId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        allData.workers = await response.json();
        
        // If no workers assigned, use fallback/demo data
        if (allData.workers.length === 0) {
            console.log('No workers assigned to this area, using demo data');
            allData.workers = getDemoWorkers();
        }
        
        // Enrich worker data with task names
        for (let worker of allData.workers) {
            if (worker.current_task_id) {
                // Try to get task name from allData.tasks if already loaded
                const task = allData.tasks.find(t => t.task_id === worker.current_task_id);
                worker.current_task = task ? task.task_name : `Task #${worker.current_task_id}`;
            } else {
                worker.current_task = '-';
            }
        }
        
        console.log(`Loaded ${allData.workers.length} workers for area ${currentProjectId}`);
    } catch (error) {
        console.error('Error loading workers:', error);
        console.log('Using demo workers as fallback');
        allData.workers = getDemoWorkers();
    }
}

/**
 * Get demo/fallback worker data for development/testing
 */
function getDemoWorkers() {
    return [
        { 
            worker_id: 1, 
            name: 'Rajesh Kumar', 
            skill: 'Excavation', 
            cost_per_day: 500, 
            contact: '+91 9876543210',
            current_task: 'Site Excavation',
            current_area_id: currentProjectId,
            current_task_id: null
        },
        { 
            worker_id: 2, 
            name: 'Amit Singh', 
            skill: 'Concrete Work', 
            cost_per_day: 600, 
            contact: '+91 9876543211',
            current_task: 'Foundation Pouring',
            current_area_id: currentProjectId,
            current_task_id: null
        },
        { 
            worker_id: 3, 
            name: 'Vikram Patel', 
            skill: 'Carpentry', 
            cost_per_day: 550, 
            contact: '+91 9876543212',
            current_task: 'Structural Framing',
            current_area_id: currentProjectId,
            current_task_id: null
        },
        { 
            worker_id: 4, 
            name: 'Priya Sharma', 
            skill: 'Steel Fixing', 
            cost_per_day: 650, 
            contact: '+91 9876543213',
            current_task: 'Reinforcement Work',
            current_area_id: currentProjectId,
            current_task_id: null
        }
    ];
}

/**
 * Render workers in grid
 */
function renderWorkers() {
    const grid = document.getElementById('workersGrid');
    const emptyState = document.getElementById('noWorkersState');
    const container = document.getElementById('workersContainer');
    
    if (allData.workers.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    container.style.display = 'block';
    emptyState.style.display = 'none';
    grid.innerHTML = '';
    
    allData.workers.forEach(worker => {
        const card = document.createElement('div');
        card.className = 'worker-card';
        card.innerHTML = `
            <div class="worker-name">${escapeHtml(worker.name)}</div>
            <div class="worker-info">
                <div class="worker-detail">
                    <label>Skill</label>
                    <span>${escapeHtml(worker.skill || '-')}</span>
                </div>
                <div class="worker-detail">
                    <label>Cost/Day</label>
                    <span>₹${worker.cost_per_day || '-'}</span>
                </div>
                <div class="worker-detail">
                    <label>Current Task</label>
                    <span>${escapeHtml(worker.current_task || '-')}</span>
                </div>
                <div class="worker-detail">
                    <label>Contact</label>
                    <span>${escapeHtml(worker.contact || '-')}</span>
                </div>
            </div>
            <div style="margin-top: 15px; display: flex; gap: 10px;">
                <button class="btn btn-action btn-sm" onclick="editWorker(${worker.worker_id})" style="flex: 1;">Edit</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

/**
 * Load materials for this project
 * DBMS: Query Material table with WHERE condition for this area
 */
async function loadMaterials() {
    try {
        // Placeholder - in production would call /api/project/{id}/materials
        allData.materials = [
            { material_id: 1, material_name: 'Cement (50kg)', quantity: 500, unit: 'bags', reorder_threshold: 100, status: 'normal' },
            { material_id: 2, material_name: 'Sand', quantity: 45, unit: 'tons', reorder_threshold: 50, status: 'low' },
            { material_id: 3, material_name: 'Steel Bars', quantity: 200, unit: 'kg', reorder_threshold: 150, status: 'normal' },
            { material_id: 4, material_name: 'Bricks', quantity: 5000, unit: 'units', reorder_threshold: 10000, status: 'normal' }
        ];
    } catch (error) {
        console.error('Error loading materials:', error);
        allData.materials = [];
    }
}

/**
 * Render materials in table
 */
function renderMaterials() {
    const tbody = document.getElementById('materialsTableBody');
    const emptyState = document.getElementById('noMaterialsState');
    const container = document.getElementById('materialsContainer');
    
    if (allData.materials.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    container.style.display = 'block';
    emptyState.style.display = 'none';
    tbody.innerHTML = '';
    
    allData.materials.forEach(material => {
        const row = document.createElement('tr');
        const isLow = material.quantity < material.reorder_threshold;
        
        row.innerHTML = `
            <td><strong>${escapeHtml(material.material_name)}</strong></td>
            <td>${material.quantity}</td>
            <td>${material.unit}</td>
            <td>${material.reorder_threshold}</td>
            <td>
                <span style="
                    ${isLow ? 'color: #e74c3c; font-weight: bold;' : 'color: #27ae60;'}
                ">
                    ${isLow ? '⚠ Low Stock' : '✓ Sufficient'}
                </span>
            </td>
            <td>
                <button class="btn btn-action btn-sm" onclick="editMaterial(${material.material_id})">Edit</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * Load equipment in this project
 * DBMS: Query Equipment table WHERE assigned_area_id = currentProjectId
 */
async function loadEquipment() {
    try {
        // Placeholder - in production would call /api/project/{id}/equipment
        allData.equipment = [
            { equipment_id: 31, equipment_name: 'Excavator CAT-320', status: 'available' },
            { equipment_id: 32, equipment_name: 'Bulldozer Komatsu D65', status: 'in-use' },
            { equipment_id: 33, equipment_name: 'Concrete Mixer', status: 'available' },
            { equipment_id: 34, equipment_name: 'Scaffolding Set (50m)', status: 'in-use' }
        ];
    } catch (error) {
        console.error('Error loading equipment:', error);
        allData.equipment = [];
    }
}

/**
 * Render equipment in grid
 */
function renderEquipment() {
    const grid = document.getElementById('equipmentGrid');
    const emptyState = document.getElementById('noEquipmentState');
    const container = document.getElementById('equipmentContainer');
    
    if (allData.equipment.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    container.style.display = 'block';
    emptyState.style.display = 'none';
    grid.innerHTML = '';
    
    allData.equipment.forEach(equipment => {
        const card = document.createElement('div');
        card.className = 'equipment-card';
        card.innerHTML = `
            <div class="equipment-name">${escapeHtml(equipment.equipment_name)}</div>
            <span class="equipment-status ${equipment.status}">
                ${equipment.status === 'available' ? '✓' : equipment.status === 'in-use' ? '⟳' : '⚠'} 
                ${equipment.status}
            </span>
            <div style="margin-top: 15px;">
                <button class="btn btn-action btn-sm" onclick="editEquipment(${equipment.equipment_id})" style="width: 100%;">Edit</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

/**
 * Load budget and cost data
 * DBMS: Query Budget and Cost tables, aggregate by area
 */
async function loadBudget() {
    try {
        // Use data from projectData if available
        const estimatedBudget = 500000; // Placeholder
        const totalCost = projectData.cost_total || 250000;
        const remainingBudget = estimatedBudget - totalCost;
        
        allData.budget = {
            estimated: estimatedBudget,
            spent: totalCost,
            remaining: remainingBudget
        };
    } catch (error) {
        console.error('Error loading budget:', error);
        allData.budget = null;
    }
}

/**
 * Render budget section
 */
function renderBudget() {
    if (!allData.budget) return;
    
    const budget = allData.budget;
    const percentage = Math.round((budget.spent / budget.estimated) * 100);
    const isOverBudget = budget.spent > budget.estimated;
    
    document.getElementById('estimatedBudget').textContent = `₹${formatNumber(budget.estimated)}`;
    document.getElementById('totalCostIncurred').textContent = `₹${formatNumber(budget.spent)}`;
    document.getElementById('remainingBudget').textContent = `₹${formatNumber(budget.remaining)}`;
    document.getElementById('budgetPercent').textContent = percentage;
    document.getElementById('budgetProgressFill').style.width = Math.min(percentage, 100) + '%';
    
    const remainingCard = document.getElementById('remainingBudgetCard');
    if (isOverBudget) {
        remainingCard.classList.add('over-budget');
        remainingCard.classList.remove('under-budget');
    } else {
        remainingCard.classList.add('under-budget');
        remainingCard.classList.remove('over-budget');
    }
    
    // Cost breakdown
    const breakdown = [
        { category: 'Labor', amount: budget.spent * 0.4 },
        { category: 'Materials', amount: budget.spent * 0.35 },
        { category: 'Equipment', amount: budget.spent * 0.15 },
        { category: 'Other', amount: budget.spent * 0.1 }
    ];
    
    const tbody = document.getElementById('costBreakdownBody');
    tbody.innerHTML = '';
    
    breakdown.forEach(item => {
        const row = document.createElement('tr');
        const itemPercentage = Math.round((item.amount / budget.spent) * 100);
        row.innerHTML = `
            <td><strong>${item.category}</strong></td>
            <td>₹${formatNumber(item.amount)}</td>
            <td>${itemPercentage}%</td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * Load alerts for this project
 * DBMS: Query Alert table WHERE area_id = currentProjectId
 */
async function loadAlerts() {
    try {
        // Placeholder - in production would call /api/project/{id}/alerts
        allData.alerts = [
            { alert_id: 1, type: 'Material', severity: 'warning', message: 'Sand stock below threshold', status: 'open', date: '2026-01-08' },
            { alert_id: 2, type: 'Task', severity: 'critical', message: 'Excavation task delayed by 3 days', status: 'open', date: '2026-01-07' },
            { alert_id: 3, type: 'Cost', severity: 'info', message: 'Labor cost approaching 40% of budget', status: 'open', date: '2026-01-06' }
        ];
    } catch (error) {
        console.error('Error loading alerts:', error);
        allData.alerts = [];
    }
}

/**
 * Render alerts
 */
function renderAlerts() {
    const alertsList = document.getElementById('alertsList');
    const emptyState = document.getElementById('noAlertsState');
    const container = document.getElementById('alertsContainer');
    
    if (allData.alerts.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    container.style.display = 'block';
    emptyState.style.display = 'none';
    alertsList.innerHTML = '';
    
    allData.alerts.forEach(alert => {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert-item ${alert.severity}`;
        alertDiv.innerHTML = `
            <div class="alert-header">
                <div class="alert-title">${escapeHtml(alert.message)}</div>
                <span class="alert-type">${alert.type}</span>
            </div>
            <div class="alert-footer">
                <span>${alert.date}</span>
                <span class="alert-status ${alert.status}">${alert.status}</span>
            </div>
        `;
        alertsList.appendChild(alertDiv);
    });
}

/**
 * Load safety incidents
 * DBMS: Query SafetyIncident table WHERE area_id = currentProjectId
 */
async function loadIncidents() {
    try {
        // Placeholder - in production would call /api/project/{id}/incidents
        allData.incidents = [
            { incident_id: 1, date: '2026-01-05', type: 'Minor Injury', severity: 'low', description: 'Worker minor cut during excavation', status: 'resolved' },
            { incident_id: 2, date: '2025-12-20', type: 'Near Miss', severity: 'low', description: 'Equipment narrowly avoided collision', status: 'resolved' }
        ];
    } catch (error) {
        console.error('Error loading incidents:', error);
        allData.incidents = [];
    }
}

/**
 * Render safety incidents
 */
function renderIncidents() {
    const tbody = document.getElementById('incidentsTableBody');
    const emptyState = document.getElementById('noIncidentsState');
    const container = document.getElementById('incidentsContainer');
    
    if (allData.incidents.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    container.style.display = 'block';
    emptyState.style.display = 'none';
    tbody.innerHTML = '';
    
    allData.incidents.forEach(incident => {
        const row = document.createElement('tr');
        const severityClass = incident.severity === 'high' ? 'critical' : 
                             incident.severity === 'medium' ? 'warning' : 'info';
        
        row.innerHTML = `
            <td>${incident.date}</td>
            <td>${escapeHtml(incident.type)}</td>
            <td>
                <span class="table-status ${severityClass}">
                    ${incident.severity}
                </span>
            </td>
            <td>${escapeHtml(incident.description)}</td>
            <td>
                <span class="table-status ${incident.status === 'resolved' ? 'completed' : 'pending'}">
                    ${incident.status}
                </span>
            </td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * Placeholder functions for actions
 */
function editTask(taskId) {
    alert('Edit task ' + taskId + ' - Form not implemented yet');
}

function editMaterial(materialId) {
    alert('Edit material ' + materialId + ' - Form not implemented yet');
}

function showTaskForm() {
    document.getElementById('addTaskForm').reset();
    openModal('addTaskModal');
}

function showAssignWorkerForm() {
    document.getElementById('assignWorkerForm').reset();
    openModal('assignWorkerModal');
}

function showMaterialForm() {
    document.getElementById('addMaterialForm').reset();
    openModal('addMaterialModal');
}

function showEquipmentForm() {
    document.getElementById('addEquipmentForm').reset();
    openModal('addEquipmentModal');
}

function showIncidentForm() {
    document.getElementById('reportIncidentForm').reset();
    openModal('reportIncidentModal');
}

/**
 * Utility: Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Utility: Format numbers with commas
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Show error message
 */
function showError(message) {
    document.getElementById('loadingSpinner').innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <p style="color: #e74c3c; font-size: 16px; font-weight: bold;">${escapeHtml(message)}</p>
            <a href="/projects.html" class="btn btn-primary" style="margin-top: 20px;">Back to Projects</a>
        </div>
    `;
    document.getElementById('loadingSpinner').style.display = 'block';
}
/* =============================================
   MODAL MANAGEMENT FUNCTIONS
   ============================================= */

/**
 * Open a modal dialog
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('show');
    }
}

/**
 * Close a modal dialog
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
        // Clear form
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
            // Hide error messages
            const errorDiv = modal.querySelector('.form-error');
            if (errorDiv) {
                errorDiv.style.display = 'none';
                errorDiv.textContent = '';
            }
        }
    }
}

/**
 * Show error in a modal form
 */
function showFormError(modalId, message) {
    const modal = document.getElementById(modalId);
    if (modal) {
        const errorDiv = modal.querySelector('.form-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    }
}

/**
 * Show success notification
 */
function showSuccess(message) {
    // Create a temporary toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #27ae60;
        color: white;
        padding: 15px 20px;
        border-radius: 4px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 2000;
        animation: slideInRight 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

/* =============================================
   EDIT PROJECT (AREA) FUNCTIONS
   ============================================= */

/**
 * Edit project - open modal with current data
 */
function editProject() {
    if (!projectData) return;
    
    // Populate form with current data
    document.getElementById('projectNameInput').value = projectData.name || '';
    document.getElementById('projectLocationInput').value = projectData.location || '';
    document.getElementById('projectTypeInput').value = projectData.area_type || '';
    document.getElementById('projectBoundaryInput').value = projectData.boundary_size || '';
    document.getElementById('projectStatusInput').value = projectData.status || 'active';
    
    // Store ID for submission
    document.getElementById('editProjectForm').dataset.id = currentProjectId;
    
    openModal('editProjectModal');
}

/**
 * Handle project edit form submission
 */
async function handleEditProject(event) {
    event.preventDefault();
    
    const areaId = parseInt(document.getElementById('editProjectForm').dataset.id);
    
    const updateData = {
        name: document.getElementById('projectNameInput').value.trim(),
        location: document.getElementById('projectLocationInput').value.trim(),
        area_type: document.getElementById('projectTypeInput').value.trim(),
        boundary_size: parseFloat(document.getElementById('projectBoundaryInput').value) || null,
        status: document.getElementById('projectStatusInput').value
    };
    
    // Validation
    if (!updateData.name) {
        showFormError('editProjectModal', 'Project name is required');
        return;
    }
    if (!updateData.location) {
        showFormError('editProjectModal', 'Location is required');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/areas/${areaId}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to update project');
        }
        
        // Update local data
        projectData = await response.json();
        
        // Refresh display
        renderProjectOverview();
        
        // Close modal
        closeModal('editProjectModal');
        
        showSuccess('Project updated successfully!');
    } catch (error) {
        console.error('Error updating project:', error);
        showFormError('editProjectModal', error.message);
    }
}

/**
 * Delete project - with confirmation
 */
async function deleteProject() {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/areas/${currentProjectId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to delete project');
        }
        
        showSuccess('Project deleted successfully!');
        
        // Redirect to projects list after 1 second
        setTimeout(() => {
            window.location.href = '/projects.html';
        }, 1000);
    } catch (error) {
        console.error('Error deleting project:', error);
        showFormError('editProjectModal', error.message);
    }
}

/* =============================================
   EDIT TASK FUNCTIONS
   ============================================= */

let currentEditingTaskId = null;

/**
 * Edit task - open modal with current data
 */
function editTask(taskId) {
    const task = allData.tasks.find(t => t.task_id === taskId);
    if (!task) return;
    
    currentEditingTaskId = taskId;
    
    // Populate form
    document.getElementById('taskTitleInput').value = task.title || '';
    document.getElementById('taskStatusInput').value = task.status || 'pending';
    // Support both "deadline" (placeholder) and "planned_end" (backend) field names
    document.getElementById('taskDeadlineInput').value = task.planned_end || task.deadline || '';
    
    openModal('editTaskModal');
}

/**
 * Handle task edit form submission
 */
async function handleEditTask(event) {
    event.preventDefault();
    
    if (!currentEditingTaskId) return;
    
    const updateData = {
        title: document.getElementById('taskTitleInput').value.trim(),
        status: document.getElementById('taskStatusInput').value,
        planned_end: document.getElementById('taskDeadlineInput').value
    };
    
    // Validation
    if (!updateData.title) {
        showFormError('editTaskModal', 'Task title is required');
        return;
    }
    if (!updateData.planned_end) {
        showFormError('editTaskModal', 'Deadline is required');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/tasks/${currentEditingTaskId}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to update task');
        }
        
        // Update local data
        const updatedTask = await response.json();
        const taskIndex = allData.tasks.findIndex(t => t.task_id === currentEditingTaskId);
        if (taskIndex !== -1) {
            allData.tasks[taskIndex] = updatedTask;
        }
        
        // Refresh display
        renderTasks();
        
        closeModal('editTaskModal');
        showSuccess('Task updated successfully!');
        currentEditingTaskId = null;
    } catch (error) {
        console.error('Error updating task:', error);
        showFormError('editTaskModal', error.message);
    }
}

/**
 * Delete task
 */
async function deleteTask() {
    if (!currentEditingTaskId) return;
    
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/tasks/${currentEditingTaskId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to delete task');
        }
        
        // Remove from local data
        allData.tasks = allData.tasks.filter(t => t.task_id !== currentEditingTaskId);
        
        // Refresh display
        renderTasks();
        
        closeModal('editTaskModal');
        showSuccess('Task deleted successfully!');
        currentEditingTaskId = null;
    } catch (error) {
        console.error('Error deleting task:', error);
        showFormError('editTaskModal', error.message);
    }
}

/* =============================================
   EDIT WORKER FUNCTIONS
   ============================================= */

let currentEditingWorkerId = null;

/**
 * Edit worker - open modal with current data
 */
function editWorker(workerId) {
    const worker = allData.workers.find(w => w.worker_id === workerId);
    if (!worker) return;
    
    currentEditingWorkerId = workerId;
    
    // Populate form
    document.getElementById('workerNameInput').value = worker.name || '';
    document.getElementById('workerSkillInput').value = worker.skill || '';
    document.getElementById('workerCostInput').value = worker.cost_per_day || '';
    
    openModal('editWorkerModal');
}

/**
 * Handle worker edit form submission
 */
async function handleEditWorker(event) {
    event.preventDefault();
    
    if (!currentEditingWorkerId) return;
    
    const updateData = {
        name: document.getElementById('workerNameInput').value.trim(),
        skill: document.getElementById('workerSkillInput').value.trim(),
        cost_per_day: parseFloat(document.getElementById('workerCostInput').value)
    };
    
    // Validation
    if (!updateData.name) {
        showFormError('editWorkerModal', 'Worker name is required');
        return;
    }
    if (!updateData.skill) {
        showFormError('editWorkerModal', 'Skill is required');
        return;
    }
    if (isNaN(updateData.cost_per_day) || updateData.cost_per_day < 0) {
        showFormError('editWorkerModal', 'Cost per day must be a valid number');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/workers/${currentEditingWorkerId}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to update worker');
        }
        
        // Update local data
        const updatedWorker = await response.json();
        const workerIndex = allData.workers.findIndex(w => w.worker_id === currentEditingWorkerId);
        if (workerIndex !== -1) {
            allData.workers[workerIndex] = updatedWorker;
        }
        
        // Refresh display
        renderWorkersSection();
        
        closeModal('editWorkerModal');
        showSuccess('Worker updated successfully!');
        currentEditingWorkerId = null;
    } catch (error) {
        console.error('Error updating worker:', error);
        showFormError('editWorkerModal', error.message);
    }
}

/**
 * Delete worker
 */
async function deleteWorker() {
    if (!currentEditingWorkerId) return;
    
    if (!confirm('Are you sure you want to delete this worker?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/workers/${currentEditingWorkerId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to delete worker');
        }
        
        // Remove from local data
        allData.workers = allData.workers.filter(w => w.worker_id !== currentEditingWorkerId);
        
        // Refresh display
        renderWorkers();
        
        closeModal('editWorkerModal');
        showSuccess('Worker deleted successfully!');
        currentEditingWorkerId = null;
    } catch (error) {
        console.error('Error deleting worker:', error);
        showFormError('editWorkerModal', error.message);
    }
}

/* =============================================
   EDIT MATERIAL FUNCTIONS
   ============================================= */

let currentEditingMaterialId = null;

/**
 * Edit material - open modal with current data
 */
function editMaterial(materialId) {
    const material = allData.materials.find(m => m.material_id === materialId);
    if (!material) return;
    
    currentEditingMaterialId = materialId;
    
    // Populate form - support both placeholder and backend field names
    document.getElementById('materialNameInput').value = material.name || material.material_name || '';
    document.getElementById('materialQuantityInput').value = material.quantity || '';
    document.getElementById('materialUnitInput').value = material.unit || '';
    document.getElementById('materialThresholdInput').value = material.reorder_threshold || '';
    
    openModal('editMaterialModal');
}

/**
 * Handle material edit form submission
 */
async function handleEditMaterial(event) {
    event.preventDefault();
    
    if (!currentEditingMaterialId) return;
    
    const updateData = {
        name: document.getElementById('materialNameInput').value.trim(),
        quantity: parseFloat(document.getElementById('materialQuantityInput').value),
        unit: document.getElementById('materialUnitInput').value.trim(),
        reorder_threshold: parseFloat(document.getElementById('materialThresholdInput').value)
    };
    
    // Validation
    if (!updateData.name) {
        showFormError('editMaterialModal', 'Material name is required');
        return;
    }
    if (isNaN(updateData.quantity) || updateData.quantity < 0) {
        showFormError('editMaterialModal', 'Quantity must be a valid number');
        return;
    }
    if (!updateData.unit) {
        showFormError('editMaterialModal', 'Unit is required');
        return;
    }
    if (isNaN(updateData.reorder_threshold) || updateData.reorder_threshold < 0) {
        showFormError('editMaterialModal', 'Reorder threshold must be a valid number');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/materials/${currentEditingMaterialId}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to update material');
        }
        
        // Update local data
        const updatedMaterial = await response.json();
        const materialIndex = allData.materials.findIndex(m => m.material_id === currentEditingMaterialId);
        if (materialIndex !== -1) {
            allData.materials[materialIndex] = updatedMaterial;
        }
        
        // Refresh display
        renderMaterials();
        
        closeModal('editMaterialModal');
        showSuccess('Material updated successfully!');
        currentEditingMaterialId = null;
    } catch (error) {
        console.error('Error updating material:', error);
        showFormError('editMaterialModal', error.message);
    }
}

/**
 * Delete material
 */
async function deleteMaterial() {
    if (!currentEditingMaterialId) return;
    
    if (!confirm('Are you sure you want to delete this material?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/materials/${currentEditingMaterialId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to delete material');
        }
        
        // Remove from local data
        allData.materials = allData.materials.filter(m => m.material_id !== currentEditingMaterialId);
        
        // Refresh display
        renderMaterials();
        
        closeModal('editMaterialModal');
        showSuccess('Material deleted successfully!');
        currentEditingMaterialId = null;
    } catch (error) {
        console.error('Error deleting material:', error);
        showFormError('editMaterialModal', error.message);
    }
}

/* =============================================
   EDIT EQUIPMENT FUNCTIONS
   ============================================= */

let currentEditingEquipmentId = null;

/**
 * Edit equipment - open modal with current data
 */
function editEquipment(equipmentId) {
    const equipment = allData.equipment.find(e => e.equipment_id === equipmentId);
    if (!equipment) return;
    
    currentEditingEquipmentId = equipmentId;
    
    // Populate form - support both placeholder and backend field names
    document.getElementById('equipmentNameInput').value = equipment.name || equipment.equipment_name || '';
    document.getElementById('equipmentStatusInput').value = equipment.status || 'available';
    
    openModal('editEquipmentModal');
}

/**
 * Handle equipment edit form submission
 */
async function handleEditEquipment(event) {
    event.preventDefault();
    
    if (!currentEditingEquipmentId) return;
    
    const updateData = {
        name: document.getElementById('equipmentNameInput').value.trim(),
        status: document.getElementById('equipmentStatusInput').value
    };
    
    // Validation
    if (!updateData.name) {
        showFormError('editEquipmentModal', 'Equipment name is required');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/equipment/${currentEditingEquipmentId}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to update equipment');
        }
        
        // Update local data
        const updatedEquipment = await response.json();
        const equipmentIndex = allData.equipment.findIndex(e => e.equipment_id === currentEditingEquipmentId);
        if (equipmentIndex !== -1) {
            allData.equipment[equipmentIndex] = updatedEquipment;
        }
        
        // Refresh display
        renderEquipment();
        
        closeModal('editEquipmentModal');
        showSuccess('Equipment updated successfully!');
        currentEditingEquipmentId = null;
    } catch (error) {
        console.error('Error updating equipment:', error);
        showFormError('editEquipmentModal', error.message);
    }
}

/**
 * Delete equipment
 */
async function deleteEquipment() {
    if (!currentEditingEquipmentId) return;
    
    if (!confirm('Are you sure you want to delete this equipment?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/equipment/${currentEditingEquipmentId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to delete equipment');
        }
        
        // Remove from local data
        allData.equipment = allData.equipment.filter(e => e.equipment_id !== currentEditingEquipmentId);
        
        // Refresh display
        renderEquipment();
        
        closeModal('editEquipmentModal');
        showSuccess('Equipment deleted successfully!');
        currentEditingEquipmentId = null;
    } catch (error) {
        console.error('Error deleting equipment:', error);
        showFormError('editEquipmentModal', error.message);
    }
}

/* =============================================
   CREATE/ADD FUNCTIONS FOR NEW RECORDS
   ============================================= */

/**
 * Handle Add Task form submission
 */
async function handleAddTask(event) {
    event.preventDefault();
    
    const taskData = {
        title: document.getElementById('addTaskTitleInput').value.trim(),
        description: document.getElementById('addTaskDescriptionInput').value.trim(),
        status: document.getElementById('addTaskStatusInput').value,
        planned_end: document.getElementById('addTaskDeadlineInput').value,
        area_id: currentProjectId
    };
    
    if (!taskData.title) {
        showFormError('addTaskModal', 'Task title is required');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/tasks/`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to create task');
        }
        
        const newTask = await response.json();
        
        // Add to local data
        allData.tasks.push(newTask);
        
        // Refresh display
        renderTasks();
        
        closeModal('addTaskModal');
        showSuccess('Task created successfully!');
    } catch (error) {
        console.error('Error creating task:', error);
        showFormError('addTaskModal', error.message);
    }
}

/**
 * Handle Assign Worker form submission
 */
async function handleAssignWorker(event) {
    event.preventDefault();
    
    const workerData = {
        name: document.getElementById('assignWorkerNameInput').value.trim(),
        skill: document.getElementById('assignWorkerSkillInput').value.trim(),
        cost_per_day: parseFloat(document.getElementById('assignWorkerCostInput').value),
        current_area_id: currentProjectId
    };
    
    if (!workerData.name || !workerData.skill) {
        showFormError('assignWorkerModal', 'Worker name and skill are required');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/workers/`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(workerData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to assign worker');
        }
        
        const newWorker = await response.json();
        
        // Add to local data
        allData.workers.push(newWorker);
        
        // Refresh display
        renderWorkers();
        
        closeModal('assignWorkerModal');
        showSuccess('Worker assigned successfully!');
    } catch (error) {
        console.error('Error assigning worker:', error);
        showFormError('assignWorkerModal', error.message);
    }
}

/**
 * Handle Add Material form submission
 */
async function handleAddMaterial(event) {
    event.preventDefault();
    
    const materialData = {
        name: document.getElementById('addMaterialNameInput').value.trim(),
        quantity: parseFloat(document.getElementById('addMaterialQuantityInput').value),
        unit: document.getElementById('addMaterialUnitInput').value.trim(),
        reorder_threshold: parseFloat(document.getElementById('addMaterialThresholdInput').value),
        unit_cost: parseFloat(document.getElementById('addMaterialCostInput').value) || 0,
        area_id: currentProjectId
    };
    
    if (!materialData.name || !materialData.unit) {
        showFormError('addMaterialModal', 'Material name and unit are required');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/materials/`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(materialData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to add material');
        }
        
        const newMaterial = await response.json();
        
        // Add to local data
        allData.materials.push(newMaterial);
        
        // Refresh display
        renderMaterials();
        
        closeModal('addMaterialModal');
        showSuccess('Material added successfully!');
    } catch (error) {
        console.error('Error adding material:', error);
        showFormError('addMaterialModal', error.message);
    }
}

/**
 * Handle Add Equipment form submission
 */
async function handleAddEquipment(event) {
    event.preventDefault();
    
    const equipmentData = {
        name: document.getElementById('addEquipmentNameInput').value.trim(),
        serial_no: document.getElementById('addEquipmentSerialInput').value.trim(),
        status: document.getElementById('addEquipmentStatusInput').value,
        current_area_id: currentProjectId
    };
    
    if (!equipmentData.name) {
        showFormError('addEquipmentModal', 'Equipment name is required');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/equipment/`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(equipmentData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to add equipment');
        }
        
        const newEquipment = await response.json();
        
        // Add to local data
        allData.equipment.push(newEquipment);
        
        // Refresh display
        renderEquipment();
        
        closeModal('addEquipmentModal');
        showSuccess('Equipment added successfully!');
    } catch (error) {
        console.error('Error adding equipment:', error);
        showFormError('addEquipmentModal', error.message);
    }
}

/**
 * Handle Report Incident form submission
 */
async function handleReportIncident(event) {
    event.preventDefault();
    
    const incidentData = {
        incident_type: document.getElementById('incidentTypeInput').value.trim(),
        description: document.getElementById('incidentDescriptionInput').value.trim(),
        severity: document.getElementById('incidentSeverityInput').value,
        incident_date: document.getElementById('incidentDateInput').value,
        area_id: currentProjectId
    };
    
    if (!incidentData.incident_type || !incidentData.description) {
        showFormError('reportIncidentModal', 'Incident type and description are required');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/safety-incidents/`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(incidentData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to report incident');
        }
        
        const newIncident = await response.json();
        
        // Add to local data
        allData.incidents.push(newIncident);
        
        // Refresh display
        renderIncidents();
        
        closeModal('reportIncidentModal');
        showSuccess('Incident reported successfully!');
    } catch (error) {
        console.error('Error reporting incident:', error);
        showFormError('reportIncidentModal', error.message);
    }
}