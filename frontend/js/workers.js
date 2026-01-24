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

/**
 * Demo workers data - 15 sample workers for testing/documentation
 */
const DEMO_WORKERS = [
    { worker_id: 1, name: "Ahmed Hassan", skill: "Intermediate", cost_per_day: 150.00, contact: "555-1001", current_area_id: 1, status: "active" },
    { worker_id: 2, name: "Raj Patel", skill: "Advanced", cost_per_day: 200.00, contact: "555-1002", current_area_id: 2, status: "active" },
    { worker_id: 3, name: "Carlos Rodriguez", skill: "Beginner", cost_per_day: 100.00, contact: "555-1003", current_area_id: 3, status: "active" },
    { worker_id: 4, name: "James Wilson", skill: "Intermediate", cost_per_day: 150.00, contact: "555-1004", current_area_id: 1, status: "active" },
    { worker_id: 5, name: "Mohamed Ali", skill: "Advanced", cost_per_day: 200.00, contact: "555-1005", current_area_id: 2, status: "active" },
    { worker_id: 6, name: "Antonio Giallo", skill: "Intermediate", cost_per_day: 150.00, contact: "555-1006", current_area_id: 4, status: "active" },
    { worker_id: 7, name: "Zhang Wei", skill: "Beginner", cost_per_day: 100.00, contact: "555-1007", current_area_id: 5, status: "on-leave" },
    { worker_id: 8, name: "Yuki Tanaka", skill: "Advanced", cost_per_day: 200.00, contact: "555-1008", current_area_id: 6, status: "active" },
    { worker_id: 9, name: "Sofia Santos", skill: "Beginner", cost_per_day: 100.00, contact: "555-1009", current_area_id: 1, status: "active" },
    { worker_id: 10, name: "Peter Mueller", skill: "Intermediate", cost_per_day: 150.00, contact: "555-1010", current_area_id: 7, status: "active" },
    { worker_id: 11, name: "Anna Kowalski", skill: "Advanced", cost_per_day: 200.00, contact: "555-1011", current_area_id: 3, status: "active" },
    { worker_id: 12, name: "Marco Rossi", skill: "Intermediate", cost_per_day: 150.00, contact: "555-1012", current_area_id: 8, status: "active" },
    { worker_id: 13, name: "Olga Ivanova", skill: "Advanced", cost_per_day: 200.00, contact: "555-1013", current_area_id: 4, status: "active" },
    { worker_id: 14, name: "Nikos Papadopoulos", skill: "Beginner", cost_per_day: 100.00, contact: "555-1014", current_area_id: 2, status: "active" },
    { worker_id: 15, name: "Kenji Yamamoto", skill: "Intermediate", cost_per_day: 150.00, contact: "555-1015", current_area_id: 5, status: "active" }
];

// ============================================
// PAGE INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async function () {
    console.log('Workers page loaded');
    await initializePageHeader(); // From common.js
    loadWorkerData();
    setupEventListeners();
});

/**
 * Load user information - delegated to common.js via initializePageHeader()
 * (This function is deprecated - kept for reference)
 */
async function loadUserInfo() {
    // Now handled by initializePageHeader() in common.js
    return;
}

/**
 * Load all worker, area, and task data from API
 */
async function loadWorkerData() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const workersContent = document.getElementById('workersContent');
    
    try {
        let dataLoaded = false;
        
        // Try to fetch workers
        try {
            console.log('Fetching workers from /api/workers');
            const workersRes = await fetch('/api/workers', {
                credentials: 'include'
            });
            console.log('Workers response status:', workersRes.status);
            if (workersRes.ok) {
                allWorkers = await workersRes.json();
                console.log('Workers loaded:', allWorkers.length);
                dataLoaded = true;
            }
        } catch (e) {
            console.log('Workers API failed, will use demo data');
        }

        // Try to fetch areas
        try {
            console.log('Fetching areas from /api/areas');
            const areasRes = await fetch('/api/areas', {
                credentials: 'include'
            });
            console.log('Areas response status:', areasRes.status);
            if (areasRes.ok) {
                allAreas = await areasRes.json();
                console.log('Areas loaded:', allAreas.length);
                dataLoaded = true;
            }
        } catch (e) {
            console.log('Areas API failed');
        }

        // Try to fetch tasks
        try {
            console.log('Fetching tasks from /api/tasks');
            const tasksRes = await fetch('/api/tasks', {
                credentials: 'include'
            });
            console.log('Tasks response status:', tasksRes.status);
            if (tasksRes.ok) {
                allTasks = await tasksRes.json();
                console.log('Tasks loaded:', allTasks.length);
                dataLoaded = true;
            }
        } catch (e) {
            console.log('Tasks API failed');
        }

        // If API data failed, use demo data
        if (!dataLoaded || allWorkers.length === 0) {
            console.log('Using demo data for workers');
            allWorkers = DEMO_WORKERS;
        }
        
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
        // Use demo data as final fallback
        allWorkers = DEMO_WORKERS;
        filteredWorkers = [...allWorkers];
        populateFilterDropdowns();
        renderWorkersTable();
        loadingSpinner.style.display = 'none';
        workersContent.style.display = 'block';
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
