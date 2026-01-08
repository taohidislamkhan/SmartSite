/**
 * Projects List Page JavaScript
 * 
 * Functionality:
 * - Load projects from /api/dashboard/engineer/{engineerId}/projects
 * - Filter projects by status and location
 * - Display in responsive table format
 * - Navigate to project details with area_id parameter
 * 
 * DBMS Concept:
 * A "Project" in the UI corresponds to an "Area" in the database.
 * Engineers are assigned to multiple Areas via Area.assigned_engineer_id.
 */

const API_BASE = '/api';
let allProjects = [];
let currentUser = null;

/**
 * Initialize the page
 */
async function initializePage() {
    console.log('=== Projects page initialization started ===');
    try {
        // Step 1: Get current user info (needed to fetch projects)
        console.log('Step 1: Loading current user...');
        await loadCurrentUser();
        
        if (!currentUser) {
            console.warn('No current user found, redirecting to login');
            window.location.href = '/login.html';
            return;
        }
        console.log('Step 1 Complete: Current user loaded', currentUser);

        // Step 2: Update user display
        console.log('Step 2: Updating user display...');
        updateUserDisplay();
        console.log('Step 2 Complete: User display updated');

        // Step 3: Load all projects
        console.log('Step 3: Loading projects...');
        await loadProjects();
        console.log(`Step 3 Complete: Loaded ${allProjects.length} projects`);

        // Step 4: Render projects in table
        console.log('Step 4: Rendering projects...');
        renderProjects(allProjects);
        console.log('Step 4 Complete: Projects rendered');

        // Step 5: Attach filter listeners
        console.log('Step 5: Setting up filters...');
        setupFilters();
        console.log('Step 5 Complete: Filters set up');
        
        console.log('=== Projects page initialization complete ===');

    } catch (error) {
        console.error('=== Error initializing page ===', error);
        console.error('Stack trace:', error.stack);
        showError('Failed to load page. Please refresh and try again.');
    }
}

/**
 * Load current user information from /api/auth/me
 */
async function loadCurrentUser() {
    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            currentUser = await response.json();
            console.log('Current user:', currentUser);
            return currentUser;
        } else {
            console.warn('Failed to get current user');
            return null;
        }
    } catch (error) {
        console.error('Error loading current user:', error);
        return null;
    }
}

/**
 * Update user display in header
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
 * Load all projects assigned to current engineer
 * Uses engineer_id from currentUser to fetch only their projects
 */
async function loadProjects() {
    try {
        // Use engineer_id if available (for engineers)
        let engineerId = currentUser.engineer_id || currentUser.user_id;
        console.log('Current user:', currentUser);
        console.log('Using engineer ID:', engineerId);
        
        const response = await fetch(
            `${API_BASE}/dashboard/engineer/${engineerId}/projects`,
            {
                method: 'GET',
                credentials: 'include'
            }
        );

        console.log('API response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API error response:', errorText);
            throw new Error(`Failed to load projects: ${response.statusText}`);
        }

        allProjects = await response.json();
        console.log(`Loaded ${allProjects.length} projects:`, allProjects);
        
    } catch (error) {
        console.error('Error loading projects:', error);
        allProjects = [];
        showError('Failed to load projects. Please check browser console for details.');
    }
}

/**
 * Render projects in the table
 * @param {Array} projects - Array of project objects to display
 */
function renderProjects(projects) {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const emptyState = document.getElementById('emptyState');
    const projectsTable = document.getElementById('projectsTable');
    const projectsTableBody = document.getElementById('projectsTableBody');

    // Hide loading spinner
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
    }

    // Check if we have projects
    if (!projects || projects.length === 0) {
        if (emptyState) {
            emptyState.style.display = 'block';
        }
        if (projectsTable) {
            projectsTable.style.display = 'none';
        }
        return;
    }

    // Show table, hide empty state
    if (emptyState) {
        emptyState.style.display = 'none';
    }
    if (projectsTable) {
        projectsTable.style.display = 'table';
    }

    // Clear existing rows
    projectsTableBody.innerHTML = '';

    // Render each project
    projects.forEach(project => {
        const row = createProjectRow(project);
        projectsTableBody.appendChild(row);
    });
}

/**
 * Create a table row for a project
 * @param {Object} project - Project object from API
 * @returns {HTMLElement} Table row element
 */
function createProjectRow(project) {
    const row = document.createElement('tr');

    // Calculate progress and budget status
    const progress = calculateProgress(project);
    const budgetStatus = calculateBudgetStatus(project);

    // Build row HTML
    row.innerHTML = `
        <td>
            <strong>${escapeHtml(project.name)}</strong>
        </td>
        <td>${escapeHtml(project.location || 'N/A')}</td>
        <td>${escapeHtml(project.area_type || 'N/A')}</td>
        <td>
            <span class="status-badge ${project.status}">
                ${project.status}
            </span>
        </td>
        <td>
            <div class="progress-container">
                <div class="progress-bar" style="width: ${progress}%">
                    ${progress}%
                </div>
            </div>
        </td>
        <td>
            <span class="budget-status ${budgetStatus.class}">
                ${budgetStatus.text}
            </span>
        </td>
        <td>
            <a href="/project_details.html?area_id=${project.area_id}" class="action-link">
                View Project →
            </a>
        </td>
    `;

    return row;
}

/**
 * Calculate project progress percentage
 * Progress = (completed_tasks / total_tasks) * 100
 * 
 * DBMS Concept:
 * Tasks are stored in Task table with status field (planned, in-progress, completed)
 * The API aggregates task counts in the project object
 * 
 * @param {Object} project - Project object with task_count and completed_tasks
 * @returns {number} Progress percentage (0-100)
 */
function calculateProgress(project) {
    if (!project.task_count || project.task_count === 0) {
        return 0;
    }

    const completed = project.completed_tasks || 0;
    const total = project.task_count;
    
    return Math.round((completed / total) * 100);
}

/**
 * Calculate budget status
 * Compares spent vs budget to determine if within budget or over
 * 
 * DBMS Concept:
 * Budget stored in Budget table with total_budget, allocated_budget, spent_budget fields
 * Costs are tracked in Cost table and aggregated in the project object
 * 
 * @param {Object} project - Project object with budget_total and cost_total
 * @returns {Object} Budget status with class and text
 */
function calculateBudgetStatus(project) {
    const budget = project.budget_total || 0;
    const spent = project.cost_total || 0;

    if (budget === 0) {
        return { class: 'unknown', text: 'No Budget' };
    }

    if (spent <= budget) {
        const remaining = budget - spent;
        return { 
            class: 'within', 
            text: `$${remaining.toFixed(0)} Remaining` 
        };
    } else {
        const overspent = spent - budget;
        return { 
            class: 'over', 
            text: `$${overspent.toFixed(0)} Over` 
        };
    }
}

/**
 * Setup filter event listeners
 */
function setupFilters() {
    const statusFilter = document.getElementById('statusFilter');
    const locationFilter = document.getElementById('locationFilter');
    const resetButton = document.getElementById('resetFilters');

    statusFilter.addEventListener('change', applyFilters);
    locationFilter.addEventListener('input', applyFilters);
    resetButton.addEventListener('click', resetFiltersForm);
}

/**
 * Apply active filters and re-render projects
 */
function applyFilters() {
    const statusFilter = document.getElementById('statusFilter').value;
    const locationFilter = document.getElementById('locationFilter').value.toLowerCase();

    // Filter projects based on selected criteria
    const filtered = allProjects.filter(project => {
        // Filter by status
        if (statusFilter && project.status !== statusFilter) {
            return false;
        }

        // Filter by location
        if (locationFilter && !project.location.toLowerCase().includes(locationFilter)) {
            return false;
        }

        return true;
    });

    // Re-render with filtered projects
    renderProjects(filtered);
}

/**
 * Reset all filters to default state
 */
function resetFiltersForm() {
    document.getElementById('statusFilter').value = '';
    document.getElementById('locationFilter').value = '';
    
    // Re-render all projects
    renderProjects(allProjects);
}

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Display error message to user
 * @param {string} message - Error message to display
 */
function showError(message) {
    const emptyState = document.getElementById('emptyState');
    if (emptyState) {
        emptyState.innerHTML = `<p style="color: #e74c3c;">${message}</p>`;
        emptyState.style.display = 'block';
    }
}

/**
 * Initialize page when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, calling initializePage()');
    initializePage();
});

/**
 * Global debug function - can be called from browser console
 */
window.debugProjects = function() {
    console.log('=== Projects Debug Information ===');
    console.log('Current User:', window.currentUser);
    console.log('All Projects:', window.allProjects);
    console.log('Projects count:', window.allProjects ? window.allProjects.length : 'N/A');
    
    // Check if engineer_id is set
    if (window.currentUser) {
        const engineerId = window.currentUser.engineer_id || window.currentUser.user_id;
        console.log('Engineer ID being used:', engineerId);
        console.log('API call would be:', `/api/dashboard/engineer/${engineerId}/projects`);
    }
};
