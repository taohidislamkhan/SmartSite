CREATE DATABASE IF NOT EXISTS area_mgmt;

USE area_mgmt;

CREATE TABLE IF NOT EXISTS User (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('engineer', 'worker') NOT NULL DEFAULT 'worker',
    area_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    FOREIGN KEY (area_id) REFERENCES Area(area_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS Engineer (
    engineer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(30),
    expertise VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS Area (
    area_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    location VARCHAR(255),
    boundary_size DECIMAL(12, 2),
    area_type VARCHAR(50),
    assigned_engineer_id INT,
    status ENUM('planned', 'active', 'completed', 'on-hold') NOT NULL DEFAULT 'planned',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_engineer (assigned_engineer_id),
    FOREIGN KEY (assigned_engineer_id) REFERENCES Engineer(engineer_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


ALTER TABLE User ADD FOREIGN KEY (area_id) REFERENCES Area(area_id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS Worker (
    worker_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    skill VARCHAR(100),
    cost_per_day DECIMAL(10, 2) DEFAULT 0.00,
    contact VARCHAR(80),
    current_area_id INT,
    
    INDEX idx_area (current_area_id),
    FOREIGN KEY (current_area_id) REFERENCES Area(area_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS Task (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    area_id INT NOT NULL,
    assigned_worker_id INT,
    title VARCHAR(250) NOT NULL,
    description TEXT,
    planned_start DATE,
    planned_end DATE,
    actual_start DATE,
    actual_end DATE,
    progress_percent INT DEFAULT 0 CHECK(progress_percent >= 0 AND progress_percent <= 100),
    status ENUM('pending', 'in-progress', 'completed', 'blocked') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_area (area_id),
    INDEX idx_worker (assigned_worker_id),
    INDEX idx_status (status),
    FOREIGN KEY (area_id) REFERENCES Area(area_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_worker_id) REFERENCES Worker(worker_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS Equipment (
    equipment_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150),
    serial_no VARCHAR(100),
    status ENUM('available', 'in-use', 'maintenance', 'retired') NOT NULL DEFAULT 'available',
    current_area_id INT,
    
    INDEX idx_area (current_area_id),
    INDEX idx_status (status),
    FOREIGN KEY (current_area_id) REFERENCES Area(area_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS Material (
    material_id INT AUTO_INCREMENT PRIMARY KEY,
    area_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    quantity DECIMAL(12, 3) DEFAULT 0,
    unit VARCHAR(30),
    unit_cost DECIMAL(12, 2) DEFAULT 0,
    reorder_threshold DECIMAL(12, 3) DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_area (area_id),
    FOREIGN KEY (area_id) REFERENCES Area(area_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS Cost (
    cost_id INT AUTO_INCREMENT PRIMARY KEY,
    area_id INT NOT NULL,
    type ENUM('material', 'labor', 'equipment', 'other') NOT NULL,
    amount DECIMAL(14, 2) NOT NULL,
    incurred_date DATE,
    description VARCHAR(255),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_area (area_id),
    INDEX idx_type (type),
    INDEX idx_date (incurred_date),
    FOREIGN KEY (area_id) REFERENCES Area(area_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS Budget (
    budget_id INT AUTO_INCREMENT PRIMARY KEY,
    area_id INT NOT NULL,
    estimated_budget DECIMAL(14, 2) NOT NULL,
    fiscal_year VARCHAR(4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_area (area_id),
    INDEX idx_year (fiscal_year),
    FOREIGN KEY (area_id) REFERENCES Area(area_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS SafetyIncident (
    incident_id INT AUTO_INCREMENT PRIMARY KEY,
    area_id INT NOT NULL,
    incident_date DATE NOT NULL,
    incident_type VARCHAR(150),
    severity ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'low',
    description TEXT,
    reported_by VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_area (area_id),
    INDEX idx_severity (severity),
    INDEX idx_date (incident_date),
    FOREIGN KEY (area_id) REFERENCES Area(area_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS Alert (
    alert_id INT AUTO_INCREMENT PRIMARY KEY,
    area_id INT,
    alert_type VARCHAR(100) NOT NULL,
    ref_table VARCHAR(64),
    ref_id INT,
    message VARCHAR(400),
    severity ENUM('info', 'warning', 'critical') NOT NULL DEFAULT 'warning',
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_area (area_id),
    INDEX idx_type (alert_type),
    INDEX idx_severity (severity),
    INDEX idx_resolved (is_resolved),
    FOREIGN KEY (area_id) REFERENCES Area(area_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS Schedule (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL UNIQUE,
    planned_start DATE,
    planned_end DATE,
    actual_start DATE,
    actual_end DATE,
    notes TEXT,
    
    INDEX idx_task (task_id),
    FOREIGN KEY (task_id) REFERENCES Task(task_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE OR REPLACE VIEW vw_delayed_tasks AS
SELECT 
    t.task_id,
    t.area_id,
    a.name AS area_name,
    t.title AS task_name,
    t.description,
    t.status,
    t.planned_start,
    t.planned_end,
    t.actual_start,
    t.actual_end,
    t.progress_percent,
    t.assigned_worker_id,
    w.name AS assigned_worker,
    DATEDIFF(NOW(), t.planned_end) AS days_overdue,
    CASE 
        WHEN DATEDIFF(NOW(), t.planned_end) > 30 THEN 'Critical'
        WHEN DATEDIFF(NOW(), t.planned_end) > 14 THEN 'High'
        WHEN DATEDIFF(NOW(), t.planned_end) > 7 THEN 'Medium'
        ELSE 'Low'
    END AS severity
FROM Task t
JOIN Area a ON t.area_id = a.area_id
LEFT JOIN Worker w ON t.assigned_worker_id = w.worker_id
WHERE t.status != 'completed' 
  AND t.planned_end < NOW()
ORDER BY days_overdue DESC;


CREATE OR REPLACE VIEW vw_low_material_stock AS
SELECT 
    m.material_id,
    m.area_id,
    a.name AS area_name,
    m.name AS material_name,
    m.quantity,
    m.unit,
    m.unit_cost,
    m.reorder_threshold,
    (m.reorder_threshold - m.quantity) AS units_needed,
    ROUND((m.reorder_threshold - m.quantity) * m.unit_cost, 2) AS reorder_cost,
    m.last_updated,
    CASE 
        WHEN m.quantity = 0 THEN 'Critical'
        WHEN m.quantity <= (m.reorder_threshold * 0.25) THEN 'High'
        WHEN m.quantity <= m.reorder_threshold THEN 'Medium'
        ELSE 'OK'
    END AS stock_level
FROM Material m
JOIN Area a ON m.area_id = a.area_id
WHERE m.quantity <= m.reorder_threshold
ORDER BY a.area_id, stock_level DESC, units_needed DESC;


CREATE OR REPLACE VIEW vw_cost_over_budget AS
SELECT 
    b.budget_id,
    b.area_id,
    a.name AS area_name,
    b.fiscal_year,
    b.estimated_budget,
    COALESCE(SUM(c.amount), 0) AS actual_cost,
    ROUND(b.estimated_budget - COALESCE(SUM(c.amount), 0), 2) AS remaining_budget,
    ROUND((COALESCE(SUM(c.amount), 0) / b.estimated_budget * 100), 2) AS utilization_percent,
    CASE 
        WHEN COALESCE(SUM(c.amount), 0) > b.estimated_budget THEN 'Over Budget'
        WHEN COALESCE(SUM(c.amount), 0) >= (b.estimated_budget * 0.85) THEN 'Caution'
        WHEN COALESCE(SUM(c.amount), 0) >= (b.estimated_budget * 0.70) THEN 'On Track'
        ELSE 'Under Budget'
    END AS budget_status,
    COUNT(DISTINCT c.cost_id) AS cost_entries,
    b.created_at
FROM Budget b
JOIN Area a ON b.area_id = a.area_id
LEFT JOIN Cost c ON b.area_id = c.area_id 
GROUP BY b.budget_id, b.area_id, a.name, b.fiscal_year, b.estimated_budget, b.created_at
ORDER BY b.area_id, b.fiscal_year DESC, utilization_percent DESC;


CREATE OR REPLACE VIEW vw_area_progress_summary AS
SELECT 
    a.area_id,
    a.name AS area_name,
    a.area_type,
    a.status,
    a.boundary_size,
    COUNT(DISTINCT t.task_id) AS total_tasks,
    COALESCE(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END), 0) AS completed_tasks,
    COALESCE(SUM(CASE WHEN t.status = 'in-progress' THEN 1 ELSE 0 END), 0) AS in_progress_tasks,
    COALESCE(SUM(CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END), 0) AS pending_tasks,
    COALESCE(SUM(CASE WHEN t.status = 'blocked' THEN 1 ELSE 0 END), 0) AS blocked_tasks,
    ROUND(CASE 
        WHEN COUNT(DISTINCT t.task_id) = 0 THEN 0
        ELSE (COALESCE(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END), 0) / COUNT(DISTINCT t.task_id) * 100)
    END, 2) AS overall_progress_percent,
    ROUND(AVG(COALESCE(t.progress_percent, 0)), 2) AS avg_task_progress,
    COUNT(DISTINCT w.worker_id) AS assigned_workers,
    COALESCE(SUM(w.cost_per_day), 0) AS total_worker_cost_per_day,
    COUNT(DISTINCT e.equipment_id) AS total_equipment,
    COALESCE(SUM(CASE WHEN e.status = 'in-use' THEN 1 ELSE 0 END), 0) AS equipment_in_use,
    COALESCE(SUM(CASE WHEN e.status = 'maintenance' THEN 1 ELSE 0 END), 0) AS equipment_maintenance,
    ROUND(COALESCE(SUM(c.amount), 0), 2) AS total_actual_cost,
    ROUND(COALESCE(SUM(b.estimated_budget), 0), 2) AS total_budgeted,
    COUNT(DISTINCT si.incident_id) AS safety_incidents,
    COALESCE(SUM(CASE WHEN si.severity = 'high' THEN 1 ELSE 0 END), 0) AS high_severity_incidents,
    COUNT(DISTINCT m.material_id) AS total_materials,
    COALESCE(SUM(CASE WHEN m.quantity <= m.reorder_threshold THEN 1 ELSE 0 END), 0) AS low_stock_materials,
    MAX(a.created_at) AS last_activity
FROM Area a
LEFT JOIN Task t ON a.area_id = t.area_id
LEFT JOIN Worker w ON a.area_id = w.current_area_id
LEFT JOIN Equipment e ON a.area_id = e.current_area_id
LEFT JOIN Cost c ON a.area_id = c.area_id
LEFT JOIN Budget b ON a.area_id = b.area_id
LEFT JOIN SafetyIncident si ON a.area_id = si.area_id
LEFT JOIN Material m ON a.area_id = m.area_id
GROUP BY a.area_id, a.name, a.area_type, a.status, a.boundary_size
ORDER BY overall_progress_percent DESC, a.area_id;


INSERT INTO Engineer (name, email, phone, expertise) VALUES
('John Smith', 'john.smith@company.com', '91-8901234567', 'Structural Engineering'),
('Sarah Johnson', 'sarah.johnson@company.com', '91-8902345678', 'Electrical Engineering'),
('Mike Davis', 'mike.davis@company.com', '91-8903456789', 'Civil Engineering'),
('Emily Wilson', 'emily.wilson@company.com', '91-8904567890', 'HVAC Engineering'),
('Robert Brown', 'robert.brown@company.com', '91-8905678901', 'Project Management'),
('Jennifer Lee', 'jennifer.lee@company.com', '91-8906789012', 'Materials Engineering'),
('David Martinez', 'david.martinez@company.com', '91-8907890123', 'Safety Engineering'),
('Lisa Anderson', 'lisa.anderson@company.com', '91-8908901234', 'Quality Assurance');


INSERT INTO Area (name, location, boundary_size, area_type, assigned_engineer_id, status) VALUES
('Foundation Area', 'Site A - East Wing', 1500.50, 'construction', 1, 'active'),
('Electrical Section', 'Site A - Ground Floor', 800.00, 'electrical', 2, 'active'),
('Plumbing Section', 'Site A - Basement', 600.25, 'plumbing', 3, 'planned'),
('Structural Steel', 'Site B - Tower', 2000.75, 'structural', 1, 'active'),
('Interior Finishing', 'Site A - Upper Floors', 1200.00, 'finishing', 4, 'planned'),
('HVAC Section', 'Site B - All Levels', 950.50, 'hvac', 4, 'planned'),
('Landscaping Area', 'Site A - Perimeter', 500.00, 'landscaping', 5, 'planned'),
('Security Systems', 'Site A - Central', 300.00, 'security', 6, 'planned'),
('Material Storage', 'Site A - Yard', 2500.00, 'storage', 5, 'active'),
('Concrete Foundation', 'Site C - Block 1', 3000.00, 'construction', 3, 'completed'),
('Roofing Section', 'Site B - Top Level', 1800.00, 'roofing', 2, 'planned'),
('Paint & Finishing', 'Site A - All Floors', 5000.00, 'finishing', 7, 'planned');


INSERT INTO User (email, password_hash, role, area_id) VALUES
('john.smith@company.com', '$2b$12$...hash...', 'engineer', NULL),
('sarah.johnson@company.com', '$2b$12$...hash...', 'engineer', NULL),
('mike.davis@company.com', '$2b$12$...hash...', 'engineer', NULL),
('worker1@company.com', '$2b$12$...hash...', 'worker', 1),
('worker2@company.com', '$2b$12$...hash...', 'worker', 2),
('worker3@company.com', '$2b$12$...hash...', 'worker', 3),
('worker4@company.com', '$2b$12$...hash...', 'worker', 1),
('worker5@company.com', '$2b$12$...hash...', 'worker', 2),
('worker6@company.com', '$2b$12$...hash...', 'worker', 4),
('worker7@company.com', '$2b$12$...hash...', 'worker', 5),
('worker8@company.com', '$2b$12$...hash...', 'worker', 6);


INSERT INTO Worker (name, skill, cost_per_day, contact, current_area_id) VALUES
('Ahmed Hassan', 'Excavation', 500.00, '91-8911111111', 1),
('Raj Patel', 'Electrical Wiring', 600.00, '91-8911111112', 2),
('Carlos Rodriguez', 'Plumbing', 550.00, '91-8911111113', 3),
('James Wilson', 'Excavation', 480.00, '91-8911111114', 1),
('Mohamed Ali', 'Electrical Panel', 620.00, '91-8911111115', 2),
('Antonio Giallo', 'Welding', 700.00, '91-8911111116', 4),
('Zhang Wei', 'Drywall', 400.00, '91-8911111117', 5),
('Yuki Tanaka', 'HVAC Systems', 750.00, '91-8911111118', 6),
('Sofia Santos', 'General Labor', 350.00, '91-8911111119', 1),
('Peter Mueller', 'Landscaping', 450.00, '91-8911111120', 7),
('Anna Kowalski', 'Piping', 600.00, '91-8911111121', 3),
('Marco Rossi', 'Security Systems', 500.00, '91-8911111122', 8),
('Olga Ivanova', 'Steel Welding', 680.00, '91-8911111123', 4),
('Nikos Papadopoulos', 'Cable Installation', 550.00, '91-8911111124', 2),
('Kenji Yamamoto', 'Interior Finishing', 520.00, '91-8911111125', 5);


INSERT INTO Task (area_id, assigned_worker_id, title, description, planned_start, planned_end, actual_start, progress_percent, status) VALUES
(1, 1, 'Excavation', 'Ground excavation and site preparation', '2024-02-15', '2024-03-15', '2024-02-15', 75, 'in-progress'),
(1, 4, 'Foundation Pouring', 'Concrete foundation preparation and pouring', '2024-03-15', '2024-03-20', NULL, 0, 'pending'),
(1, 1, 'Structural Column Setup', 'Set up support columns for structure', '2024-03-20', '2024-03-25', NULL, 0, 'pending'),
(2, 2, 'Electrical Wiring - Phase 1', 'Install primary electrical conduit', '2024-03-01', '2024-03-18', '2024-03-01', 60, 'in-progress'),
(2, 5, 'Power Panel Installation', 'Install main power distribution panel', '2024-03-18', '2024-03-28', NULL, 0, 'pending'),
(3, 3, 'Pipe Installation', 'Install plumbing pipes for water system', '2024-03-20', '2024-04-10', NULL, 0, 'pending'),
(3, 11, 'Drainage System Setup', 'Complete drainage and sewage system', '2024-04-10', '2024-04-15', NULL, 0, 'pending'),
(4, 6, 'Steel Frame Assembly', 'Assemble structural steel framework', '2024-03-01', '2024-03-30', '2024-03-01', 80, 'in-progress'),
(4, 6, 'Welding and Fitting', 'Complete welding of steel connections', '2024-03-30', '2024-04-05', NULL, 0, 'pending'),
(5, 7, 'Drywall Installation', 'Install interior drywall partitions', '2024-04-01', '2024-04-20', NULL, 0, 'pending'),
(5, 7, 'Painting Base Coats', 'Apply base coat paint to interior walls', '2024-04-20', '2024-04-25', NULL, 0, 'pending'),
(6, 8, 'HVAC Ductwork', 'Install HVAC distribution ductwork', '2024-03-25', '2024-04-22', NULL, 0, 'pending'),
(6, 8, 'AC Unit Installation', 'Install air conditioning units', '2024-04-22', '2024-04-28', NULL, 0, 'pending'),
(7, 10, 'Site Landscaping', 'Landscape and prepare exterior grounds', '2024-04-15', '2024-05-15', NULL, 0, 'pending'),
(8, 12, 'Security System Install', 'Install CCTV and security systems', '2024-04-01', '2024-04-30', NULL, 0, 'pending'),
(9, 13, 'Material Inventory Setup', 'Organize and catalog stored materials', '2024-02-20', '2024-03-31', '2024-02-20', 85, 'in-progress'),
(2, 14, 'Circuit Testing', 'Test electrical circuits and connections', '2024-03-25', '2024-04-01', NULL, 0, 'pending'),
(1, 9, 'Quality Inspection', 'Perform foundation quality inspection', '2024-03-20', '2024-03-22', NULL, 0, 'pending'),
(4, 15, 'Safety Inspection', 'Conduct structural safety inspection', '2024-04-01', '2024-04-08', NULL, 0, 'pending'),
(5, 7, 'Interior Finishing Details', 'Complete final interior details', '2024-04-25', '2024-05-01', NULL, 0, 'pending'),
(3, 3, 'Pressure Testing', 'Conduct pressure tests on plumbing', '2024-04-12', '2024-04-18', NULL, 0, 'pending'),
(2, 2, 'Final Electrical Inspection', 'Complete final electrical systems check', '2024-04-10', '2024-04-15', NULL, 0, 'pending'),
(1, 4, 'Site Cleanup', 'Clean and prepare site for next phase', '2024-03-23', '2024-03-25', NULL, 0, 'pending'),
(6, 8, 'Thermostat Programming', 'Program HVAC control systems', '2024-04-28', '2024-05-02', NULL, 0, 'pending'),
(9, 15, 'Equipment Maintenance', 'Routine maintenance of site equipment', '2024-03-10', '2024-03-20', '2024-03-10', 50, 'in-progress');


INSERT INTO Equipment (name, serial_no, status, current_area_id) VALUES
('Excavator CAT 320', 'CAT-EX-001', 'in-use', 1),
('Concrete Mixer CM500', 'CM-500-001', 'available', 1),
('Electrical Panel EB1000', 'EB-1000-001', 'in-use', 2),
('Power Drill Set', 'DRILL-SET-001', 'in-use', 2),
('Water Pump WP300', 'WP-300-001', 'available', 3),
('Welding Machine W2000', 'W-2000-001', 'in-use', 4),
('Air Compressor AC100', 'AC-100-001', 'maintenance', 5),
('Scaffolding Set', 'SCAFFOLD-001', 'in-use', 4),
('Safety Harness Kit', 'HARNESS-KIT-001', 'available', 1),
('Measuring Instruments Set', 'MEASURE-SET-001', 'available', 1);


INSERT INTO Material (area_id, name, quantity, unit, unit_cost, reorder_threshold) VALUES
(1, 'Portland Cement', 500, 'bags', 350.00, 100),
(1, 'Steel Rebar', 50, 'tons', 45000.00, 10),
(2, 'Electrical Cable', 5000, 'meters', 50.00, 1000),
(3, 'PVC Pipes', 2000, 'meters', 200.00, 500),
(5, 'Drywall Sheets', 1000, 'sheets', 500.00, 200),
(5, 'Paint', 500, 'liters', 300.00, 100),
(6, 'HVAC Ductwork', 300, 'meters', 1000.00, 50),
(3, 'Copper Tubing', 500, 'meters', 800.00, 100),
(6, 'Insulation Foam', 2000, 'sheets', 150.00, 400),
(5, 'Tiles', 5000, 'pieces', 100.00, 1000),
(1, 'Wood Framing', 100, 'pieces', 2000.00, 20),
(5, 'Glass Panes', 300, 'pieces', 1500.00, 50);

INSERT INTO Cost (area_id, type, amount, incurred_date, description) VALUES
(1, 'labor', 5000.00, '2024-02-15', 'Excavation Work'),
(1, 'material', 8000.00, '2024-02-20', 'Concrete Materials'),
(1, 'equipment', 1500.00, '2024-02-25', 'Equipment Rental'),
(2, 'labor', 6000.00, '2024-03-01', 'Electrical Installation Labor'),
(2, 'material', 4000.00, '2024-03-05', 'Electrical Materials'),
(3, 'material', 3000.00, '2024-03-10', 'Plumbing Materials'),
(3, 'labor', 4000.00, '2024-03-15', 'Plumbing Installation'),
(4, 'material', 15000.00, '2024-02-28', 'Steel Materials'),
(4, 'labor', 8000.00, '2024-03-10', 'Welding & Assembly Labor'),
(5, 'material', 5000.00, '2024-03-20', 'Finishing Materials'),
(6, 'material', 12000.00, '2024-03-15', 'HVAC Equipment'),
(6, 'labor', 7000.00, '2024-03-25', 'HVAC Installation'),
(7, 'material', 2000.00, '2024-04-01', 'Landscaping Materials'),
(9, 'equipment', 3000.00, '2024-02-01', 'Equipment Rental'),
(2, 'equipment', 2000.00, '2024-03-12', 'Testing Equipment');


INSERT INTO Budget (area_id, estimated_budget, fiscal_year) VALUES
(1, 50000.00, '2024'),
(2, 35000.00, '2024'),
(3, 25000.00, '2024'),
(4, 60000.00, '2024'),
(5, 40000.00, '2024'),
(6, 45000.00, '2024'),
(7, 15000.00, '2024'),
(8, 20000.00, '2024'),
(9, 30000.00, '2024'),
(10, 55000.00, '2024'),
(11, 42000.00, '2024'),
(12, 38000.00, '2024');


INSERT INTO SafetyIncident (area_id, incident_date, incident_type, severity, description, reported_by) VALUES
(1, '2024-03-01', 'Minor Cut', 'low', 'Minor cut during excavation work', 'Ahmed Hassan'),
(2, '2024-03-05', 'Electrical Hazard', 'medium', 'Near miss - electrical hazard detected', 'Raj Patel'),
(4, '2024-03-10', 'Equipment Malfunction', 'medium', 'Equipment malfunction during welding', 'Antonio Giallo'),
(1, '2024-03-08', 'Slip Hazard', 'low', 'Slip hazard in work area - cleaned and marked', 'Sofia Santos'),
(6, '2024-03-12', 'Ventilation Issue', 'high', 'Insufficient ventilation detected', 'Yuki Tanaka'),
(3, '2024-03-14', 'Chemical Exposure', 'medium', 'Minor chemical exposure - first aid provided', 'Carlos Rodriguez'),
(5, '2024-03-18', 'Fall Prevention', 'low', 'Safety harness issue - equipment replaced', 'Zhang Wei');


INSERT INTO Alert (area_id, alert_type, ref_table, ref_id, message, severity, is_resolved) VALUES
(1, 'material_low', 'Material', 1, 'Portland Cement stock running low', 'warning', FALSE),
(2, 'equipment_maintenance', 'Equipment', 3, 'Electrical Panel maintenance due', 'info', FALSE),
(3, 'material_low', 'Material', 4, 'PVC pipe supply below threshold', 'warning', FALSE),
(4, 'safety_alert', 'SafetyIncident', 3, 'Equipment safety inspection required', 'critical', FALSE),
(5, 'task_delay', 'Task', 10, 'Drywall task deadline approaching - 3 days', 'warning', FALSE),
(6, 'budget_alert', 'Budget', 6, 'Budget utilization at 47% - monitor spending', 'info', FALSE),
(9, 'maintenance', 'Equipment', 10, 'Equipment service due', 'info', TRUE),
(1, 'weather_alert', NULL, NULL, 'Heavy rain forecast - check drainage systems', 'warning', FALSE),
(4, 'cost_overrun', 'Cost', NULL, 'Area costs approaching 80% of budget', 'warning', FALSE),
(2, 'task_completion', 'Task', 4, 'Electrical Phase 1 at 60% completion', 'info', FALSE);


INSERT INTO Schedule (task_id, planned_start, planned_end, actual_start, notes) VALUES
(1, '2024-02-15', '2024-03-15', '2024-02-15', 'On track - weather dependent'),
(2, '2024-03-15', '2024-03-20', NULL, 'Waiting for excavation completion'),
(3, '2024-03-20', '2024-03-25', NULL, 'Requires foundation inspection approval'),
(4, '2024-03-01', '2024-03-18', '2024-03-01', 'Phase 1 - main circuit installation'),
(5, '2024-03-18', '2024-03-28', NULL, 'Critical path item - power distribution'),
(6, '2024-03-20', '2024-04-10', NULL, 'Supply dependent - waiting for materials'),
(7, '2024-04-10', '2024-04-15', NULL, 'Second phase - system testing'),
(8, '2024-03-01', '2024-03-30', '2024-03-01', 'High priority - structural safety critical'),
(9, '2024-03-30', '2024-04-05', NULL, 'Welding inspection required before completion'),
(10, '2024-04-01', '2024-04-20', NULL, 'Interior finishing - dependent on structural work'),
(11, '2024-04-20', '2024-04-25', NULL, 'Final touch - painting'),
(12, '2024-03-25', '2024-04-22', NULL, 'Environmental controls installation'),
(13, '2024-04-22', '2024-04-28', NULL, 'System testing and commissioning'),
(14, '2024-04-15', '2024-05-15', NULL, 'Weather dependent activity'),
(15, '2024-04-01', '2024-04-30', NULL, 'Safety systems - critical infrastructure');

