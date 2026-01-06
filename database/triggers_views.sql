-- ============================================================================
-- VIEWS FOR CONSTRUCTION AREA MANAGEMENT SYSTEM
-- Database: area_mgmt
-- Purpose: Encapsulate complex business logic at database layer
-- Benefits: Query optimization, reusability, security, performance
-- ============================================================================

-- ============================================================================
-- VIEW 1: DELAYED TASKS
-- ============================================================================
-- Purpose: Identify tasks that are past their planned end date
-- DBMS Benefit: Centralized business logic (overdue calculation)
-- Business Logic: Status != 'completed' AND planned_end_date < NOW()
-- Avoids: Duplicating date comparison in multiple API endpoints
-- ============================================================================

CREATE OR REPLACE VIEW vw_delayed_tasks AS
SELECT 
    t.task_id,
    t.area_id,
    a.area_name,
    t.task_name,
    t.description,
    t.task_type,
    t.status,
    t.planned_start_date,
    t.planned_end_date,
    t.actual_start_date,
    t.actual_end_date,
    t.progress_percent,
    t.assigned_worker_id,
    w.worker_name AS assigned_worker,
    DATEDIFF(NOW(), t.planned_end_date) AS days_overdue,
    CASE 
        WHEN DATEDIFF(NOW(), t.planned_end_date) > 30 THEN 'Critical'
        WHEN DATEDIFF(NOW(), t.planned_end_date) > 14 THEN 'High'
        WHEN DATEDIFF(NOW(), t.planned_end_date) > 7 THEN 'Medium'
        ELSE 'Low'
    END AS severity
FROM Task t
JOIN Area a ON t.area_id = a.area_id
LEFT JOIN Worker w ON t.assigned_worker_id = w.worker_id
WHERE t.status != 'completed' 
  AND t.planned_end_date < NOW()
ORDER BY days_overdue DESC;

-- ============================================================================
-- VIEW 2: LOW MATERIAL STOCK
-- ============================================================================
-- Purpose: Monitor materials below reorder threshold per area
-- DBMS Benefit: Avoids Python loop checking every material quantity
-- Business Logic: quantity <= reorder_threshold (database-level comparison)
-- Avoids: Fetching ALL materials then filtering in Python
-- ============================================================================

CREATE OR REPLACE VIEW vw_low_material_stock AS
SELECT 
    m.material_id,
    m.area_id,
    a.area_name,
    m.material_name,
    m.material_type,
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

-- ============================================================================
-- VIEW 3: COST OVER BUDGET PER AREA
-- ============================================================================
-- Purpose: Compare actual costs against budgeted amounts by area and fiscal year
-- DBMS Benefit: Pre-calculated aggregations (SUM, JOIN multiple tables)
-- Business Logic: Group costs by area, compare against budget budget in database
-- Avoids: Running multiple queries in Python and calculating variance
-- Query Optimization: Single query with proper JOINs and GROUP BY at DB level
-- ============================================================================

CREATE OR REPLACE VIEW vw_cost_over_budget AS
SELECT 
    b.budget_id,
    b.area_id,
    a.area_name,
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
ORDER BY b.area_id, b.fiscal_year DESC, utilization_percent DESC;

-- ============================================================================
-- VIEW 4: AREA PROGRESS SUMMARY
-- ============================================================================
-- Purpose: Aggregate progress metrics per area (tasks, workers, equipment status)
-- DBMS Benefit: Single view replaces multiple COUNT/SUM queries from Python
-- Business Logic: Progress calculation (completed tasks / total tasks * 100)
-- Avoids: Loop through tasks, equipment, workers in Python application
-- Query Optimization: Pre-aggregated data with CASE statements for status tracking
-- ============================================================================

CREATE OR REPLACE VIEW vw_area_progress_summary AS
SELECT 
    a.area_id,
    a.area_name,
    a.area_type,
    a.status,
    a.boundary_size,
    -- Task metrics
    COUNT(DISTINCT t.task_id) AS total_tasks,
    COALESCE(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END), 0) AS completed_tasks,
    COALESCE(SUM(CASE WHEN t.status = 'in-progress' THEN 1 ELSE 0 END), 0) AS in_progress_tasks,
    COALESCE(SUM(CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END), 0) AS pending_tasks,
    COALESCE(SUM(CASE WHEN t.status = 'blocked' THEN 1 ELSE 0 END), 0) AS blocked_tasks,
    -- Overall progress percentage
    ROUND(CASE 
        WHEN COUNT(DISTINCT t.task_id) = 0 THEN 0
        ELSE (COALESCE(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END), 0) / COUNT(DISTINCT t.task_id) * 100)
    END, 2) AS overall_progress_percent,
    -- Average task progress
    ROUND(AVG(CASE WHEN COUNT(DISTINCT t.task_id) > 0 THEN t.progress_percent ELSE 0 END), 2) AS avg_task_progress,
    -- Worker metrics
    COUNT(DISTINCT w.worker_id) AS assigned_workers,
    COALESCE(SUM(w.cost_per_day), 0) AS total_worker_cost_per_day,
    -- Equipment metrics
    COUNT(DISTINCT e.equipment_id) AS total_equipment,
    COALESCE(SUM(CASE WHEN e.status = 'in-use' THEN 1 ELSE 0 END), 0) AS equipment_in_use,
    COALESCE(SUM(CASE WHEN e.status = 'maintenance' THEN 1 ELSE 0 END), 0) AS equipment_maintenance,
    -- Cost metrics
    ROUND(COALESCE(SUM(c.amount), 0), 2) AS total_actual_cost,
    ROUND(COALESCE(SUM(b.estimated_budget), 0), 2) AS total_budgeted,
    -- Safety metrics
    COUNT(DISTINCT si.incident_id) AS safety_incidents,
    COALESCE(SUM(CASE WHEN si.severity = 'high' THEN 1 ELSE 0 END), 0) AS high_severity_incidents,
    -- Material metrics
    COUNT(DISTINCT m.material_id) AS total_materials,
    COALESCE(SUM(CASE WHEN m.quantity <= m.reorder_threshold THEN 1 ELSE 0 END), 0) AS low_stock_materials,
    -- Last update
    MAX(GREATEST(
        COALESCE(a.created_at, '2000-01-01'),
        COALESCE(MAX(t.actual_end_date), '2000-01-01'),
        COALESCE(MAX(c.incurred_date), '2000-01-01')
    )) AS last_activity
FROM Area a
LEFT JOIN Task t ON a.area_id = t.area_id
LEFT JOIN Worker w ON a.area_id = w.current_area_id
LEFT JOIN Equipment e ON a.area_id = e.current_area_id
LEFT JOIN Cost c ON a.area_id = c.area_id
LEFT JOIN Budget b ON a.area_id = b.area_id
LEFT JOIN SafetyIncident si ON a.area_id = si.area_id
LEFT JOIN Material m ON a.area_id = m.area_id
GROUP BY a.area_id, a.area_name, a.area_type, a.status, a.boundary_size
ORDER BY overall_progress_percent DESC, a.area_id;
