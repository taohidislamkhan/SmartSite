-- Sample Data for SmartSite DBMS
-- Load test data for development and testing

-- ============================================================================
-- AREA DATA
-- ============================================================================
INSERT INTO Area (name, location, boundary_size, area_type, status) VALUES
('Foundation Area', 'Site A - East Wing', 1500.50, 'construction', 'active'),
('Electrical Section', 'Site A - Ground Floor', 800.00, 'electrical', 'active'),
('Plumbing Section', 'Site A - Basement', 600.25, 'plumbing', 'planned'),
('Structural Steel', 'Site B - Tower', 2000.75, 'structural', 'active'),
('Interior Finishing', 'Site A - Upper Floors', 1200.00, 'finishing', 'planned'),
('HVAC Section', 'Site B - All Levels', 950.50, 'hvac', 'planned'),
('Landscaping Area', 'Site A - Perimeter', 500.00, 'landscaping', 'planned'),
('Security Systems', 'Site A - Central', 300.00, 'security', 'planned'),
('Material Storage', 'Site A - Yard', 2500.00, 'storage', 'active'),
('Concrete Foundation', 'Site C - Block 1', 3000.00, 'construction', 'completed'),
('Roofing Section', 'Site B - Top Level', 1800.00, 'roofing', 'planned'),
('Paint & Finishing', 'Site A - All Floors', 5000.00, 'finishing', 'planned');

-- ============================================================================
-- ENGINEER DATA
-- ============================================================================
INSERT INTO Engineer (name, email, specialty, experience_years) VALUES
('John Smith', 'john.smith@company.com', 'Structural Engineering', 15),
('Sarah Johnson', 'sarah.johnson@company.com', 'Electrical Engineering', 12),
('Mike Davis', 'mike.davis@company.com', 'Civil Engineering', 10),
('Emily Wilson', 'emily.wilson@company.com', 'HVAC Engineering', 8),
('Robert Brown', 'robert.brown@company.com', 'Project Management', 20),
('Jennifer Lee', 'jennifer.lee@company.com', 'Materials Engineering', 7),
('David Martinez', 'david.martinez@company.com', 'Safety Engineering', 9),
('Lisa Anderson', 'lisa.anderson@company.com', 'Quality Assurance', 6);

-- ============================================================================
-- WORKER DATA
-- ============================================================================
INSERT INTO Worker (name, email, area_id, skill_level, status) VALUES
('Ahmed Hassan', 'ahmed.hassan@company.com', 1, 'intermediate', 'active'),
('Raj Patel', 'raj.patel@company.com', 2, 'advanced', 'active'),
('Carlos Rodriguez', 'carlos.rodriguez@company.com', 3, 'beginner', 'active'),
('James Wilson', 'james.wilson@company.com', 1, 'intermediate', 'active'),
('Mohamed Ali', 'mohamed.ali@company.com', 2, 'advanced', 'active'),
('Antonio Giallo', 'antonio.giallo@company.com', 4, 'intermediate', 'active'),
('Zhang Wei', 'zhang.wei@company.com', 5, 'beginner', 'on-leave'),
('Yuki Tanaka', 'yuki.tanaka@company.com', 6, 'advanced', 'active'),
('Sofia Santos', 'sofia.santos@company.com', 1, 'beginner', 'active'),
('Peter Mueller', 'peter.mueller@company.com', 7, 'intermediate', 'active'),
('Anna Kowalski', 'anna.kowalski@company.com', 3, 'advanced', 'active'),
('Marco Rossi', 'marco.rossi@company.com', 8, 'intermediate', 'active'),
('Olga Ivanova', 'olga.ivanova@company.com', 4, 'advanced', 'active'),
('Nikos Papadopoulos', 'nikos.papadopoulos@company.com', 2, 'beginner', 'active'),
('Kenji Yamamoto', 'kenji.yamamoto@company.com', 5, 'intermediate', 'active');

-- ============================================================================
-- TASK DATA
-- ============================================================================
INSERT INTO Task (area_id, name, description, priority, status, assigned_worker_id, due_date) VALUES
(1, 'Excavation', 'Ground excavation and site preparation', 'high', 'in-progress', 1, '2024-03-15'),
(1, 'Foundation Pouring', 'Concrete foundation preparation and pouring', 'high', 'pending', 4, '2024-03-20'),
(1, 'Structural Column Setup', 'Set up support columns for structure', 'high', 'pending', 1, '2024-03-25'),
(2, 'Electrical Wiring - Phase 1', 'Install primary electrical conduit', 'medium', 'in-progress', 2, '2024-03-18'),
(2, 'Power Panel Installation', 'Install main power distribution panel', 'high', 'pending', 5, '2024-03-28'),
(3, 'Pipe Installation', 'Install plumbing pipes for water system', 'medium', 'pending', 3, '2024-04-10'),
(3, 'Drainage System Setup', 'Complete drainage and sewage system', 'medium', 'pending', 11, '2024-04-15'),
(4, 'Steel Frame Assembly', 'Assemble structural steel framework', 'high', 'in-progress', 6, '2024-03-30'),
(4, 'Welding and Fitting', 'Complete welding of steel connections', 'high', 'pending', 6, '2024-04-05'),
(5, 'Drywall Installation', 'Install interior drywall partitions', 'medium', 'pending', 7, '2024-04-20'),
(5, 'Painting Base Coats', 'Apply base coat paint to interior walls', 'medium', 'pending', 7, '2024-04-25'),
(6, 'HVAC Ductwork', 'Install HVAC distribution ductwork', 'medium', 'pending', 8, '2024-04-22'),
(6, 'AC Unit Installation', 'Install air conditioning units', 'medium', 'pending', 8, '2024-04-28'),
(7, 'Site Landscaping', 'Landscape and prepare exterior grounds', 'low', 'pending', 10, '2024-05-15'),
(8, 'Security System Install', 'Install CCTV and security systems', 'medium', 'pending', 12, '2024-04-30'),
(9, 'Material Inventory Setup', 'Organize and catalog stored materials', 'low', 'in-progress', 13, '2024-03-31'),
(2, 'Circuit Testing', 'Test electrical circuits and connections', 'medium', 'pending', 14, '2024-04-01'),
(1, 'Quality Inspection', 'Perform foundation quality inspection', 'high', 'pending', 9, '2024-03-22'),
(4, 'Safety Inspection', 'Conduct structural safety inspection', 'high', 'pending', 15, '2024-04-08'),
(5, 'Interior Finishing Details', 'Complete final interior details', 'medium', 'pending', 7, '2024-05-01'),
(3, 'Pressure Testing', 'Conduct pressure tests on plumbing', 'high', 'pending', 3, '2024-04-18'),
(2, 'Final Electrical Inspection', 'Complete final electrical systems check', 'high', 'pending', 2, '2024-04-15'),
(1, 'Site Cleanup', 'Clean and prepare site for next phase', 'low', 'pending', 4, '2024-03-25'),
(6, 'Thermostat Programming', 'Program HVAC control systems', 'medium', 'pending', 8, '2024-05-02'),
(9, 'Equipment Maintenance', 'Routine maintenance of site equipment', 'low', 'in-progress', 15, '2024-03-20');

-- ============================================================================
-- EQUIPMENT DATA
-- ============================================================================
INSERT INTO Equipment (name, equipment_type, area_id, purchase_date, status, maintenance_schedule) VALUES
('Excavator CAT 320', 'Heavy Machinery', 1, '2023-06-01', 'active', 'Monthly'),
('Concrete Mixer CM500', 'Machinery', 1, '2023-08-15', 'active', 'Weekly'),
('Electrical Panel EB1000', 'Electrical', 2, '2023-09-01', 'active', 'Quarterly'),
('Power Drill Set', 'Tools', 2, '2023-10-20', 'active', 'Monthly'),
('Water Pump WP300', 'Machinery', 3, '2023-07-10', 'active', 'Monthly'),
('Welding Machine W2000', 'Machinery', 4, '2023-05-25', 'active', 'Quarterly'),
('Air Compressor AC100', 'Machinery', 5, '2023-11-01', 'active', 'Monthly'),
('Scaffolding Set', 'Safety Equipment', 4, '2023-04-15', 'active', 'Weekly'),
('Safety Harness Kit', 'Safety Equipment', 1, '2023-12-01', 'active', 'Monthly'),
('Measuring Instruments Set', 'Tools', 1, '2024-01-10', 'active', 'Quarterly');

-- ============================================================================
-- MATERIAL DATA
-- ============================================================================
INSERT INTO Material (name, material_type, area_id, quantity, unit, supplier) VALUES
('Portland Cement', 'Concrete', 1, 500, 'bags', 'CemCorp Ltd'),
('Steel Rebar', 'Steel', 1, 50, 'tons', 'SteelMax Industries'),
('Electrical Cable', 'Electrical', 2, 5000, 'meters', 'ElectroSupply Inc'),
('PVC Pipes', 'Plumbing', 3, 2000, 'meters', 'PipePro Supplies'),
('Drywall Sheets', 'Building Materials', 5, 1000, 'sheets', 'ConstructMart'),
('Paint', 'Finishing', 5, 500, 'liters', 'ColorTech Paints'),
('HVAC Ductwork', 'HVAC', 6, 300, 'meters', 'ClimateCo Systems'),
('Copper Tubing', 'Plumbing', 3, 500, 'meters', 'CopperLine Supply'),
('Insulation Foam', 'Insulation', 6, 2000, 'sheets', 'ThermaFoam Corp'),
('Tiles', 'Finishing', 5, 5000, 'pieces', 'TileWorld Inc'),
('Wood Framing', 'Building Materials', 1, 100, 'pieces', 'LumberJack Supply'),
('Glass Panes', 'Windows', 5, 300, 'pieces', 'GlassPro Ltd');

-- ============================================================================
-- COST DATA
-- ============================================================================
INSERT INTO Cost (area_id, description, cost_amount, cost_category, date) VALUES
(1, 'Excavation Work', 5000.00, 'labor', '2024-02-15'),
(1, 'Concrete Materials', 8000.00, 'materials', '2024-02-20'),
(1, 'Safety Equipment', 1500.00, 'safety', '2024-02-25'),
(2, 'Electrical Installation Labor', 6000.00, 'labor', '2024-03-01'),
(2, 'Electrical Materials', 4000.00, 'materials', '2024-03-05'),
(3, 'Plumbing Materials', 3000.00, 'materials', '2024-03-10'),
(3, 'Plumbing Installation', 4000.00, 'labor', '2024-03-15'),
(4, 'Steel Materials', 15000.00, 'materials', '2024-02-28'),
(4, 'Welding & Assembly Labor', 8000.00, 'labor', '2024-03-10'),
(5, 'Finishing Materials', 5000.00, 'materials', '2024-03-20'),
(6, 'HVAC Equipment', 12000.00, 'materials', '2024-03-15'),
(6, 'HVAC Installation', 7000.00, 'labor', '2024-03-25'),
(7, 'Landscaping Materials', 2000.00, 'materials', '2024-04-01'),
(9, 'Equipment Rental', 3000.00, 'equipment', '2024-02-01');

-- ============================================================================
-- BUDGET DATA
-- ============================================================================
INSERT INTO Budget (area_id, total_budget, allocated_budget, spent_budget) VALUES
(1, 50000.00, 40000.00, 14500.00),
(2, 35000.00, 30000.00, 10000.00),
(3, 25000.00, 20000.00, 7000.00),
(4, 60000.00, 50000.00, 23000.00),
(5, 40000.00, 35000.00, 5000.00),
(6, 45000.00, 40000.00, 19000.00),
(7, 15000.00, 12000.00, 2000.00),
(8, 20000.00, 18000.00, 0.00),
(9, 30000.00, 25000.00, 3000.00),
(10, 55000.00, 55000.00, 55000.00);

-- ============================================================================
-- SCHEDULE DATA
-- ============================================================================
INSERT INTO Schedule (area_id, task_id, start_date, end_date, status, priority) VALUES
(1, 1, '2024-02-15', '2024-03-15', 'in-progress', 'high'),
(1, 2, '2024-03-15', '2024-03-20', 'pending', 'high'),
(1, 3, '2024-03-20', '2024-03-25', 'pending', 'high'),
(2, 4, '2024-03-01', '2024-03-18', 'in-progress', 'medium'),
(2, 5, '2024-03-18', '2024-03-28', 'pending', 'high'),
(3, 6, '2024-03-20', '2024-04-10', 'pending', 'medium'),
(3, 7, '2024-04-10', '2024-04-15', 'pending', 'medium'),
(4, 8, '2024-03-01', '2024-03-30', 'in-progress', 'high'),
(4, 9, '2024-03-30', '2024-04-05', 'pending', 'high'),
(5, 10, '2024-04-01', '2024-04-20', 'pending', 'medium'),
(6, 12, '2024-03-25', '2024-04-22', 'pending', 'medium'),
(7, 14, '2024-04-15', '2024-05-15', 'pending', 'low'),
(9, 16, '2024-02-20', '2024-03-31', 'in-progress', 'low');

-- ============================================================================
-- SAFETY INCIDENT DATA
-- ============================================================================
INSERT INTO SafetyIncident (area_id, description, severity, date_reported, status, corrective_action) VALUES
(1, 'Minor cut during excavation', 'low', '2024-03-01', 'resolved', 'First aid provided, worker trained on safety'),
(2, 'Near miss - electrical hazard', 'medium', '2024-03-05', 'in-review', 'Safety equipment upgraded, additional training scheduled'),
(4, 'Equipment malfunction during welding', 'medium', '2024-03-10', 'resolved', 'Equipment serviced and certified'),
(1, 'Slip hazard in work area', 'low', '2024-03-08', 'resolved', 'Area cleaned and marked with warning signs'),
(6, 'Insufficient ventilation reported', 'high', '2024-03-12', 'in-progress', 'Ventilation system upgrade in progress');

-- ============================================================================
-- ALERT DATA
-- ============================================================================
INSERT INTO Alert (area_id, alert_type, message, severity, status, created_date) VALUES
(1, 'weather', 'Heavy rain forecast - check drainage', 'medium', 'active', '2024-03-13'),
(2, 'equipment', 'Electrical panel maintenance due', 'low', 'active', '2024-03-14'),
(3, 'material', 'PVC pipe supply running low', 'medium', 'active', '2024-03-14'),
(4, 'safety', 'Fire safety inspection required', 'high', 'active', '2024-03-15'),
(5, 'schedule', 'Task deadline approaching - 3 days', 'medium', 'active', '2024-03-16'),
(6, 'budget', 'Budget threshold at 47% - monitor spending', 'low', 'active', '2024-03-16'),
(9, 'maintenance', 'Equipment service due', 'low', 'resolved', '2024-03-10');
