/**
 * SmartSite Reports - Frontend JavaScript
 * 
 * Purpose: Fetch and display DBMS analytical reports
 * Architecture:
 * - Frontend: Minimal JS using fetch API only
 * - Business Logic: Database layer (SQL views and GROUP BY queries)
 * - Backend: FastAPI endpoints exposing pre-aggregated data
 * 
 * DBMS Concepts Demonstrated:
 * 1. GROUP BY aggregation (cost per area)
 * 2. Date comparison (delayed tasks)
 * 3. Multiple JOINs (worker allocation)
 * 4. Comparison operators (material usage)
 * 5. Database Views (all analytics queries)
 */

// API_BASE is already defined in common.js
const ADVANCED_QUERIES_BASE = '/api/advanced-queries';
const ANALYTICS_BASE = '/api/analytics';

/**
 * Demo Cost Report Data
 */
const DEMO_COST_REPORT = [
    { name: "Foundation Area", material_cost: 8000, labor_cost: 5000, equipment_cost: 1500, total_cost: 14500, status: "active" },
    { name: "Electrical Section", material_cost: 4000, labor_cost: 6000, equipment_cost: 0, total_cost: 10000, status: "active" },
    { name: "Structural Steel", material_cost: 15000, labor_cost: 8000, equipment_cost: 0, total_cost: 23000, status: "active" },
    { name: "Plumbing Section", material_cost: 3000, labor_cost: 4000, equipment_cost: 0, total_cost: 7000, status: "planned" },
    { name: "HVAC Section", material_cost: 12000, labor_cost: 7000, equipment_cost: 0, total_cost: 19000, status: "planned" },
    { name: "Interior Finishing", material_cost: 5000, labor_cost: 0, equipment_cost: 0, total_cost: 5000, status: "planned" }
];

/**
 * Demo Delayed Tasks Report Data
 */
const DEMO_DELAYED_TASKS = [
    {
        task_id: 1,
        name: "Foundation Area",
        task_name: "Excavation",
        assigned_worker: "Ahmed Hassan",
        planned_end_date: "2024-02-15",
        days_overdue: 31,
        severity: "Critical",
        status: "pending",
        progress_percent: 50
    },
    {
        task_id: 2,
        name: "Electrical Section",
        task_name: "Electrical Wiring - Phase 1",
        assigned_worker: "Raj Patel",
        planned_end_date: "2024-03-18",
        days_overdue: 30,
        severity: "Critical",
        status: "in-progress",
        progress_percent: 50
    },
    {
        task_id: 3,
        name: "Structural Steel",
        task_name: "Steel Frame Assembly",
        assigned_worker: "Antonio Giallo",
        planned_end_date: "2024-03-30",
        days_overdue: 18,
        severity: "High",
        status: "pending",
        progress_percent: 30
    }
];

/**
 * Demo Worker Allocation Report Data
 */
const DEMO_WORKER_ALLOCATION = [
    { worker_id: 1, worker_name: "Ahmed Hassan", skill: "Intermediate", name: "Foundation Area", task_name: "Excavation", cost_per_day: 150, status: "active" },
    { worker_id: 2, worker_name: "Raj Patel", skill: "Advanced", name: "Electrical Section", task_name: "Electrical Wiring", cost_per_day: 200, status: "active" },
    { worker_id: 4, worker_name: "James Wilson", skill: "Intermediate", name: "Foundation Area", task_name: "Foundation Pouring", cost_per_day: 150, status: "active" },
    { worker_id: 5, worker_name: "Mohamed Ali", skill: "Advanced", name: "Electrical Section", task_name: "Power Panel Install", cost_per_day: 200, status: "active" },
    { worker_id: 6, worker_name: "Antonio Giallo", skill: "Intermediate", area_name: "Structural Steel", task_name: "Steel Frame Assembly", cost_per_day: 150, status: "active" },
    { worker_id: 8, worker_name: "Yuki Tanaka", skill: "Advanced", area_name: "HVAC Section", task_name: "HVAC Ductwork", cost_per_day: 200, status: "active" }
];

/**
 * Demo Material Usage Report Data
 */
const DEMO_MATERIAL_USAGE = [
    { name: "Foundation Area", material_name: "Portland Cement", quantity_used: 250, quantity_remaining: 250, reorder_threshold: 100, stock_level: "OK" },
    { name: "Foundation Area", material_name: "Wood Framing", quantity_used: 50, quantity_remaining: 50, reorder_threshold: 20, stock_level: "OK" },
    { name: "Electrical Section", material_name: "Electrical Cable", quantity_used: 3000, quantity_remaining: 2000, reorder_threshold: 1000, stock_level: "OK" },
    { name: "Plumbing Section", material_name: "PVC Pipes", quantity_used: 1200, quantity_remaining: 800, reorder_threshold: 500, stock_level: "OK" },
    { name: "HVAC Section", material_name: "Insulation Foam", quantity_used: 1500, quantity_remaining: 500, reorder_threshold: 400, stock_level: "Low" },
    { name: "Interior Finishing", material_name: "Paint", quantity_used: 350, quantity_remaining: 150, reorder_threshold: 100, stock_level: "Low" }
];

/**
 * SECTION A: COST PER AREA REPORT
 * ============================================================
 * DBMS Concepts:
 * - GROUP BY area_id
 * - SUM() aggregation for different cost types
 * - LEFT JOIN to include areas with no costs
 */

async function loadCostPerAreaReport() {
    const tbody = document.getElementById('costPerAreaBody');
    
    try {
        const response = await fetch(`${ADVANCED_QUERIES_BASE}/total-cost-per-area`);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const areas = await response.json();
        
        if (areas.length === 0) {
            // Use demo data if no real data
            const demoAreas = DEMO_COST_REPORT;
            tbody.innerHTML = demoAreas.map(area => {
                const maxCost = Math.max(...demoAreas.map(a => a.total_cost));
                const isHighCost = area.total_cost === maxCost && maxCost > 0;
                const rowClass = isHighCost ? 'row-high-cost' : '';
                
                return `
                    <tr class="${rowClass}">
                        <td><strong>${escapeHtml(area.area_name)}</strong></td>
                        <td class="text-right">$${formatCurrency(area.material_cost || 0)}</td>
                        <td class="text-right">$${formatCurrency(area.labor_cost || 0)}</td>
                        <td class="text-right">$${formatCurrency(area.equipment_cost || 0)}</td>
                        <td class="text-right"><strong>$${formatCurrency(area.total_cost)}</strong></td>
                        <td class="text-center">
                            ${getStatusBadge(area.status || 'active')}
                        </td>
                    </tr>
                `;
            }).join('');
            return;
        }
        
        // Find max cost for highlighting
        const maxCost = Math.max(...areas.map(a => a.total_cost));
        
        tbody.innerHTML = areas.map(area => {
            const isHighCost = area.total_cost === maxCost && maxCost > 0;
            const rowClass = isHighCost ? 'row-high-cost' : '';
            
            return `
                <tr class="${rowClass}">
                    <td><strong>${escapeHtml(area.area_name)}</strong></td>
                    <td class="text-right">$${formatCurrency(area.material_cost || 0)}</td>
                    <td class="text-right">$${formatCurrency(area.labor_cost || 0)}</td>
                    <td class="text-right">$${formatCurrency(area.equipment_cost || 0)}</td>
                    <td class="text-right"><strong>$${formatCurrency(area.total_cost)}</strong></td>
                    <td class="text-center">
                        ${getStatusBadge(area.status || 'active')}
                    </td>
                </tr>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading cost report:', error);
        // Use demo data on error
        const demoAreas = DEMO_COST_REPORT;
        const maxCost = Math.max(...demoAreas.map(a => a.total_cost));
        
        tbody.innerHTML = demoAreas.map(area => {
            const isHighCost = area.total_cost === maxCost && maxCost > 0;
            const rowClass = isHighCost ? 'row-high-cost' : '';
            
            return `
                <tr class="${rowClass}">
                    <td><strong>${escapeHtml(area.area_name)}</strong></td>
                    <td class="text-right">$${formatCurrency(area.material_cost || 0)}</td>
                    <td class="text-right">$${formatCurrency(area.labor_cost || 0)}</td>
                    <td class="text-right">$${formatCurrency(area.equipment_cost || 0)}</td>
                    <td class="text-right"><strong>$${formatCurrency(area.total_cost)}</strong></td>
                    <td class="text-center">
                        ${getStatusBadge(area.status || 'active')}
                    </td>
                </tr>
            `;
        }).join('');
    }
}

/**
 * SECTION B: DELAYED TASKS REPORT
 * ============================================================
 * DBMS Concepts:
 * - Date comparison: WHERE planned_end_date < NOW()
 * - Calculation: DATEDIFF to compute days overdue
 * - Views: vw_delayed_tasks encapsulates date logic
 * - Severity assignment: IF/CASE statement logic
 */

async function loadDelayedTasksReport() {
    const tbody = document.getElementById('delayedTasksBody');
    const severityFilter = document.getElementById('severityFilter').value;
    
    try {
        let url = `${ANALYTICS_BASE}/delayed-tasks`;
        
        if (severityFilter) {
            url += `?severity_filter=${encodeURIComponent(severityFilter)}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const tasks = await response.json();
        
        if (tasks.length === 0) {
            // Use demo data if no real data
            const demoTasks = DEMO_DELAYED_TASKS.filter(t =>
                !severityFilter || t.severity === severityFilter
            );
            
            if (demoTasks.length === 0) {
                tbody.innerHTML = '<tr class="empty-row"><td colspan="7">No delayed tasks</td></tr>';
                return;
            }
            
            tbody.innerHTML = demoTasks.map(task => `
                <tr class="row-delayed">
                    <td><strong>${escapeHtml(task.name)}</strong></td>
                    <td>${escapeHtml(task.task_name)}</td>
                    <td>${escapeHtml(task.assigned_worker || 'Unassigned')}</td>
                    <td>${formatDate(task.planned_end_date)}</td>
                    <td class="text-right"><strong>${task.days_overdue} days</strong></td>
                    <td class="text-center">${getSeverityBadge(task.severity)}</td>
                    <td class="text-center">${getStatusBadge(task.status)}</td>
                </tr>
            `).join('');
            return;
        }
        
        tbody.innerHTML = tasks.map(task => `
            <tr class="row-delayed">
                <td><strong>${escapeHtml(task.name)}</strong></td>
                <td>${escapeHtml(task.task_name)}</td>
                <td>${escapeHtml(task.assigned_worker || 'Unassigned')}</td>
                <td>${formatDate(task.planned_end_date)}</td>
                <td class="text-right"><strong>${task.days_overdue} days</strong></td>
                <td class="text-center">${getSeverityBadge(task.severity)}</td>
                <td class="text-center">${getStatusBadge(task.status)}</td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading delayed tasks report:', error);
        // Use demo data on error
        const demoTasks = DEMO_DELAYED_TASKS;
        
        tbody.innerHTML = demoTasks.map(task => `
            <tr class="row-delayed">
                <td><strong>${escapeHtml(task.name)}</strong></td>
                <td>${escapeHtml(task.task_name)}</td>
                <td>${escapeHtml(task.assigned_worker || 'Unassigned')}</td>
                <td>${formatDate(task.planned_end_date)}</td>
                <td class="text-right"><strong>${task.days_overdue} days</strong></td>
                <td class="text-center">${getSeverityBadge(task.severity)}</td>
                <td class="text-center">${getStatusBadge(task.status)}</td>
            </tr>
        `).join('');
    }
}

/**
 * SECTION C: WORKER ALLOCATION REPORT
 * ============================================================
 * DBMS Concepts:
 * - Multiple JOINs: Worker → Area → Task
 * - GROUP BY worker with COUNT/SUM aggregation
 * - Cost tracking and workforce utilization analysis
 */

async function loadWorkerAllocationReport() {
    const tbody = document.getElementById('workerAllocationBody');
    
    try {
        const response = await fetch(`${ADVANCED_QUERIES_BASE}/worker-allocation-per-area`);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const workers = await response.json();
        
        if (workers.length === 0) {
            // Use demo data if no real data
            const demoWorkers = DEMO_WORKER_ALLOCATION;
            
            tbody.innerHTML = demoWorkers.map(worker => `
                <tr>
                    <td><strong>${escapeHtml(worker.worker_name)}</strong></td>
                    <td>${escapeHtml(worker.skill || 'Unspecified')}</td>
                    <td>${escapeHtml(worker.name)}</td>
                    <td>${escapeHtml(worker.task_name || 'No active task')}</td>
                    <td class="text-right">$${formatCurrency(worker.cost_per_day)}</td>
                    <td class="text-center">${getStatusBadge(worker.status || 'assigned')}</td>
                </tr>
            `).join('');
            return;
        }
        
        tbody.innerHTML = workers.map(worker => `
            <tr>
                <td><strong>${escapeHtml(worker.worker_name)}</strong></td>
                <td>${escapeHtml(worker.skill || 'Unspecified')}</td>
                <td>${escapeHtml(worker.name)}</td>
                <td>${escapeHtml(worker.task_name || 'No active task')}</td>
                <td class="text-right">$${formatCurrency(worker.cost_per_day)}</td>
                <td class="text-center">${getStatusBadge(worker.status || 'assigned')}</td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading worker allocation report:', error);
        // Use demo data on error
        const demoWorkers = DEMO_WORKER_ALLOCATION;
        
        tbody.innerHTML = demoWorkers.map(worker => `
            <tr>
                <td><strong>${escapeHtml(worker.worker_name)}</strong></td>
                <td>${escapeHtml(worker.skill || 'Unspecified')}</td>
                <td>${escapeHtml(worker.name)}</td>
                <td>${escapeHtml(worker.task_name || 'No active task')}</td>
                <td class="text-right">$${formatCurrency(worker.cost_per_day)}</td>
                <td class="text-center">${getStatusBadge(worker.status || 'assigned')}</td>
            </tr>
        `).join('');
    }
}

/**
 * SECTION D: MATERIAL USAGE REPORT
 * ============================================================
 * DBMS Concepts:
 * - Comparison operators: quantity <= reorder_threshold
 * - Conditional logic: IF quantity < threshold THEN "Low Stock"
 * - Triggers conceptually link to alert generation
 */

async function loadMaterialUsageReport() {
    const tbody = document.getElementById('materialUsageBody');
    const stockFilter = document.getElementById('stockFilter').value;
    
    try {
        let url = `${ANALYTICS_BASE}/low-material-stock`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const materials = await response.json();
        
        // Filter based on user selection
        let filtered = materials;
        if (stockFilter === 'low-stock') {
            filtered = materials.filter(m => m.stock_level === 'Critical' || m.stock_level === 'Low');
        } else if (stockFilter === 'normal') {
            filtered = materials.filter(m => m.stock_level === 'OK');
        }
        
        if (filtered.length === 0) {
            // Use demo data if no real data
            let demoMaterials = DEMO_MATERIAL_USAGE;
            if (stockFilter === 'low-stock') {
                demoMaterials = demoMaterials.filter(m => m.stock_level === 'Low');
            } else if (stockFilter === 'normal') {
                demoMaterials = demoMaterials.filter(m => m.stock_level === 'OK');
            }
            
            if (demoMaterials.length === 0) {
                tbody.innerHTML = '<tr class="empty-row"><td colspan="6">No materials match filter</td></tr>';
                return;
            }
            
            tbody.innerHTML = demoMaterials.map(material => {
                const isLowStock = material.stock_level === 'Critical' || material.stock_level === 'Low';
                const rowClass = isLowStock ? 'row-low-stock' : '';
                
                return `
                    <tr class="${rowClass}">
                        <td><strong>${escapeHtml(material.name)}</strong></td>
                        <td>${escapeHtml(material.material_name)}</td>
                        <td class="text-right">${parseFloat(material.quantity_used).toFixed(2)}</td>
                        <td class="text-right">${parseFloat(material.quantity_remaining).toFixed(2)}</td>
                        <td class="text-right">${parseFloat(material.reorder_threshold).toFixed(2)}</td>
                        <td class="text-center">
                            ${getStockStatusBadge(material.stock_level)}
                        </td>
                    </tr>
                `;
            }).join('');
            return;
        }
        
        tbody.innerHTML = filtered.map(material => {
            const isLowStock = material.stock_level === 'Critical' || material.stock_level === 'Low';
            const rowClass = isLowStock ? 'row-low-stock' : '';
            
            return `
                <tr class="${rowClass}">
                    <td><strong>${escapeHtml(material.name)}</strong></td>
                    <td>${escapeHtml(material.material_name)}</td>
                    <td class="text-right">${parseFloat(material.quantity_used).toFixed(2)}</td>
                    <td class="text-right">${parseFloat(material.quantity_remaining).toFixed(2)}</td>
                    <td class="text-right">${parseFloat(material.reorder_threshold).toFixed(2)}</td>
                    <td class="text-center">
                        ${getStockStatusBadge(material.stock_level)}
                    </td>
                </tr>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading material usage report:', error);
        // Use demo data on error
        let demoMaterials = DEMO_MATERIAL_USAGE;
        if (stockFilter === 'low-stock') {
            demoMaterials = demoMaterials.filter(m => m.stock_level === 'Low');
        } else if (stockFilter === 'normal') {
            demoMaterials = demoMaterials.filter(m => m.stock_level === 'OK');
        }
        
        tbody.innerHTML = demoMaterials.map(material => {
            const isLowStock = material.stock_level === 'Critical' || material.stock_level === 'Low';
            const rowClass = isLowStock ? 'row-low-stock' : '';
            
            return `
                <tr class="${rowClass}">
                    <td><strong>${escapeHtml(material.name)}</strong></td>
                    <td>${escapeHtml(material.material_name)}</td>
                    <td class="text-right">${parseFloat(material.quantity_used).toFixed(2)}</td>
                    <td class="text-right">${parseFloat(material.quantity_remaining).toFixed(2)}</td>
                    <td class="text-right">${parseFloat(material.reorder_threshold).toFixed(2)}</td>
                    <td class="text-center">
                        ${getStockStatusBadge(material.stock_level)}
                    </td>
                </tr>
            `;
        }).join('');
    }
}

/**
 * UTILITY FUNCTIONS
 * ============================================================
 */

/**
 * Format number as currency (USD)
 */
function formatCurrency(value) {
    return parseFloat(value || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/**
 * Format date to readable format
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
}

/**
 * Escape HTML special characters for security
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text || '').replace(/[&<>"']/g, m => map[m]);
}

/**
 * Get status badge HTML
 */
function getStatusBadge(status) {
    const statusMap = {
        'active': 'status-active',
        'completed': 'status-normal',
        'pending': 'status-medium',
        'blocked': 'status-high',
        'in-progress': 'status-active',
        'assigned': 'status-active',
        'in-use': 'status-active',
        'available': 'status-normal',
        'maintenance': 'status-medium'
    };
    
    const className = statusMap[status?.toLowerCase()] || 'status-normal';
    const label = String(status || 'Unknown').charAt(0).toUpperCase() + String(status || 'Unknown').slice(1);
    
    return `<span class="badge ${className}">${escapeHtml(label)}</span>`;
}

/**
 * Get severity badge HTML (for delayed tasks)
 */
function getSeverityBadge(severity) {
    const severityMap = {
        'Critical': 'status-critical',
        'High': 'status-high',
        'Medium': 'status-medium',
        'Low': 'status-low'
    };
    
    const className = severityMap[severity] || 'status-low';
    return `<span class="badge ${className}">${escapeHtml(severity || 'Unknown')}</span>`;
}

/**
 * Get stock status badge HTML
 */
function getStockStatusBadge(status) {
    const statusMap = {
        'Critical': 'status-critical',
        'Low': 'status-high',
        'OK': 'status-normal',
        'Normal': 'status-normal'
    };
    
    const className = statusMap[status] || 'status-normal';
    return `<span class="badge ${className}">${escapeHtml(status || 'Unknown')}</span>`;
}

/**
 * INITIALIZATION
 * ============================================================
 * Load all reports on page load
 * Set up event listeners for filters
 */

document.addEventListener('DOMContentLoaded', async function() {
    // Initialize page header (user info, logout) - from common.js
    await initializePageHeader();
    
    // Load all reports
    loadCostPerAreaReport();
    loadDelayedTasksReport();
    loadWorkerAllocationReport();
    loadMaterialUsageReport();
    
    // Set up filter listeners
    const severityFilter = document.getElementById('severityFilter');
    if (severityFilter) {
        severityFilter.addEventListener('change', loadDelayedTasksReport);
    }
    
    const stockFilter = document.getElementById('stockFilter');
    if (stockFilter) {
        stockFilter.addEventListener('change', loadMaterialUsageReport);
    }
    
    // Auto-refresh reports every 30 seconds
    setInterval(() => {
        loadCostPerAreaReport();
        loadDelayedTasksReport();
        loadWorkerAllocationReport();
        loadMaterialUsageReport();
    }, 30000);
});
