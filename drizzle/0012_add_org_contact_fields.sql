-- Add address, phone, and email columns to organizations table
ALTER TABLE organizations
  ADD COLUMN address TEXT,
  ADD COLUMN phone VARCHAR(50),
  ADD COLUMN email VARCHAR(320);