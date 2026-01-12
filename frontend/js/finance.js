/**
 * Finance Page - JavaScript
 * 
 * PURPOSE:
 * This script handles the Cost & Budget page functionality for financial monitoring.
 * 
 * ARCHITECTURE NOTES:
 * 1. SEPARATION OF CONCERNS:
 *    - Cost data: Tracks individual financial transactions (material, labor, equipment costs)
 *    - Budget data: Tracks allocated budget per project (area)
 *    - Aggregation: Done at DATABASE level via SQL queries, not in JavaScript
 *    - Frontend: Only displays results from API endpoints
 * 
 * 2. DATA FLOW:
 *    API (FastAPI) → Database aggregation (SQL) → REST Response → Frontend Display
 *    This follows best practices for DBMS systems where heavy lifting is done in SQL
 * 
 * 3. WHY NOT AGGREGATE IN JAVASCRIPT:
 *    - Database aggregation is more efficient (indexes, query optimization)
 *    - Demonstrates proper DBMS design (GROUP BY, SUM, HAVING clauses)
 *    - More reliable for large datasets
 *    - Easier to explain in academic context
 * 
 * DBMS QUERIES EXPLAINED:
 * - GET /api/costs/ : Retrieves all cost entries with join to Area table
 * - GET /api/budgets/ : Retrieves all budget records with area information
 * - GET /api/costs/area/{area_id}/summary : Aggregates costs per area (uses SUM, GROUP BY)
 * - GET /api/budgets/area/{area_id}/vs-actual : Compares budget vs actual cost per area
 */

// ============================================
// GLOBAL STATE
// ============================================

let allCosts = [];
let allBudgets = [];
let allAreas = [];
let costSummaryByArea = {};
let budgetByArea = {};
let filteredCosts = [];

// ============================================
// PAGE INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    console.log('Finance page loaded');
    loadUserInfo();
    loadFinancialData();
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
 * Load all financial data from API endpoints
 * This includes costs, budgets, and areas
 */
async function loadFinancialData() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const errorMessage = document.getElementById('errorMessage');
    
    loadingSpinner.style.display = 'flex';
    errorMessage.style.display = 'none';
    
    try {
        // Fetch all required data in parallel
        const [costsRes, budgetsRes, areasRes] = await Promise.all([
            fetch('/api/costs', { credentials: 'include' }),
            fetch('/api/budgets', { credentials: 'include' }),
            fetch('/api/areas', { credentials: 'include' })
        ]);
        
        // Check for errors
        if (!costsRes.ok || !budgetsRes.ok || !areasRes.ok) {
            throw new Error('Failed to fetch financial data');
        }
        
        // Parse responses
        allCosts = await costsRes.json();
        allBudgets = await budgetsRes.json();
        allAreas = await areasRes.json();
        
        console.log('Costs loaded:', allCosts.length);
        console.log('Budgets loaded:', allBudgets.length);
        console.log('Areas loaded:', allAreas.length);
        
        // Process data and populate tables
        populateCostEntries();
        populateBudgetSummary();
        populateOverBudgetSection();
        populateFinancialSummary();
        populateFilterOptions();
        
        loadingSpinner.style.display = 'none';
        
    } catch (error) {
        console.error('Error loading financial data:', error);
        loadingSpinner.style.display = 'none';
        errorMessage.style.display = 'block';
        errorMessage.textContent = `Error loading worker data: ${error.message}. Please check the browser console for more details.`;
    }
}

/**
 * Setup event listeners for filters and interactive elements
 */
function setupEventListeners() {
    const filterProject = document.getElementById('filterProject');
    const filterCostType = document.getElementById('filterCostType');
    
    if (filterProject) {
        filterProject.addEventListener('change', applyFilters);
    }
    
    if (filterCostType) {
        filterCostType.addEventListener('change', applyFilters);
    }
}

/**
 * SECTION B: Populate Cost Entries Table
 * 
 * DBMS NOTE:
 * In production, this would use: GET /api/costs?project_id={id}&cost_type={type}
 * which applies SQL WHERE filters at the database level.
 * For this demo, filtering is done in JavaScript, but production code
 * should filter at the database level for better performance.
 */
function populateCostEntries() {
    const tbody = document.getElementById('costEntriesBody');
    filteredCosts = allCosts;
    
    tbody.innerHTML = '';
    
    if (filteredCosts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No cost entries found</td></tr>';
        return;
    }
    
    filteredCosts.forEach(cost => {
        const row = document.createElement('tr');
        
        // Get area name from areas array
        const area = allAreas.find(a => a.area_id === cost.area_id);
        const areaName = area ? area.area_name : 'Unknown';
        
        // Format currency
        const amount = formatCurrency(cost.cost_amount);
        
        // Format date
        const incurredDate = formatDate(cost.cost_date);
        
        // Get cost type badge class
        const costTypeClass = `cost-type-${cost.cost_type.toLowerCase()}`;
        
        row.innerHTML = `
            <td><strong>${areaName}</strong></td>
            <td><span class="cost-type-badge ${costTypeClass}">${cost.cost_type}</span></td>
            <td class="text-right">${amount}</td>
            <td>${incurredDate}</td>
            <td>${cost.description || '-'}</td>
        `;
        
        tbody.appendChild(row);
    });
}

/**
 * SECTION C: Populate Budget vs Cost Summary
 * 
 * DBMS NOTE:
 * This section displays budget information for each area.
 * The database query should aggregate:
 * - SUM(budget_amount) for estimated budget per area
 * - SUM(cost_amount) for total incurred cost per area
 * Using: GROUP BY area_id, HAVING conditions for filtering
 */
function populateBudgetSummary() {
    const container = document.getElementById('summaryCards');
    container.innerHTML = '';
    
    // Group budgets by area
    const budgetByAreaId = {};
    allBudgets.forEach(budget => {
        if (!budgetByAreaId[budget.area_id]) {
            budgetByAreaId[budget.area_id] = 0;
        }
        budgetByAreaId[budget.area_id] += budget.budget_amount;
    });
    
    // Group costs by area
    const costByAreaId = {};
    allCosts.forEach(cost => {
        if (!costByAreaId[cost.area_id]) {
            costByAreaId[cost.area_id] = 0;
        }
        costByAreaId[cost.area_id] += cost.cost_amount;
    });
    
    // Create summary card for each area
    allAreas.forEach(area => {
        const budget = budgetByAreaId[area.area_id] || 0;
        const cost = costByAreaId[area.area_id] || 0;
        const remaining = budget - cost;
        const utilization = budget > 0 ? Math.round((cost / budget) * 100) : 0;
        
        // Determine status
        let status = 'in-budget';
        if (utilization > 90) status = 'warning';
        if (cost > budget) status = 'over-budget';
        
        // Determine progress bar color
        let progressBarClass = '';
        if (utilization > 90) progressBarClass = 'warning';
        if (cost > budget) progressBarClass = 'danger';
        
        const card = document.createElement('div');
        card.className = 'summary-card';
        card.innerHTML = `
            <div class="card-title">${area.area_name}</div>
            
            <div class="card-values">
                <div class="value-item">
                    <div class="value-label">Budget</div>
                    <div class="value-amount">${formatCurrency(budget)}</div>
                </div>
                <div class="value-item">
                    <div class="value-label">Cost</div>
                    <div class="value-amount">${formatCurrency(cost)}</div>
                </div>
                <div class="value-item">
                    <div class="value-label">Remaining</div>
                    <div class="value-amount ${remaining < 0 ? 'text-danger' : ''}">${formatCurrency(remaining)}</div>
                </div>
            </div>
            
            <div class="progress-bar-container">
                <div class="progress-label">
                    <span>Budget Utilization</span>
                    <span><strong>${utilization}%</strong></span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${progressBarClass}" style="width: ${Math.min(utilization, 100)}%"></div>
                </div>
            </div>
            
            <div style="margin-top: 1rem; text-align: center;">
                <span class="status-badge status-${status}">${status.replace('-', ' ').toUpperCase()}</span>
            </div>
        `;
        
        container.appendChild(card);
    });
}

/**
 * SECTION D: Populate Over-Budget Projects
 * 
 * DBMS NOTE:
 * This query requires:
 * SELECT area.area_name, SUM(budget.budget_amount) as total_budget, 
 *        SUM(cost.cost_amount) as total_cost
 * FROM area
 * LEFT JOIN budget ON area.area_id = budget.area_id
 * LEFT JOIN cost ON area.area_id = cost.area_id
 * GROUP BY area.area_id
 * HAVING SUM(cost.cost_amount) > SUM(budget.budget_amount)
 * 
 * This is best implemented at database level (VIEW or stored procedure)
 * Frontend only displays the results
 */
function populateOverBudgetSection() {
    const container = document.getElementById('overBudgetContainer');
    const tbody = document.getElementById('overBudgetBody');
    const noMessageDiv = document.getElementById('noOverBudgetMessage');
    
    // Calculate budget and cost per area
    const budgetByAreaId = {};
    const costByAreaId = {};
    
    allBudgets.forEach(budget => {
        if (!budgetByAreaId[budget.area_id]) {
            budgetByAreaId[budget.area_id] = 0;
        }
        budgetByAreaId[budget.area_id] += budget.budget_amount;
    });
    
    allCosts.forEach(cost => {
        if (!costByAreaId[cost.area_id]) {
            costByAreaId[cost.area_id] = 0;
        }
        costByAreaId[cost.area_id] += cost.cost_amount;
    });
    
    // Find areas over budget
    const overBudgetAreas = allAreas.filter(area => {
        const budget = budgetByAreaId[area.area_id] || 0;
        const cost = costByAreaId[area.area_id] || 0;
        return cost > budget;
    });
    
    tbody.innerHTML = '';
    
    if (overBudgetAreas.length === 0) {
        container.style.display = 'none';
        noMessageDiv.style.display = 'block';
        return;
    }
    
    container.style.display = 'block';
    noMessageDiv.style.display = 'none';
    
    overBudgetAreas.forEach(area => {
        const budget = budgetByAreaId[area.area_id] || 0;
        const cost = costByAreaId[area.area_id] || 0;
        const overrun = cost - budget;
        const percentage = Math.round((overrun / budget) * 100);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${area.area_name}</strong></td>
            <td>${formatCurrency(budget)}</td>
            <td class="text-danger"><strong>${formatCurrency(cost)}</strong></td>
            <td>${formatCurrency(overrun)} <span class="text-danger">(+${percentage}%)</span></td>
            <td><span class="status-badge status-over-budget">OVER BUDGET</span></td>
        `;
        
        tbody.appendChild(row);
    });
}

/**
 * Populate overall financial summary statistics
 * These are high-level aggregates across all projects
 */
function populateFinancialSummary() {
    // Calculate totals
    const totalBudget = allBudgets.reduce((sum, b) => sum + b.budget_amount, 0);
    const totalCost = allCosts.reduce((sum, c) => sum + c.cost_amount, 0);
    const remainingBudget = totalBudget - totalCost;
    const budgetUtilization = totalBudget > 0 ? Math.round((totalCost / totalBudget) * 100) : 0;
    
    // Update stat cards
    document.getElementById('totalBudget').textContent = formatCurrency(totalBudget);
    document.getElementById('totalCost').textContent = formatCurrency(totalCost);
    document.getElementById('remainingBudget').textContent = formatCurrency(remainingBudget);
    document.getElementById('budgetUtilization').textContent = budgetUtilization + '%';
}

/**
 * Populate filter options with available projects and cost types
 */
function populateFilterOptions() {
    const projectSelect = document.getElementById('filterProject');
    
    // Get unique areas
    const uniqueAreas = [...new Set(allCosts.map(c => c.area_id))];
    
    uniqueAreas.forEach(areaId => {
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
 * Apply active filters to cost entries table
 */
function applyFilters() {
    const projectId = document.getElementById('filterProject').value;
    const costType = document.getElementById('filterCostType').value;
    
    filteredCosts = allCosts.filter(cost => {
        const projectMatch = projectId === '' || cost.area_id == projectId;
        const typeMatch = costType === '' || cost.cost_type.toLowerCase() === costType.toLowerCase();
        return projectMatch && typeMatch;
    });
    
    populateCostEntries();
}

/**
 * UTILITY FUNCTIONS
 */

/**
 * Format number as currency (USD)
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
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
