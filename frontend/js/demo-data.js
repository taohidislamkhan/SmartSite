/**
 * SmartSite Demo Data Reference
 * 
 * Complete list of all demo projects, areas, workers, and resources
 * for consistent implementation across all frontend pages
 */

// ============================================================================
// DEMO AREAS / PROJECTS
// ============================================================================
// These are the 12 demo construction areas in the system

const DEMO_AREAS = [
    {
        id: 1,
        name: "Foundation Area",
        location: "Site A - East Wing",
        size: "1500.50 sq ft",
        type: "construction",
        status: "active",
        description: "Ground excavation and concrete foundation work"
    },
    {
        id: 2,
        name: "Electrical Section",
        location: "Site A - Ground Floor",
        size: "800.00 sq ft",
        type: "electrical",
        status: "active",
        description: "Primary electrical wiring and distribution systems"
    },
    {
        id: 3,
        name: "Plumbing Section",
        location: "Site A - Basement",
        size: "600.25 sq ft",
        type: "plumbing",
        status: "planned",
        description: "Water supply and drainage system installation"
    },
    {
        id: 4,
        name: "Structural Steel",
        location: "Site B - Tower",
        size: "2000.75 sq ft",
        type: "structural",
        status: "active",
        description: "Steel frame assembly and welding operations"
    },
    {
        id: 5,
        name: "Interior Finishing",
        location: "Site A - Upper Floors",
        size: "1200.00 sq ft",
        type: "finishing",
        status: "planned",
        description: "Drywall, painting, and interior detail work"
    },
    {
        id: 6,
        name: "HVAC Section",
        location: "Site B - All Levels",
        size: "950.50 sq ft",
        type: "hvac",
        status: "planned",
        description: "Heating, ventilation, and air conditioning installation"
    },
    {
        id: 7,
        name: "Landscaping Area",
        location: "Site A - Perimeter",
        size: "500.00 sq ft",
        type: "landscaping",
        status: "planned",
        description: "Exterior grounds preparation and landscaping"
    },
    {
        id: 8,
        name: "Security Systems",
        location: "Site A - Central",
        size: "300.00 sq ft",
        type: "security",
        status: "planned",
        description: "CCTV and security system installation"
    },
    {
        id: 9,
        name: "Material Storage",
        location: "Site A - Yard",
        size: "2500.00 sq ft",
        type: "storage",
        status: "active",
        description: "Material inventory and storage management"
    },
    {
        id: 10,
        name: "Concrete Foundation",
        location: "Site C - Block 1",
        size: "3000.00 sq ft",
        type: "construction",
        status: "completed",
        description: "Foundation work - Phase 1 completed"
    },
    {
        id: 11,
        name: "Roofing Section",
        location: "Site B - Top Level",
        size: "1800.00 sq ft",
        type: "roofing",
        status: "planned",
        description: "Roof framing and covering installation"
    },
    {
        id: 12,
        name: "Paint & Finishing",
        location: "Site A - All Floors",
        size: "5000.00 sq ft",
        type: "finishing",
        status: "planned",
        description: "Interior and exterior painting and final details"
    }
];

// ============================================================================
// DEMO ENGINEERS
// ============================================================================

const DEMO_ENGINEERS = [
    {
        id: 1,
        name: "John Smith",
        email: "john.smith@company.com",
        phone: "555-0101",
        expertise: "Structural Engineering",
        experience: "15 years"
    },
    {
        id: 2,
        name: "Sarah Johnson",
        email: "sarah.johnson@company.com",
        phone: "555-0102",
        expertise: "Electrical Engineering",
        experience: "12 years"
    },
    {
        id: 3,
        name: "Mike Davis",
        email: "mike.davis@company.com",
        phone: "555-0103",
        expertise: "Civil Engineering",
        experience: "10 years"
    },
    {
        id: 4,
        name: "Emily Wilson",
        email: "emily.wilson@company.com",
        phone: "555-0104",
        expertise: "HVAC Engineering",
        experience: "8 years"
    },
    {
        id: 5,
        name: "Robert Brown",
        email: "robert.brown@company.com",
        phone: "555-0105",
        expertise: "Project Management",
        experience: "20 years"
    },
    {
        id: 6,
        name: "Jennifer Lee",
        email: "jennifer.lee@company.com",
        phone: "555-0106",
        expertise: "Materials Engineering",
        experience: "7 years"
    },
    {
        id: 7,
        name: "David Martinez",
        email: "david.martinez@company.com",
        phone: "555-0107",
        expertise: "Safety Engineering",
        experience: "9 years"
    },
    {
        id: 8,
        name: "Lisa Anderson",
        email: "lisa.anderson@company.com",
        phone: "555-0108",
        expertise: "Quality Assurance",
        experience: "6 years"
    }
];

// ============================================================================
// DEMO WORKERS
// ============================================================================

const DEMO_WORKERS = [
    {
        id: 1,
        name: "Ahmed Hassan",
        skill: "Intermediate",
        costPerDay: 150.00,
        assignedArea: "Foundation Area",
        status: "active",
        contact: "555-1001"
    },
    {
        id: 2,
        name: "Raj Patel",
        skill: "Advanced",
        costPerDay: 200.00,
        assignedArea: "Electrical Section",
        status: "active",
        contact: "555-1002"
    },
    {
        id: 3,
        name: "Carlos Rodriguez",
        skill: "Beginner",
        costPerDay: 100.00,
        assignedArea: "Plumbing Section",
        status: "active",
        contact: "555-1003"
    },
    {
        id: 4,
        name: "James Wilson",
        skill: "Intermediate",
        costPerDay: 150.00,
        assignedArea: "Foundation Area",
        status: "active",
        contact: "555-1004"
    },
    {
        id: 5,
        name: "Mohamed Ali",
        skill: "Advanced",
        costPerDay: 200.00,
        assignedArea: "Electrical Section",
        status: "active",
        contact: "555-1005"
    },
    {
        id: 6,
        name: "Antonio Giallo",
        skill: "Intermediate",
        costPerDay: 150.00,
        assignedArea: "Structural Steel",
        status: "active",
        contact: "555-1006"
    },
    {
        id: 7,
        name: "Zhang Wei",
        skill: "Beginner",
        costPerDay: 100.00,
        assignedArea: "Interior Finishing",
        status: "on-leave",
        contact: "555-1007"
    },
    {
        id: 8,
        name: "Yuki Tanaka",
        skill: "Advanced",
        costPerDay: 200.00,
        assignedArea: "HVAC Section",
        status: "active",
        contact: "555-1008"
    },
    {
        id: 9,
        name: "Sofia Santos",
        skill: "Beginner",
        costPerDay: 100.00,
        assignedArea: "Foundation Area",
        status: "active",
        contact: "555-1009"
    },
    {
        id: 10,
        name: "Peter Mueller",
        skill: "Intermediate",
        costPerDay: 150.00,
        assignedArea: "Landscaping Area",
        status: "active",
        contact: "555-1010"
    },
    {
        id: 11,
        name: "Anna Kowalski",
        skill: "Advanced",
        costPerDay: 200.00,
        assignedArea: "Plumbing Section",
        status: "active",
        contact: "555-1011"
    },
    {
        id: 12,
        name: "Marco Rossi",
        skill: "Intermediate",
        costPerDay: 150.00,
        assignedArea: "Security Systems",
        status: "active",
        contact: "555-1012"
    },
    {
        id: 13,
        name: "Olga Ivanova",
        skill: "Advanced",
        costPerDay: 200.00,
        assignedArea: "Structural Steel",
        status: "active",
        contact: "555-1013"
    },
    {
        id: 14,
        name: "Nikos Papadopoulos",
        skill: "Beginner",
        costPerDay: 100.00,
        assignedArea: "Electrical Section",
        status: "active",
        contact: "555-1014"
    },
    {
        id: 15,
        name: "Kenji Yamamoto",
        skill: "Intermediate",
        costPerDay: 150.00,
        assignedArea: "Interior Finishing",
        status: "active",
        contact: "555-1015"
    }
];

// ============================================================================
// DEMO MATERIALS
// ============================================================================

const DEMO_MATERIALS = [
    {
        id: 1,
        name: "Portland Cement",
        type: "Concrete",
        area: "Foundation Area",
        quantity: 500,
        unit: "bags",
        supplier: "CemCorp Ltd",
        unitCost: 25.00,
        reorderThreshold: 100
    },
    {
        id: 2,
        name: "Steel Rebar",
        type: "Steel",
        area: "Foundation Area",
        quantity: 50,
        unit: "tons",
        supplier: "SteelMax Industries",
        unitCost: 500.00,
        reorderThreshold: 10
    },
    {
        id: 3,
        name: "Electrical Cable",
        type: "Electrical",
        area: "Electrical Section",
        quantity: 5000,
        unit: "meters",
        supplier: "ElectroSupply Inc",
        unitCost: 2.50,
        reorderThreshold: 1000
    },
    {
        id: 4,
        name: "PVC Pipes",
        type: "Plumbing",
        area: "Plumbing Section",
        quantity: 2000,
        unit: "meters",
        supplier: "PipePro Supplies",
        unitCost: 5.00,
        reorderThreshold: 500
    },
    {
        id: 5,
        name: "Drywall Sheets",
        type: "Building Materials",
        area: "Interior Finishing",
        quantity: 1000,
        unit: "sheets",
        supplier: "ConstructMart",
        unitCost: 15.00,
        reorderThreshold: 200
    },
    {
        id: 6,
        name: "Paint",
        type: "Finishing",
        area: "Interior Finishing",
        quantity: 500,
        unit: "liters",
        supplier: "ColorTech Paints",
        unitCost: 20.00,
        reorderThreshold: 100
    },
    {
        id: 7,
        name: "HVAC Ductwork",
        type: "HVAC",
        area: "HVAC Section",
        quantity: 300,
        unit: "meters",
        supplier: "ClimateCo Systems",
        unitCost: 50.00,
        reorderThreshold: 50
    },
    {
        id: 8,
        name: "Copper Tubing",
        type: "Plumbing",
        area: "Plumbing Section",
        quantity: 500,
        unit: "meters",
        supplier: "CopperLine Supply",
        unitCost: 30.00,
        reorderThreshold: 100
    },
    {
        id: 9,
        name: "Insulation Foam",
        type: "Insulation",
        area: "HVAC Section",
        quantity: 2000,
        unit: "sheets",
        supplier: "ThermaFoam Corp",
        unitCost: 8.00,
        reorderThreshold: 400
    },
    {
        id: 10,
        name: "Tiles",
        type: "Finishing",
        area: "Interior Finishing",
        quantity: 5000,
        unit: "pieces",
        supplier: "TileWorld Inc",
        unitCost: 2.00,
        reorderThreshold: 1000
    },
    {
        id: 11,
        name: "Wood Framing",
        type: "Building Materials",
        area: "Foundation Area",
        quantity: 100,
        unit: "pieces",
        supplier: "LumberJack Supply",
        unitCost: 50.00,
        reorderThreshold: 20
    },
    {
        id: 12,
        name: "Glass Panes",
        type: "Windows",
        area: "Interior Finishing",
        quantity: 300,
        unit: "pieces",
        supplier: "GlassPro Ltd",
        unitCost: 100.00,
        reorderThreshold: 50
    }
];

// ============================================================================
// DEMO EQUIPMENT
// ============================================================================

const DEMO_EQUIPMENT = [
    {
        id: 1,
        name: "Excavator CAT 320",
        type: "Heavy Machinery",
        area: "Foundation Area",
        status: "active",
        serialNumber: "CAT-320-001",
        purchaseDate: "2023-06-01",
        maintenanceSchedule: "Monthly"
    },
    {
        id: 2,
        name: "Concrete Mixer CM500",
        type: "Machinery",
        area: "Foundation Area",
        status: "active",
        serialNumber: "CM-500-001",
        purchaseDate: "2023-08-15",
        maintenanceSchedule: "Weekly"
    },
    {
        id: 3,
        name: "Electrical Panel EB1000",
        type: "Electrical",
        area: "Electrical Section",
        status: "active",
        serialNumber: "EB-1000-001",
        purchaseDate: "2023-09-01",
        maintenanceSchedule: "Quarterly"
    },
    {
        id: 4,
        name: "Power Drill Set",
        type: "Tools",
        area: "Electrical Section",
        status: "active",
        serialNumber: "PDS-001",
        purchaseDate: "2023-10-20",
        maintenanceSchedule: "Monthly"
    },
    {
        id: 5,
        name: "Water Pump WP300",
        type: "Machinery",
        area: "Plumbing Section",
        status: "active",
        serialNumber: "WP-300-001",
        purchaseDate: "2023-07-10",
        maintenanceSchedule: "Monthly"
    },
    {
        id: 6,
        name: "Welding Machine W2000",
        type: "Machinery",
        area: "Structural Steel",
        status: "active",
        serialNumber: "W2K-001",
        purchaseDate: "2023-05-25",
        maintenanceSchedule: "Quarterly"
    },
    {
        id: 7,
        name: "Air Compressor AC100",
        type: "Machinery",
        area: "Interior Finishing",
        status: "active",
        serialNumber: "AC-100-001",
        purchaseDate: "2023-11-01",
        maintenanceSchedule: "Monthly"
    },
    {
        id: 8,
        name: "Scaffolding Set",
        type: "Safety Equipment",
        area: "Structural Steel",
        status: "active",
        serialNumber: "SCAF-SET-001",
        purchaseDate: "2023-04-15",
        maintenanceSchedule: "Weekly"
    },
    {
        id: 9,
        name: "Safety Harness Kit",
        type: "Safety Equipment",
        area: "Foundation Area",
        status: "active",
        serialNumber: "SHK-001",
        purchaseDate: "2023-12-01",
        maintenanceSchedule: "Monthly"
    },
    {
        id: 10,
        name: "Measuring Instruments Set",
        type: "Tools",
        area: "Foundation Area",
        status: "active",
        serialNumber: "MIS-001",
        purchaseDate: "2024-01-10",
        maintenanceSchedule: "Quarterly"
    }
];

// ============================================================================
// DEMO COSTS
// ============================================================================

const DEMO_COSTS = [
    { area: "Foundation Area", type: "Labor", amount: 5000.00, category: "labor" },
    { area: "Foundation Area", type: "Materials", amount: 8000.00, category: "materials" },
    { area: "Foundation Area", type: "Safety Equipment", amount: 1500.00, category: "safety" },
    { area: "Electrical Section", type: "Installation Labor", amount: 6000.00, category: "labor" },
    { area: "Electrical Section", type: "Materials", amount: 4000.00, category: "materials" },
    { area: "Plumbing Section", type: "Materials", amount: 3000.00, category: "materials" },
    { area: "Plumbing Section", type: "Installation", amount: 4000.00, category: "labor" },
    { area: "Structural Steel", type: "Materials", amount: 15000.00, category: "materials" },
    { area: "Structural Steel", type: "Labor", amount: 8000.00, category: "labor" },
    { area: "Interior Finishing", type: "Materials", amount: 5000.00, category: "materials" },
    { area: "HVAC Section", type: "Equipment", amount: 12000.00, category: "materials" },
    { area: "HVAC Section", type: "Installation", amount: 7000.00, category: "labor" },
    { area: "Landscaping Area", type: "Materials", amount: 2000.00, category: "materials" },
    { area: "Material Storage", type: "Equipment Rental", amount: 3000.00, category: "equipment" }
];

// ============================================================================
// DEMO TASKS
// ============================================================================

const DEMO_TASKS = [
    {
        id: 1,
        area: "Foundation Area",
        name: "Excavation",
        description: "Ground excavation and site preparation",
        plannedStart: "2024-02-15",
        plannedEnd: "2024-03-15",
        assignedWorker: "Ahmed Hassan",
        status: "in-progress",
        progress: 75
    },
    {
        id: 2,
        area: "Foundation Area",
        name: "Foundation Pouring",
        description: "Concrete foundation preparation and pouring",
        plannedStart: "2024-03-15",
        plannedEnd: "2024-03-20",
        assignedWorker: "James Wilson",
        status: "pending",
        progress: 0
    },
    {
        id: 3,
        area: "Electrical Section",
        name: "Electrical Wiring - Phase 1",
        description: "Install primary electrical conduit",
        plannedStart: "2024-03-01",
        plannedEnd: "2024-03-18",
        assignedWorker: "Raj Patel",
        status: "in-progress",
        progress: 50
    },
    {
        id: 4,
        area: "Electrical Section",
        name: "Power Panel Installation",
        description: "Install main power distribution panel",
        plannedStart: "2024-03-18",
        plannedEnd: "2024-03-28",
        assignedWorker: "Mohamed Ali",
        status: "pending",
        progress: 0
    },
    {
        id: 5,
        area: "Plumbing Section",
        name: "Pipe Installation",
        description: "Install plumbing pipes for water system",
        plannedStart: "2024-03-20",
        plannedEnd: "2024-04-10",
        assignedWorker: "Carlos Rodriguez",
        status: "pending",
        progress: 20
    }
];

// ============================================================================
// DEMO BUDGETS
// ============================================================================

const DEMO_BUDGETS = [
    { area: "Foundation Area", totalBudget: 50000.00, allocated: 40000.00, spent: 14500.00 },
    { area: "Electrical Section", totalBudget: 35000.00, allocated: 30000.00, spent: 10000.00 },
    { area: "Plumbing Section", totalBudget: 25000.00, allocated: 20000.00, spent: 7000.00 },
    { area: "Structural Steel", totalBudget: 60000.00, allocated: 50000.00, spent: 23000.00 },
    { area: "Interior Finishing", totalBudget: 40000.00, allocated: 35000.00, spent: 5000.00 },
    { area: "HVAC Section", totalBudget: 45000.00, allocated: 40000.00, spent: 19000.00 },
    { area: "Landscaping Area", totalBudget: 15000.00, allocated: 12000.00, spent: 2000.00 },
    { area: "Security Systems", totalBudget: 20000.00, allocated: 18000.00, spent: 0.00 },
    { area: "Material Storage", totalBudget: 30000.00, allocated: 25000.00, spent: 3000.00 },
    { area: "Concrete Foundation", totalBudget: 55000.00, allocated: 55000.00, spent: 55000.00 }
];

// ============================================================================
// DEMO ALERTS
// ============================================================================

const DEMO_ALERTS = [
    {
        id: 1,
        area: "Foundation Area",
        type: "Weather",
        message: "Heavy rain forecast - check drainage",
        severity: "medium",
        status: "active",
        date: "2024-03-13"
    },
    {
        id: 2,
        area: "Electrical Section",
        type: "Equipment",
        message: "Electrical panel maintenance due",
        severity: "low",
        status: "active",
        date: "2024-03-14"
    },
    {
        id: 3,
        area: "Plumbing Section",
        type: "Material",
        message: "PVC pipe supply running low",
        severity: "medium",
        status: "active",
        date: "2024-03-14"
    },
    {
        id: 4,
        area: "Structural Steel",
        type: "Safety",
        message: "Fire safety inspection required",
        severity: "high",
        status: "active",
        date: "2024-03-15"
    },
    {
        id: 5,
        area: "Interior Finishing",
        type: "Schedule",
        message: "Task deadline approaching - 3 days",
        severity: "medium",
        status: "active",
        date: "2024-03-16"
    },
    {
        id: 6,
        area: "HVAC Section",
        type: "Budget",
        message: "Budget threshold at 47% - monitor spending",
        severity: "low",
        status: "active",
        date: "2024-03-16"
    },
    {
        id: 7,
        area: "Material Storage",
        type: "Maintenance",
        message: "Equipment service due",
        severity: "low",
        status: "resolved",
        date: "2024-03-10"
    }
];

// ============================================================================
// DEMO SAFETY INCIDENTS
// ============================================================================

const DEMO_SAFETY_INCIDENTS = [
    {
        id: 1,
        area: "Foundation Area",
        description: "Minor cut during excavation",
        severity: "low",
        date: "2024-03-01",
        status: "resolved",
        correctiveAction: "First aid provided, worker trained on safety"
    },
    {
        id: 2,
        area: "Electrical Section",
        description: "Near miss - electrical hazard",
        severity: "medium",
        date: "2024-03-05",
        status: "in-review",
        correctiveAction: "Safety equipment upgraded, additional training scheduled"
    },
    {
        id: 3,
        area: "Structural Steel",
        description: "Equipment malfunction during welding",
        severity: "medium",
        date: "2024-03-10",
        status: "resolved",
        correctiveAction: "Equipment serviced and certified"
    },
    {
        id: 4,
        area: "Foundation Area",
        description: "Slip hazard in work area",
        severity: "low",
        date: "2024-03-08",
        status: "resolved",
        correctiveAction: "Area cleaned and marked with warning signs"
    },
    {
        id: 5,
        area: "HVAC Section",
        description: "Insufficient ventilation reported",
        severity: "high",
        date: "2024-03-12",
        status: "in-progress",
        correctiveAction: "Ventilation system upgrade in progress"
    }
];

/**
 * Export for use in other scripts
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DEMO_AREAS,
        DEMO_ENGINEERS,
        DEMO_WORKERS,
        DEMO_MATERIALS,
        DEMO_EQUIPMENT,
        DEMO_COSTS,
        DEMO_TASKS,
        DEMO_BUDGETS,
        DEMO_ALERTS,
        DEMO_SAFETY_INCIDENTS
    };
}
