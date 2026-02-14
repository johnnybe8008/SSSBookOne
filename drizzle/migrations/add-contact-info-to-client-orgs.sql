-- Add contact info columns to divisions table
ALTER TABLE divisions ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE divisions ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE divisions ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Add contact info columns to departments table (client org departments)
ALTER TABLE departments ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE departments ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE departments ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Add contact info columns to companyTeams table
ALTER TABLE companyTeams ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE companyTeams ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE companyTeams ADD COLUMN IF NOT EXISTS email VARCHAR(255);
