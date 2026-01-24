/**
 * Resources Management Page - JavaScript
 * 
 * DBMS Integration:
 * - Fetches materials from API: GET /api/materials
 * - Fetches equipment from API: GET /api/equipment
 * - Fetches areas from API: GET /api/areas
 * 
 * Data Structure:
 * Materials:
 *   - material_id, name, quantity, unit, reorder_level, cost_per_unit, area_id, updated_at
 * Equipment:
 *   - equipment_id, name, serial_number, status, area_id, maintenance_notes, updated_at
 * 
 * Workflow:
 * 1. Load all materials, equipment, and areas on page load
 * 2. Display materials in first table with filtering
 * 3. Display equipment in second table with filtering
 * 4. Highlight low stock materials
 * 5. Show status indicators for equipment conditions
 */

// Global data storage
let allMaterials = [];
let allEquipment = [];
let allAreas = [];
let filteredMaterials = [];
let filteredEquipment = [];

/**
 * Demo materials data - 12 sample materials for testing/documentation
 */
const DEMO_MATERIALS = [
    { material_id: 1, name: "Portland Cement", area_id: 1, quantity: 500, unit: "bags", reorder_level: 100, cost_per_unit: 25.00 },
    { material_id: 2, name: "Steel Rebar", area_id: 1, quantity: 50, unit: "tons", reorder_level: 10, cost_per_unit: 500.00 },
    { material_id: 3, name: "Electrical Cable", area_id: 2, quantity: 5000, unit: "meters", reorder_level: 1000, cost_per_unit: 2.50 },
    { material_id: 4, name: "PVC Pipes", area_id: 3, quantity: 2000, unit: "meters", reorder_level: 500, cost_per_unit: 5.00 },
    { material_id: 5, name: "Drywall Sheets", area_id: 5, quantity: 1000, unit: "sheets", reorder_level: 200, cost_per_unit: 15.00 },
    { material_id: 6, name: "Paint", area_id: 5, quantity: 500, unit: "liters", reorder_level: 100, cost_per_unit: 20.00 },
    { material_id: 7, name: "HVAC Ductwork", area_id: 6, quantity: 300, unit: "meters", reorder_level: 50, cost_per_unit: 50.00 },
    { material_id: 8, name: "Copper Tubing", area_id: 3, quantity: 500, unit: "meters", reorder_level: 100, cost_per_unit: 30.00 },
    { material_id: 9, name: "Insulation Foam", area_id: 6, quantity: 2000, unit: "sheets", reorder_level: 400, cost_per_unit: 8.00 },
    { material_id: 10, name: "Tiles", area_id: 5, quantity: 5000, unit: "pieces", reorder_level: 1000, cost_per_unit: 2.00 },
    { material_id: 11, name: "Wood Framing", area_id: 1, quantity: 100, unit: "pieces", reorder_level: 20, cost_per_unit: 50.00 },
    { material_id: 12, name: "Glass Panes", area_id: 5, quantity: 300, unit: "pieces", reorder_level: 50, cost_per_unit: 100.00 }
];

/**
 * Demo equipment data - 10 sample equipment items for testing/documentation
 */
const DEMO_EQUIPMENT = [
    { equipment_id: 1, name: "Excavator CAT 320", area_id: 1, serial_number: "CAT-320-001", status: "active", maintenance_schedule: "Monthly" },
    { equipment_id: 2, name: "Concrete Mixer CM500", area_id: 1, serial_number: "CM-500-001", status: "active", maintenance_schedule: "Weekly" },
    { equipment_id: 3, name: "Electrical Panel EB1000", area_id: 2, serial_number: "EB-1000-001", status: "active", maintenance_schedule: "Quarterly" },
    { equipment_id: 4, name: "Power Drill Set", area_id: 2, serial_number: "PDS-001", status: "active", maintenance_schedule: "Monthly" },
    { equipment_id: 5, name: "Water Pump WP300", area_id: 3, serial_number: "WP-300-001", status: "active", maintenance_schedule: "Monthly" },
    { equipment_id: 6, name: "Welding Machine W2000", area_id: 4, serial_number: "W2K-001", status: "active", maintenance_schedule: "Quarterly" },
    { equipment_id: 7, name: "Air Compressor AC100", area_id: 5, serial_number: "AC-100-001", status: "active", maintenance_schedule: "Monthly" },
    { equipment_id: 8, name: "Scaffolding Set", area_id: 4, serial_number: "SCAF-SET-001", status: "active", maintenance_schedule: "Weekly" },
    { equipment_id: 9, name: "Safety Harness Kit", area_id: 1, serial_number: "SHK-001", status: "active", maintenance_schedule: "Monthly" },
    { equipment_id: 10, name: "Measuring Instruments Set", area_id: 1, serial_number: "MIS-001", status: "active", maintenance_schedule: "Quarterly" }
];

// ============================================
// PAGE INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async function () {
    console.log('Resources page loaded');
    await initializePageHeader(); // From common.js
    loadResourcesData();
    setupEventListeners();
});

/**
 * Load user information - delegated to common.js via initializePageHeader()
 * (This function is deprecated - kept for reference)
 */
async function loadUserInfo() {
    // Now handled by initializePageHeader() in common.js
    return;
    
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
 * Load all resources data from API
 */
async function loadResourcesData() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const resourcesContent = document.getElementById('resourcesContent');
    
    try {
        let dataLoaded = false;
        
        // Try to fetch materials
        try {
            console.log('Fetching materials from /api/materials/');
            const materialsRes = await fetch('/api/materials/', {
                credentials: 'include'
            });
            console.log('Materials response status:', materialsRes.status);
            if (materialsRes.ok) {
                allMaterials = await materialsRes.json();
                console.log('Materials loaded:', allMaterials.length);
                dataLoaded = true;
            }
        } catch (e) {
            console.log('Materials API failed, will use demo data');
        }
        
        // Try to fetch equipment
        try {
            console.log('Fetching equipment from /api/equipment/');
            const equipmentRes = await fetch('/api/equipment/', {
                credentials: 'include'
            });
            console.log('Equipment response status:', equipmentRes.status);
            if (equipmentRes.ok) {
                allEquipment = await equipmentRes.json();
                console.log('Equipment loaded:', allEquipment.length);
                dataLoaded = true;
            }
        } catch (e) {
            console.log('Equipment API failed');
        }
        
        // Try to fetch areas
        try {
            console.log('Fetching areas from /api/areas/');
            const areasRes = await fetch('/api/areas/', {
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
        
        // If API data failed, use demo data
        if (!dataLoaded || allMaterials.length === 0) {
            console.log('Using demo data for resources');
            allMaterials = DEMO_MATERIALS;
            allEquipment = DEMO_EQUIPMENT;
        }
        
        // Initialize filtered data
        filteredMaterials = [...allMaterials];
        filteredEquipment = [...allEquipment];
        
        // Populate filter dropdowns
        populateFilterDropdowns();
        
        // Render tables
        renderMaterialsTable();
        renderEquipmentTable();
        updateStatistics();
        
        // Hide loading, show content
        loadingSpinner.style.display = 'none';
        resourcesContent.style.display = 'block';
        
    } catch (error) {
        console.error('Error loading resources data:', error);
        // Use demo data as final fallback
        allMaterials = DEMO_MATERIALS;
        allEquipment = DEMO_EQUIPMENT;
        filteredMaterials = [...allMaterials];
        filteredEquipment = [...allEquipment];
        populateFilterDropdowns();
        renderMaterialsTable();
        renderEquipmentTable();
        updateStatistics();
        loadingSpinner.style.display = 'none';
        resourcesContent.style.display = 'block';
    }
}

/**
 * Setup event listeners for filters
 */
function setupEventListeners() {
    // Materials filters
    document.getElementById('searchMaterial').addEventListener('input', filterMaterials);
    document.getElementById('filterMaterialProject').addEventListener('change', filterMaterials);
    document.getElementById('filterStockStatus').addEventListener('change', filterMaterials);
    document.getElementById('resetMaterialFilters').addEventListener('click', resetMaterialFilters);
    
    // Equipment filters
    document.getElementById('searchEquipment').addEventListener('input', filterEquipment);
    document.getElementById('filterEquipmentProject').addEventListener('change', filterEquipment);
    document.getElementById('filterStatus').addEventListener('change', filterEquipment);
    document.getElementById('resetEquipmentFilters').addEventListener('click', resetEquipmentFilters);
}

// ============================================
// POPULATE DROPDOWNS
// ============================================

/**
 * Populate filter dropdowns with dynamic data
 */
function populateFilterDropdowns() {
    const materialProjectSelect = document.getElementById('filterMaterialProject');
    const equipmentProjectSelect = document.getElementById('filterEquipmentProject');
    
    // Clear existing options
    materialProjectSelect.innerHTML = '<option value="">All Projects</option>';
    equipmentProjectSelect.innerHTML = '<option value="">All Projects</option>';
    
    // Add area options
    allAreas.forEach(area => {
        const option1 = document.createElement('option');
        option1.value = area.area_id;
        option1.textContent = area.name;
        materialProjectSelect.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = area.area_id;
        option2.textContent = area.name;
        equipmentProjectSelect.appendChild(option2);
    });
}

// ============================================
// MATERIALS FILTERING
// ============================================

/**
 * Filter materials based on current filter values
 */
function filterMaterials() {
    const searchTerm = document.getElementById('searchMaterial').value.toLowerCase();
    const projectFilter = document.getElementById('filterMaterialProject').value;
    const stockStatusFilter = document.getElementById('filterStockStatus').value;
    
    filteredMaterials = allMaterials.filter(material => {
        // Search by name
        const nameMatch = material.name.toLowerCase().includes(searchTerm);
        
        // Filter by project/area
        const projectMatch = !projectFilter || (material.area_id && material.area_id === parseInt(projectFilter));
        
        // Filter by stock status
        let stockMatch = true;
        if (stockStatusFilter === 'low') {
            stockMatch = material.quantity < material.reorder_level;
        } else if (stockStatusFilter === 'adequate') {
            stockMatch = material.quantity >= material.reorder_level;
        }
        
        return nameMatch && projectMatch && stockMatch;
    });
    
    renderMaterialsTable();
    updateStatistics();
}

/**
 * Reset all material filters
 */
function resetMaterialFilters() {
    document.getElementById('searchMaterial').value = '';
    document.getElementById('filterMaterialProject').value = '';
    document.getElementById('filterStockStatus').value = '';
    
    filteredMaterials = [...allMaterials];
    renderMaterialsTable();
    updateStatistics();
}

// ============================================
// EQUIPMENT FILTERING
// ============================================

/**
 * Filter equipment based on current filter values
 */
function filterEquipment() {
    const searchTerm = document.getElementById('searchEquipment').value.toLowerCase();
    const projectFilter = document.getElementById('filterEquipmentProject').value;
    const statusFilter = document.getElementById('filterStatus').value;
    
    filteredEquipment = allEquipment.filter(equipment => {
        // Search by name
        const nameMatch = equipment.name.toLowerCase().includes(searchTerm);
        
        // Filter by project/area
        const projectMatch = !projectFilter || (equipment.area_id && equipment.area_id === parseInt(projectFilter));
        
        // Filter by status
        const statusMatch = !statusFilter || equipment.status === statusFilter;
        
        return nameMatch && projectMatch && statusMatch;
    });
    
    renderEquipmentTable();
    updateStatistics();
}

/**
 * Reset all equipment filters
 */
function resetEquipmentFilters() {
    document.getElementById('searchEquipment').value = '';
    document.getElementById('filterEquipmentProject').value = '';
    document.getElementById('filterStatus').value = '';
    
    filteredEquipment = [...allEquipment];
    renderEquipmentTable();
    updateStatistics();
}

// ============================================
// RENDER TABLES
// ============================================

/**
 * Render the materials table
 */
function renderMaterialsTable() {
    const tableBody = document.getElementById('materialsTableBody');
    const noDataMsg = document.getElementById('noMaterialsMessage');
    
    // Clear table
    tableBody.innerHTML = '';
    
    // Show no data message if needed
    if (filteredMaterials.length === 0) {
        noDataMsg.style.display = 'block';
        return;
    } else {
        noDataMsg.style.display = 'none';
    }
    
    // Render rows
    filteredMaterials.forEach(material => {
        const row = createMaterialRow(material);
        tableBody.appendChild(row);
    });
}

/**
 * Create a table row for a material
 */
function createMaterialRow(material) {
    const tr = document.createElement('tr');
    
    // Get area name
    const area = allAreas.find(a => a.area_id === material.area_id);
    const areaName = area ? area.name : 'Unassigned';
    
    // Check if low stock
    const isLowStock = material.quantity < material.reorder_level;
    const stockStatus = isLowStock 
        ? '<span class="status-badge status-low-stock">Low Stock</span>'
        : '<span class="status-badge status-adequate">Adequate</span>';
    
    // Format last updated
    const lastUpdated = material.updated_at ? new Date(material.updated_at).toLocaleDateString() : 'N/A';
    
    // Format cost
    const cost = material.cost_per_unit ? `$${parseFloat(material.cost_per_unit).toFixed(2)}` : 'N/A';
    
    // Add low stock class to row if applicable
    if (isLowStock) {
        tr.classList.add('material-row-low-stock');
    }
    
    tr.innerHTML = `
        <td><strong>${material.name}</strong></td>
        <td>${areaName}</td>
        <td>
            <div style="display: flex; justify-content: space-between;">
                <span><strong>${material.quantity}</strong></span>
                <span style="color: #7f8c8d;">${material.unit || 'units'}</span>
            </div>
        </td>
        <td>${material.reorder_level || 'N/A'}</td>
        <td>${cost}</td>
        <td>${stockStatus}</td>
        <td>${lastUpdated}</td>
    `;
    
    return tr;
}

/**
 * Render the equipment table
 */
function renderEquipmentTable() {
    const tableBody = document.getElementById('equipmentTableBody');
    const noDataMsg = document.getElementById('noEquipmentMessage');
    
    // Clear table
    tableBody.innerHTML = '';
    
    // Show no data message if needed
    if (filteredEquipment.length === 0) {
        noDataMsg.style.display = 'block';
        return;
    } else {
        noDataMsg.style.display = 'none';
    }
    
    // Render rows
    filteredEquipment.forEach(equipment => {
        const row = createEquipmentRow(equipment);
        tableBody.appendChild(row);
    });
}

/**
 * Create a table row for equipment
 */
function createEquipmentRow(equipment) {
    const tr = document.createElement('tr');
    
    // Get area name
    const area = allAreas.find(a => a.area_id === equipment.area_id);
    const areaName = area ? area.name : 'Unassigned';
    
    // Create status badge
    const statusBadgeClass = `status-${equipment.status || 'available'}`;
    const statusText = (equipment.status || 'available').replace('-', ' ').toUpperCase();
    const statusBadge = `<span class="status-badge ${statusBadgeClass}">${statusText}</span>`;
    
    // Format last updated
    const lastUpdated = equipment.updated_at ? new Date(equipment.updated_at).toLocaleDateString() : 'N/A';
    
    tr.innerHTML = `
        <td><strong>${equipment.name}</strong></td>
        <td>${equipment.serial_number || 'N/A'}</td>
        <td>${statusBadge}</td>
        <td>${areaName}</td>
        <td>${equipment.maintenance_notes || '-'}</td>
        <td>${lastUpdated}</td>
    `;
    
    return tr;
}

// ============================================
// STATISTICS
// ============================================

/**
 * Update statistics badges
 */
function updateStatistics() {
    // Material statistics
    const totalMaterials = allMaterials.length;
    const lowStockMaterials = allMaterials.filter(m => m.quantity < m.reorder_level).length;
    
    document.getElementById('materialCount').textContent = totalMaterials;
    document.getElementById('lowStockCount').textContent = lowStockMaterials;
    
    // Equipment statistics
    const totalEquipment = allEquipment.length;
    const availableEquipment = allEquipment.filter(e => e.status === 'available').length;
    
    document.getElementById('equipmentCount').textContent = totalEquipment;
    document.getElementById('availableCount').textContent = availableEquipment;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get area name by ID
 */
function getAreaName(areaId) {
    const area = allAreas.find(a => a.area_id === areaId);
    return area ? area.name : 'Unassigned';
}

/**
 * Check if material is low stock
 */
function isLowStock(material) {
    return material.quantity < material.reorder_level;
}

/**
 * Get equipment status label
 */
function getStatusLabel(status) {
    const labels = {
        'available': 'Available',
        'in-use': 'In Use',
        'maintenance': 'Under Maintenance',
        'retired': 'Retired'
    };
    return labels[status] || status;
}
