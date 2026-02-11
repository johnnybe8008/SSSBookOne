-- Add code fields to divisions, departments, and teams tables
-- Add departmentId to teams table and make description mandatory

-- 1. Add code column to divisions
ALTER TABLE divisions ADD COLUMN code VARCHAR(50) NOT NULL DEFAULT '' AFTER companyId;
ALTER TABLE divisions ADD UNIQUE INDEX divisions_code_unique (code);
ALTER TABLE divisions MODIFY COLUMN description TEXT NOT NULL;

-- 2. Add code column to departments  
ALTER TABLE departments ADD COLUMN code VARCHAR(50) NOT NULL DEFAULT '' AFTER divisionId;
ALTER TABLE departments ADD UNIQUE INDEX departments_code_unique (code);
ALTER TABLE departments MODIFY COLUMN description TEXT NOT NULL;

-- 3. Update teams table - add departmentId and code
ALTER TABLE teams ADD COLUMN departmentId INT NOT NULL DEFAULT 0 AFTER id;
ALTER TABLE teams ADD COLUMN code VARCHAR(50) NOT NULL DEFAULT '' AFTER departmentId;
ALTER TABLE teams ADD UNIQUE INDEX teams_code_unique (code);
ALTER TABLE teams MODIFY COLUMN description TEXT NOT NULL;

-- 4. Generate codes for existing records
UPDATE divisions SET code = CONCAT('DIV-', LPAD(id, 3, '0')) WHERE code = '';
UPDATE departments SET code = CONCAT('DEPT-', LPAD(id, 3, '0')) WHERE code = '';
UPDATE teams SET code = CONCAT('TEAM-', LPAD(id, 3, '0')) WHERE code = '';

-- 5. Remove default values now that existing records have codes
ALTER TABLE divisions ALTER COLUMN code DROP DEFAULT;
ALTER TABLE departments ALTER COLUMN code DROP DEFAULT;
ALTER TABLE teams ALTER COLUMN code DROP DEFAULT;
ALTER TABLE teams ALTER COLUMN departmentId DROP DEFAULT;
