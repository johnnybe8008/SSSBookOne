-- DoH Book One - Sample Data Seeding Script
-- This script populates the database with sample organizational data

-- Note: This assumes FSMs already exist in the database
-- Run with: pnpm tsx scripts/run-seed.ts

-- Insert Companies
INSERT INTO companies (name, address, contactPerson, contactEmail, contactPhone, createdBy, updatedBy) VALUES
('Department of Health - Central', '123 Main St, Capital City', 'John Smith', 'john.smith@doh.gov', '555-0101', 1, 1),
('Department of Health - Northern Region', '456 North Ave, Northern City', 'Jane Doe', 'jane.doe@doh.gov', '555-0102', 1, 1),
('Department of Health - Southern Region', '789 South Blvd, Southern City', 'Bob Johnson', 'bob.johnson@doh.gov', '555-0103', 1, 1);

-- Insert Divisions
INSERT INTO divisions (companyId, code, name, description, createdBy, updatedBy) VALUES
(1, 'DIV-001', 'Mental Health Services', 'Provides mental health counseling and support', 1, 1),
(1, 'DIV-002', 'Community Outreach', 'Community-based health programs', 1, 1),
(2, 'DIV-003', 'Mental Health Services', 'Provides mental health counseling and support', 1, 1),
(2, 'DIV-004', 'Family Services', 'Family counseling and support programs', 1, 1),
(3, 'DIV-005', 'Mental Health Services', 'Provides mental health counseling and support', 1, 1),
(3, 'DIV-006', 'Youth Services', 'Youth counseling and development programs', 1, 1);

-- Insert Departments
INSERT INTO departments (divisionId, code, name, description, createdBy, updatedBy) VALUES
(1, 'DEPT-001', 'Adult Counseling', 'Individual counseling for adults', 1, 1),
(1, 'DEPT-002', 'Crisis Intervention', 'Emergency mental health support', 1, 1),
(2, 'DEPT-003', 'Community Programs', 'Community-based initiatives', 1, 1),
(3, 'DEPT-004', 'Adult Counseling', 'Individual counseling for adults', 1, 1),
(3, 'DEPT-005', 'Group Therapy', 'Group counseling sessions', 1, 1),
(4, 'DEPT-006', 'Family Counseling', 'Family therapy and support', 1, 1),
(5, 'DEPT-007', 'Adult Counseling', 'Individual counseling for adults', 1, 1),
(6, 'DEPT-008', 'Youth Counseling', 'Counseling for young people', 1, 1);

-- Insert Company Teams
INSERT INTO companyTeams (departmentId, code, name, description, createdBy, updatedBy) VALUES
(1, 'CTEAM-001', 'Team Alpha', 'Primary counseling team', 1, 1),
(1, 'CTEAM-002', 'Team Beta', 'Secondary counseling team', 1, 1),
(2, 'CTEAM-003', 'Crisis Response Team', '24/7 crisis support', 1, 1),
(3, 'CTEAM-004', 'Community Engagement', 'Outreach specialists', 1, 1),
(4, 'CTEAM-005', 'Team North', 'Northern counseling team', 1, 1),
(5, 'CTEAM-006', 'Group Facilitators', 'Group therapy leaders', 1, 1),
(6, 'CTEAM-007', 'Family Support Team', 'Family counselors', 1, 1),
(7, 'CTEAM-008', 'Team South', 'Southern counseling team', 1, 1),
(8, 'CTEAM-009', 'Youth Advocates', 'Youth counseling specialists', 1, 1);

-- Insert Staff
INSERT INTO staff (teamId, name, role, email, phone, createdBy, updatedBy) VALUES
(1, 'Dr. Sarah Williams', 'Senior Counselor', 'sarah.williams@doh.gov', '555-1001', 1, 1),
(1, 'Michael Brown', 'Counselor', 'michael.brown@doh.gov', '555-1002', 1, 1),
(2, 'Dr. Emily Davis', 'Senior Counselor', 'emily.davis@doh.gov', '555-1003', 1, 1),
(3, 'James Wilson', 'Crisis Counselor', 'james.wilson@doh.gov', '555-1004', 1, 1),
(4, 'Lisa Martinez', 'Community Coordinator', 'lisa.martinez@doh.gov', '555-1005', 1, 1),
(5, 'Dr. Robert Taylor', 'Senior Counselor', 'robert.taylor@doh.gov', '555-1006', 1, 1),
(6, 'Jennifer Anderson', 'Group Therapist', 'jennifer.anderson@doh.gov', '555-1007', 1, 1),
(7, 'Dr. David Thomas', 'Family Therapist', 'david.thomas@doh.gov', '555-1008', 1, 1),
(8, 'Dr. Patricia Jackson', 'Senior Counselor', 'patricia.jackson@doh.gov', '555-1009', 1, 1),
(9, 'Christopher White', 'Youth Counselor', 'christopher.white@doh.gov', '555-1010', 1, 1);

-- Insert Clients
INSERT INTO clients (departmentId, name, dateOfBirth, mobilePhone, email, address, referralSourceId, referralSourceType, createdBy, updatedBy) VALUES
(1, 'Alice Johnson', '1985-03-15', '555-2001', 'alice.j@email.com', '123 Elm St, Capital City', 1, 'fsm', 1, 1),
(1, 'Robert Chen', '1978-07-22', '555-2002', 'robert.chen@email.com', '456 Oak Ave, Capital City', 1, 'staff', 1, 1),
(1, 'Maria Garcia', '1992-11-08', '555-2003', 'maria.g@email.com', '789 Pine Rd, Capital City', 2, 'fsm', 1, 1),
(2, 'David Smith', '1980-05-12', '555-2004', 'david.smith@email.com', '321 Maple Dr, Capital City', NULL, NULL, 1, 1),
(4, 'Emma Wilson', '1988-09-30', '555-2005', 'emma.w@email.com', '654 Birch Ln, Northern City', 1, 'fsm', 1, 1),
(4, 'James Brown', '1975-12-18', '555-2006', 'james.brown@email.com', '987 Cedar St, Northern City', 6, 'staff', 1, 1),
(5, 'Sophia Martinez', '1990-04-25', '555-2007', 'sophia.m@email.com', '147 Willow Way, Northern City', 2, 'fsm', 1, 1),
(6, 'Michael Lee', '1982-08-14', '555-2008', 'michael.lee@email.com', '258 Spruce Ave, Northern City', NULL, NULL, 1, 1),
(7, 'Olivia Taylor', '1987-06-03', '555-2009', 'olivia.t@email.com', '369 Ash Blvd, Southern City', 1, 'fsm', 1, 1),
(7, 'William Anderson', '1979-02-28', '555-2010', 'william.a@email.com', '741 Poplar Ct, Southern City', 9, 'staff', 1, 1),
(8, 'Ava Thompson', '2005-10-19', '555-2011', 'ava.t@email.com', '852 Hickory Rd, Southern City', 2, 'fsm', 1, 1),
(8, 'Ethan White', '2006-01-07', '555-2012', 'ethan.w@email.com', '963 Walnut St, Southern City', NULL, NULL, 1, 1);

-- Insert Cases
INSERT INTO cases (clientId, caseNumber, createdByStaffId, startDate, endDate, status, notes, createdBy, updatedBy) VALUES
(1, 'CASE-2026-0001', 1, '2026-01-15', NULL, 'Active', 'Initial case assessment for Alice Johnson', 1, 1),
(2, 'CASE-2026-0002', 2, '2026-01-16', NULL, 'On Hold', 'Initial case assessment for Robert Chen', 1, 1),
(3, 'CASE-2026-0003', 3, '2026-01-17', '2026-02-17', 'Closed', 'Initial case assessment for Maria Garcia', 1, 1),
(4, 'CASE-2026-0004', 4, '2026-01-18', NULL, 'Active', 'Initial case assessment for David Smith', 1, 1),
(5, 'CASE-2026-0005', 6, '2026-01-19', NULL, 'On Hold', 'Initial case assessment for Emma Wilson', 1, 1),
(6, 'CASE-2026-0006', 6, '2026-01-20', '2026-02-20', 'Closed', 'Initial case assessment for James Brown', 1, 1),
(7, 'CASE-2026-0007', 7, '2026-01-21', NULL, 'Active', 'Initial case assessment for Sophia Martinez', 1, 1),
(8, 'CASE-2026-0008', 8, '2026-01-22', NULL, 'On Hold', 'Initial case assessment for Michael Lee', 1, 1),
(9, 'CASE-2026-0009', 9, '2026-01-23', '2026-02-23', 'Closed', 'Initial case assessment for Olivia Taylor', 1, 1),
(10, 'CASE-2026-0010', 10, '2026-01-24', NULL, 'Active', 'Initial case assessment for William Anderson', 1, 1),
(11, 'CASE-2026-0011', 10, '2026-01-25', NULL, 'On Hold', 'Initial case assessment for Ava Thompson', 1, 1),
(12, 'CASE-2026-0012', 10, '2026-01-26', '2026-02-26', 'Closed', 'Initial case assessment for Ethan White', 1, 1);

-- Insert Sessions
INSERT INTO sessions (caseId, sessionNumber, sessionDate, duration, location, status, notes, conductedByStaffId, createdBy, updatedBy) VALUES
-- Case 1 sessions
(1, 1, '2026-01-20', 60, 'Room 101', 'Completed', 'Session 1 completed successfully. Client Alice Johnson showed good progress.', 1, 1, 1),
(1, 2, '2026-01-27', 60, 'Room 101', 'Completed', 'Session 2 completed successfully. Client Alice Johnson showed good progress.', 1, 1, 1),
(1, 3, '2026-02-03', 60, 'Room 101', 'Completed', 'Session 3 completed successfully. Client Alice Johnson showed good progress.', 1, 1, 1),
(1, 4, '2026-02-10', 60, 'Room 101', 'Scheduled', 'Upcoming session 4 scheduled for Alice Johnson.', 1, 1, 1),
-- Case 2 sessions
(2, 1, '2026-01-21', 60, 'Room 102', 'Completed', 'Session 1 completed successfully. Client Robert Chen showed good progress.', 2, 1, 1),
(2, 2, '2026-01-28', 60, 'Room 102', 'Cancelled', 'Session 2 cancelled.', 2, 1, 1),
(2, 3, '2026-02-04', 60, 'Room 102', 'Completed', 'Session 3 completed successfully. Client Robert Chen showed good progress.', 2, 1, 1),
(2, 4, '2026-02-11', 60, 'Room 102', 'Scheduled', 'Upcoming session 4 scheduled for Robert Chen.', 2, 1, 1),
-- Case 3 sessions
(3, 1, '2026-01-22', 60, 'Room 103', 'Completed', 'Session 1 completed successfully. Client Maria Garcia showed good progress.', 3, 1, 1),
(3, 2, '2026-01-29', 60, 'Room 103', 'Completed', 'Session 2 completed successfully. Client Maria Garcia showed good progress.', 3, 1, 1),
(3, 3, '2026-02-05', 60, 'Room 103', 'No Show', 'Session 3 no show.', 3, 1, 1),
(3, 4, '2026-02-12', 60, 'Room 103', 'Completed', 'Session 4 completed successfully. Client Maria Garcia showed good progress.', 3, 1, 1),
-- Case 4 sessions
(4, 1, '2026-01-23', 60, 'Room 104', 'Completed', 'Session 1 completed successfully. Client David Smith showed good progress.', 4, 1, 1),
(4, 2, '2026-01-30', 60, 'Room 104', 'Completed', 'Session 2 completed successfully. Client David Smith showed good progress.', 4, 1, 1),
(4, 3, '2026-02-06', 60, 'Room 104', 'Completed', 'Session 3 completed successfully. Client David Smith showed good progress.', 4, 1, 1),
(4, 4, '2026-02-13', 60, 'Room 104', 'Scheduled', 'Upcoming session 4 scheduled for David Smith.', 4, 1, 1),
-- Additional sessions for other cases (abbreviated)
(5, 1, '2026-01-24', 60, 'Room 105', 'Completed', 'Session completed.', 6, 1, 1),
(5, 2, '2026-01-31', 60, 'Room 105', 'Cancelled', 'Session cancelled.', 6, 1, 1),
(5, 3, '2026-02-07', 60, 'Room 105', 'Scheduled', 'Upcoming session.', 6, 1, 1),
(6, 1, '2026-01-25', 60, 'Room 101', 'Completed', 'Session completed.', 6, 1, 1),
(6, 2, '2026-02-01', 60, 'Room 101', 'Completed', 'Session completed.', 6, 1, 1),
(7, 1, '2026-01-26', 60, 'Room 102', 'Completed', 'Session completed.', 7, 1, 1),
(7, 2, '2026-02-02', 60, 'Room 102', 'Scheduled', 'Upcoming session.', 7, 1, 1),
(8, 1, '2026-01-27', 60, 'Room 103', 'Completed', 'Session completed.', 8, 1, 1),
(8, 2, '2026-02-03', 60, 'Room 103', 'No Show', 'Session no show.', 8, 1, 1),
(9, 1, '2026-01-28', 60, 'Room 104', 'Completed', 'Session completed.', 9, 1, 1),
(9, 2, '2026-02-04', 60, 'Room 104', 'Completed', 'Session completed.', 9, 1, 1),
(10, 1, '2026-01-29', 60, 'Room 105', 'Completed', 'Session completed.', 10, 1, 1),
(10, 2, '2026-02-05', 60, 'Room 105', 'Scheduled', 'Upcoming session.', 10, 1, 1),
(11, 1, '2026-01-30', 60, 'Room 101', 'Completed', 'Session completed.', 10, 1, 1),
(11, 2, '2026-02-06', 60, 'Room 101', 'Cancelled', 'Session cancelled.', 10, 1, 1),
(12, 1, '2026-01-31', 60, 'Room 102', 'Completed', 'Session completed.', 10, 1, 1),
(12, 2, '2026-02-07', 60, 'Room 102', 'Completed', 'Session completed.', 10, 1, 1);
