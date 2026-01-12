/**
 * Workers Management Page - JavaScript
 * 
 * DBMS Integration:
 * - Fetches workers from API: GET /api/workers
 * - Fetches areas from API: GET /api/areas
 * - Fetches tasks from API: GET /api/tasks
 * - Updates worker assignments via: POST/PUT /api/workers/{id}/task and /api/workers/{id}/area
 * 
 * Workflow:
 * 1. Load all workers, areas, and tasks on page load
 * 2. Display workers in table with filters
 * 3. Allow filtering by skill, project/area, and status
 * 4. Open modals for assign task and reassign project actions
 * 5. Send API requests to update worker data
 */

// Global data storage
let allWorkers = [];
let allAreas = [];
let allTasks = [];
let filteredWorkers = [];
let currentWorker = null; // Currently selected worker for actions

// ============================================
// PAGE INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    console.log('Workers page loaded');
    loadUserInfo();
    loadWorkerData();
    setupEventListeners();
});

/**
 * Load user information and display in navbar
 */
async function loadUserInfo() {
    const userInfoEl = document.getElementById('userInfo');
    
    try {
        const response = await fetch('/api/auth/me', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const user = await response.json();
            userInfoEl.textContent = `Welcome, ${user.email}`;
        } else {
            userInfoEl.textContent = 'User';
        }
    } catch (e) {
        console.error('Error loading user info:', e);
        userInfoEl.textContent = 'User';
    }
}

/**
 * Load all worker, area, and task data from API
 */
async function loadWorkerData() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const workersContent = document.getElementById('workersContent');
    
    try {
        // Fetch workers
        console.log('Fetching workers from /api/workers');
        const workersRes = await fetch('/api/workers', {
            credentials: 'include'
        });
        console.log('Workers response status:', workersRes.status);
        if (!workersRes.ok) {
            const errorText = await workersRes.text();
            throw new Error(`Failed to fetch workers: ${workersRes.status} ${errorText}`);
        }
        allWorkers = await workersRes.json();
        console.log('Workers loaded:', allWorkers.length);
        
        // Fetch areas
        console.log('Fetching areas from /api/areas');
        const areasRes = await fetch('/api/areas', {
            credentials: 'include'
        });
        console.log('Areas response status:', areasRes.status);
        if (!areasRes.ok) {
            const errorText = await areasRes.text();
            throw new Error(`Failed to fetch areas: ${areasRes.status} ${errorText}`);
        }
        allAreas = await areasRes.json();
        console.log('Areas loaded:', allAreas.length);
        
        // Fetch tasks
        console.log('Fetching tasks from /api/tasks');
        const tasksRes = await fetch('/api/tasks', {
            credentials: 'include'
        });
        console.log('Tasks response status:', tasksRes.status);
        if (!tasksRes.ok) {
            const errorText = await tasksRes.text();
            throw new Error(`Failed to fetch tasks: ${tasksRes.status} ${errorText}`);
        }
        allTasks = await tasksRes.json();
        console.log('Tasks loaded:', allTasks.length);
        
        // Initialize filtered workers
        filteredWorkers = [...allWorkers];
        
        // Populate filter dropdowns
        populateFilterDropdowns();
        
        // Render table
        renderWorkersTable();
        
        // Hide loading, show content
        loadingSpinner.style.display = 'none';
        workersContent.style.display = 'block';
        
    } catch (error) {
        console.error('Error loading worker data:', error);
        loadingSpinner.innerHTML = `<div style="color: #e74c3c; padding: 20px; text-align: center;">
            <p><strong>Error loading worker data:</strong></p>
            <p>${error.message}</p>
            <p>Please check the browser console for more details.</p>
            <button onclick="location.reload()" style="margin-top: 20px; padding: 8px 16px; background-color: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">Refresh Page</button>
        </div>`;
    }
}

/**
 * Setup event listeners for filters and actions
 */
function setupEventListeners() {
    // Search
    document.getElementById('searchWorker').addEventListener('input', filterWorkers);
    
    // Filters
    document.getElementById('filterSkill').addEventListener('change', filterWorkers);
    document.getElementById('filterProject').addEventListener('change', filterWorkers);
    document.getElementById('filterStatus').addEventListener('change', filterWorkers);
    
    // Reset filters
    document.getElementById('resetFilters').addEventListener('click', resetAllFilters);
    
    // Modal close on background click
    document.getElementById('assignTaskModal').addEventListener('click', function (e) {
        if (e.target === this) closeAssignTaskModal();
    });
    
    document.getElementById('reassignProjectModal').addEventListener('click', function (e) {
        if (e.target === this) closeReassignProjectModal();
    });
}

// ============================================
// POPULATE DROPDOWNS
// ============================================

/**
 * Populate filter dropdowns with dynamic data from API
 */
function populateFilterDropdowns() {
    const projectSelect = document.getElementById('filterProject');
    const newProjectSelect = document.getElementById('newProjectSelect');
    
    // Clear existing options (keep the first one)
    projectSelect.innerHTML = '<option value="">All Projects</option>';
    newProjectSelect.innerHTML = '<option value="">-- Select a Project --</option>';
    
    // Add area options
    allAreas.forEach(area => {
        const option = document.createElement('option');
        option.value = area.area_id;
        option.textContent = area.name;
        projectSelect.appendChild(option);
        
        const option2 = document.createElement('option');
        option2.value = area.area_id;
        option2.textContent = area.name;
        newProjectSelect.appendChild(option2);
    });
}

// ============================================
// FILTERING & SEARCH
// ============================================

/**
 * Filter workers based on current filter values
 */
function filterWorkers() {
    const searchTerm = document.getElementById('searchWorker').value.toLowerCase();
    const skillFilter = document.getElementById('filterSkill').value;
    const projectFilter = document.getElementById('filterProject').value;
    const statusFilter = document.getElementById('filterStatus').value;
    
    filteredWorkers = allWorkers.filter(worker => {
        // Search by name
        const nameMatch = worker.name.toLowerCase().includes(searchTerm);
        
        // Filter by skill
        const skillMatch = !skillFilter || worker.skill === skillFilter;
        
        // Filter by project/area
        const projectMatch = !projectFilter || (worker.current_area_id && worker.current_area_id === parseInt(projectFilter));
        
        // Filter by status (assigned/unassigned)
        let statusMatch = true;
        if (statusFilter === 'Assigned') {
            statusMatch = worker.current_area_id !== null && worker.current_area_id !== undefined;
        } else if (statusFilter === 'Unassigned') {
            statusMatch = !worker.current_area_id;
        }
        
        return nameMatch && skillMatch && projectMatch && statusMatch;
    });
    
    renderWorkersTable();
}

/**
 * Reset all filters to default state
 */
function resetAllFilters() {
    document.getElementById('searchWorker').value = '';
    document.getElementById('filterSkill').value = '';
    document.getElementById('filterProject').value = '';
    document.getElementById('filterStatus').value = '';
    
    filteredWorkers = [...allWorkers];
    renderWorkersTable();
}

// ============================================
// RENDER TABLE
// ============================================

/**
 * Render the workers table with filtered data
 */
function renderWorkersTable() {
    const tableBody = document.getElementById('workersTableBody');
    const noDataMsg = document.getElementById('noDataMessage');
    const workerCount = document.getElementById('workerCount');
    
    // Update worker count
    workerCount.textContent = `${filteredWorkers.length} workers`;
    
    // Clear table
    tableBody.innerHTML = '';
    
    // Show no data message if needed
    if (filteredWorkers.length === 0) {
        noDataMsg.style.display = 'block';
        return;
    } else {
        noDataMsg.style.display = 'none';
    }
    
    // Render rows
    filteredWorkers.forEach(worker => {
        const row = createWorkerRow(worker);
        tableBody.appendChild(row);
    });
}

/**
 * Create a table row for a worker
 * @param {Object} worker - Worker data object
 * @returns {HTMLElement} Table row element
 */
function createWorkerRow(worker) {
    const tr = document.createElement('tr');
    
    // Get area name
    const area = allAreas.find(a => a.area_id === worker.current_area_id);
    const areaName = area ? area.name : 'Unassigned';
    
    // Get task name
    const task = allTasks.find(t => t.task_id === worker.current_task_id);
    const taskName = task ? task.title : 'None';
    
    // Determine status
    const isAssigned = worker.current_area_id && worker.current_area_id !== null;
    const statusBadge = isAssigned 
        ? '<span class="status-badge status-assigned">Assigned</span>'
        : '<span class="status-badge status-unassigned">Unassigned</span>';
    
    // Format cost per day
    const costPerDay = worker.cost_per_day ? `$${parseFloat(worker.cost_per_day).toFixed(2)}` : 'N/A';
    
    tr.innerHTML = `
        <td><strong>${worker.name}</strong></td>
        <td>${worker.skill || 'N/A'}</td>
        <td>${areaName}</td>
        <td>${taskName}</td>
        <td>${costPerDay}</td>
        <td>${statusBadge}</td>
        <td>
            <div class="table-actions">
                <button class="action-btn action-btn-task" onclick="openAssignTaskModal(${worker.worker_id})">
                    Assign Task
                </button>
                <button class="action-btn action-btn-project" onclick="openReassignProjectModal(${worker.worker_id})">
                    Reassign Project
                </button>
            </div>
        </td>
    `;
    
    return tr;
}

// ============================================
// ASSIGN TASK MODAL
// ============================================

/**
 * Open the Assign Task modal for a specific worker
 * @param {number} workerId - ID of the worker
 */
function openAssignTaskModal(workerId) {
    currentWorker = allWorkers.find(w => w.worker_id === workerId);
    
    if (!currentWorker) {
        console.error('Worker not found:', workerId);
        return;
    }
    
    // Populate form fields
    document.getElementById('taskWorkerName').value = currentWorker.name;
    
    // Populate task select with available tasks
    const taskSelect = document.getElementById('taskSelect');
    taskSelect.innerHTML = '<option value="">-- Select a Task --</option>';
    
    allTasks.forEach(task => {
        const option = document.createElement('option');
        option.value = task.task_id;
        option.textContent = task.title;
        taskSelect.appendChild(option);
    });
    
    // Add change listener to update description
    taskSelect.addEventListener('change', function () {
        const selectedTaskId = this.value;
        if (selectedTaskId) {
            const selectedTask = allTasks.find(t => t.task_id === parseInt(selectedTaskId));
            document.getElementById('taskDescription').value = selectedTask?.description || '';
        } else {
            document.getElementById('taskDescription').value = '';
        }
    });
    
    // Show modal
    document.getElementById('assignTaskModal').classList.add('show');
}

/**
 * Close the Assign Task modal
 */
function closeAssignTaskModal() {
    document.getElementById('assignTaskModal').classList.remove('show');
    document.getElementById('assignTaskForm').reset();
    currentWorker = null;
}

/**
 * Save the task assignment for the current worker
 */
async function saveAssignTask() {
    if (!currentWorker) {
        alert('No worker selected');
        return;
    }
    
    const taskId = document.getElementById('taskSelect').value;
    
    if (!taskId) {
        alert('Please select a task');
        return;
    }
    
    try {
        const response = await fetch(`/api/workers/${currentWorker.worker_id}/task`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                task_id: parseInt(taskId)
            })
        });
        
        if (!response.ok) throw new Error('Failed to assign task');
        
        alert('Task assigned successfully!');
        closeAssignTaskModal();
        loadWorkerData(); // Reload data to reflect changes
        
    } catch (error) {
        console.error('Error assigning task:', error);
        alert('Failed to assign task. Please try again.');
    }
}

// ============================================
// REASSIGN PROJECT MODAL
// ============================================

/**
 * Open the Reassign Project modal for a specific worker
 * @param {number} workerId - ID of the worker
 */
function openReassignProjectModal(workerId) {
    currentWorker = allWorkers.find(w => w.worker_id === workerId);
    
    if (!currentWorker) {
        console.error('Worker not found:', workerId);
        return;
    }
    
    // Populate form fields
    document.getElementById('projectWorkerName').value = currentWorker.name;
    
    const currentArea = allAreas.find(a => a.area_id === currentWorker.current_area_id);
    document.getElementById('currentProject').value = currentArea ? currentArea.name : 'Unassigned';
    
    // Reset checkbox
    document.getElementById('retainTask').checked = false;
    
    // Show modal
    document.getElementById('reassignProjectModal').classList.add('show');
}

/**
 * Close the Reassign Project modal
 */
function closeReassignProjectModal() {
    document.getElementById('reassignProjectModal').classList.remove('show');
    document.getElementById('reassignProjectForm').reset();
    currentWorker = null;
}

/**
 * Save the project reassignment for the current worker
 */
async function saveReassignProject() {
    if (!currentWorker) {
        alert('No worker selected');
        return;
    }
    
    const newProjectId = document.getElementById('newProjectSelect').value;
    const retainTask = document.getElementById('retainTask').checked;
    
    if (!newProjectId) {
        alert('Please select a new project');
        return;
    }
    
    try {
        const requestBody = {
            area_id: parseInt(newProjectId),
            retain_task: retainTask
        };
        
        const response = await fetch(`/api/workers/${currentWorker.worker_id}/area`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) throw new Error('Failed to reassign project');
        
        alert('Project reassigned successfully!');
        closeReassignProjectModal();
        loadWorkerData(); // Reload data to reflect changes
        
    } catch (error) {
        console.error('Error reassigning project:', error);
        alert('Failed to reassign project. Please try again.');
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get worker name by ID
 * @param {number} workerId - ID of the worker
 * @returns {string} Worker name or 'Unknown'
 */
function getWorkerName(workerId) {
    const worker = allWorkers.find(w => w.worker_id === workerId);
    return worker ? worker.name : 'Unknown';
}

/**
 * Get area name by ID
 * @param {number} areaId - ID of the area
 * @returns {string} Area name or 'Unassigned'
 */
function getAreaName(areaId) {
    const area = allAreas.find(a => a.area_id === areaId);
    return area ? area.name : 'Unassigned';
}

/**
 * Get task name by ID
 * @param {number} taskId - ID of the task
 * @returns {string} Task name or 'None'
 */
function getTaskName(taskId) {
    const task = allTasks.find(t => t.task_id === taskId);
    return task ? task.title : 'None';
}
