-- ============================================
-- WORKERS PAGE FIX - DATABASE MIGRATION
-- ============================================
-- 
-- This SQL script adds the necessary column to the Worker table
-- to support task assignment functionality in the Workers Management page
-- 
-- Run this on your MySQL database (area_mgmt):
-- mysql -u root -p area_mgmt < workers_migration.sql
--
-- Or execute the SQL manually in your MySQL client

-- Check if column already exists and add if not
ALTER TABLE `Worker` 
ADD COLUMN current_task_id INT NULL AFTER current_area_id,
ADD FOREIGN KEY (current_task_id) REFERENCES `Task` (task_id) ON DELETE SET NULL;

-- ============================================
-- Verification Query
-- ============================================
-- Run this to verify the migration was successful:
-- DESCRIBE Worker;
-- 
-- You should see both:
-- - current_area_id
-- - current_task_id
-- in the table structure
