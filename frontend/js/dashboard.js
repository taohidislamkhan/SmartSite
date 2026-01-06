/**
 * Engineer Dashboard JavaScript
 * Handles project loading, KPI updates, and user interactions
 * 
 * Features:
 * - Fetch current user information
 * - Load all assigned projects
 * - Display project cards with real-time data
 * - Handle navigation to project details
 */

const API_BASE = '/api';
let currentUser = null;
let allProjects = [];

/**
 * Initialize dashboard on page load
 * - Verify user is authenticated
 * - Load user info
 * - Load projects
 * - Update KPI cards
 */
async function initializeDashboard() {
    try {
        // Step 1: Get current user
        await loadCurrentUser();
        
        if (!currentUser) {
            // Not authenticated, redirect to login
            window.location.href = '/login.html';
            return;
        }

        // Verify engineer role
        if (currentUser.role !== 'engineer') {
            alert('Access denied. Engineer role required.');
            window.location.href = '/login.html';
            return;
        }

        // Step 2: Update header with engineer name
        updateHeader();

        // Step 3: Load projects
        await loadProjects();

        // Step 4: Update KPI cards
        updateKPICards();

        // Step 5: Render project cards
        renderProjectCards();

    } catch (error) {
        console.error('Dashboard initialization error:', error);
        alert('Error loading dashboard. Please refresh the page.');
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

        if (!response.ok) {
            console.log('User not authenticated');
            return null;
        }

        currentUser = await response.json();
        return currentUser;
    } catch (error) {
        console.error('Error loading current user:', error);
        return null;
    }
}

/**
 * Update header with engineer name
 */
function updateHeader() {
    if (!currentUser) return;
    
    const nameElement = document.getElementById('engineerName');
    if (nameElement) {
        // Extract name from email (everything before @)
        const name = currentUser.email.split('@')[0];
        nameElement.textContent = name.charAt(0).toUpperCase() + name.slice(1);
    }
}

/**
 * Load all projects assigned to current engineer
 */
async function loadProjects() {
    try {
        const response = await fetch(
            `${API_BASE}/dashboard/engineer/${currentUser.user_id}/projects`,
            {
                method: 'GET',
                credentials: 'include'
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to load projects: ${response.statusText}`);
        }

        allProjects = await response.json();
        console.log(`Loaded ${allProjects.length} projects`);
        
    } catch (error) {
        console.error('Error loading projects:', error);
        allProjects = [];
    }
}

/**
 * Update KPI cards with calculated values
 */
function updateKPICards() {
    // Total Projects
    const totalProjectsEl = document.getElementById('totalProjects');
    if (totalProjectsEl) {
        totalProjectsEl.textContent = allProjects.length;
    }

    // Active Projects (status = 'active')
    const activeProjectsEl = document.getElementById('activeProjects');
    if (activeProjectsEl) {
        const activeCount = allProjects.filter(p => p.status === 'active').length;
        activeProjectsEl.textContent = activeCount;
    }

    // Delayed Tasks (calculate from all tasks with progress < expected)
    const delayedTasksEl = document.getElementById('delayedTasks');
    if (delayedTasksEl) {
        // Placeholder: In real implementation, would come from task API
        const delayedCount = allProjects.reduce((sum, p) => {
            // Assume delayed if progress < 50% but project is active
            return sum + (p.status === 'active' && p.progress_percent < 50 ? 1 : 0);
        }, 0);
        delayedTasksEl.textContent = delayedCount;
    }

    // Open Alerts
    const openAlertsEl = document.getElementById('openAlerts');
    if (openAlertsEl) {
        const totalAlerts = allProjects.reduce((sum, p) => sum + (p.open_alerts || 0), 0);
        openAlertsEl.textContent = totalAlerts;
    }
}

/**
 * Render project cards in the projects grid
 */
function renderProjectCards() {
    const projectsGrid = document.getElementById('projectsGrid');
    const emptyState = document.getElementById('emptyState');

    // Clear existing cards
    projectsGrid.innerHTML = '';

    if (allProjects.length === 0) {
        // Show empty state
        projectsGrid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    // Hide empty state
    emptyState.style.display = 'none';
    projectsGrid.style.display = 'grid';

    // Render each project
    allProjects.forEach(project => {
        const card = createProjectCard(project);
        projectsGrid.appendChild(card);
    });
}

/**
 * Create a project card DOM element
 */
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';

    // Status badge class based on status
    const statusClass = `status-${project.status || 'planned'}`;

    // Color for alerts box
    const alertsClass = project.open_alerts > 0 ? 'critical' : '';

    card.innerHTML = `
        <div class="project-header">
            <div class="project-name">${escapeHtml(project.name)}</div>
            <div class="project-location">📍 ${escapeHtml(project.location || 'Unknown')}</div>
        </div>
        <div class="project-body">
            <!-- Status Badge -->
            <span class="status-badge ${statusClass}">${project.status}</span>

            <!-- Progress Section -->
            <div class="progress-section">
                <div class="progress-label">
                    <span>Task Progress</span>
                    <span>${project.progress_percent}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${project.progress_percent}%"></div>
                </div>
            </div>

            <!-- Stats Grid -->
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-value">${project.task_count}</div>
                    <div class="stat-label">Tasks</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${project.worker_count}</div>
                    <div class="stat-label">Workers</div>
                </div>
            </div>

            <!-- Alert Box -->
            <div class="alert-box ${alertsClass}">
                <div class="alert-count">
                    ${project.open_alerts} open alert${project.open_alerts !== 1 ? 's' : ''}
                </div>
            </div>

            <!-- Action Button -->
            <button class="btn-view-project" onclick="viewProject(${project.area_id})">
                View Project Details →
            </button>
        </div>
    `;

    return card;
}

/**
 * Navigate to project details page
 */
function viewProject(areaId) {
    window.location.href = `/project-details.html?area_id=${areaId}`;
}

/**
 * Handle logout
 */
async function handleLogout() {
    try {
        const response = await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });

        // Redirect to login regardless of response
        window.location.href = '/login.html';
    } catch (error) {
        console.error('Logout error:', error);
        // Still redirect to login
        window.location.href = '/login.html';
    }
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
 * Initialize on DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', () => {
    // Set up logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Initialize dashboard
    initializeDashboard();
});
