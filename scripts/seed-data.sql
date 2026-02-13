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

-- Insert Session Types
INSERT INTO sessionTypes (name, description, createdBy, updatedBy) VALUES
('Individual Counseling', 'One-on-one counseling session', 1, 1),
('Group Therapy', 'Group counseling session', 1, 1),
('Family Counseling', 'Family therapy session', 1, 1),
('Crisis Intervention', 'Emergency mental health support', 1, 1),
('Assessment', 'Initial client assessment', 1, 1),
('Follow-up', 'Follow-up session', 1, 1);

-- Insert Session Statuses
INSERT INTO sessionStatuses (name, description, createdBy, updatedBy) VALUES
('Scheduled', 'Session is scheduled', 1, 1),
('Completed', 'Session was completed', 1, 1),
('Cancelled', 'Session was cancelled', 1, 1),
('No Show', 'Client did not attend', 1, 1),
('Rescheduled', 'Session was rescheduled', 1, 1);

-- Insert Session Results
INSERT INTO sessionResults (name, description, createdBy, updatedBy) VALUES
('Excellent Progress', 'Client showed excellent progress', 1, 1),
('Good Progress', 'Client showed good progress', 1, 1),
('Some Progress', 'Client showed some progress', 1, 1),
('No Progress', 'No significant progress', 1, 1),
('Needs Follow-up', 'Client needs additional follow-up', 1, 1);

-- Insert Sessions
INSERT INTO sessions (caseId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionEndTime, sessionDuration, billableHours, notes, completedAt, createdBy, updatedBy) VALUES
-- Case 1 sessions (Alice Johnson - Individual Counseling)
(1, 1, 1, 1, 2, 2, '2026-01-20 10:00:00', '2026-01-20 11:00:00', 60, '1.0', 'Session 1 completed successfully. Client showed good progress.', '2026-01-20 11:00:00', 1, 1),
(1, 1, 1, 1, 2, 2, '2026-01-27 10:00:00', '2026-01-27 11:00:00', 60, '1.0', 'Session 2 completed successfully. Client showed good progress.', '2026-01-27 11:00:00', 1, 1),
(1, 1, 1, 1, 2, 2, '2026-02-03 10:00:00', '2026-02-03 11:00:00', 60, '1.0', 'Session 3 completed successfully. Client showed good progress.', '2026-02-03 11:00:00', 1, 1),
(1, 1, 1, 1, 1, NULL, '2026-02-10 10:00:00', NULL, NULL, NULL, 'Upcoming session 4 scheduled.', NULL, 1, 1),
-- Case 2 sessions (Robert Chen)
(2, 2, 2, 1, 2, 2, '2026-01-21 14:00:00', '2026-01-21 15:00:00', 60, '1.0', 'Session completed successfully.', '2026-01-21 15:00:00', 1, 1),
(2, 2, 2, 1, 3, NULL, '2026-01-28 14:00:00', NULL, NULL, NULL, 'Session cancelled.', NULL, 1, 1),
(2, 2, 2, 1, 2, 2, '2026-02-04 14:00:00', '2026-02-04 15:00:00', 60, '1.0', 'Session completed successfully.', '2026-02-04 15:00:00', 1, 1),
-- Case 3 sessions (Maria Garcia)
(3, 3, 3, 1, 2, 2, '2026-01-22 09:00:00', '2026-01-22 10:00:00', 60, '1.0', 'Session completed successfully.', '2026-01-22 10:00:00', 1, 1),
(3, 3, 3, 1, 4, NULL, '2026-02-05 09:00:00', NULL, NULL, NULL, 'Client did not show up.', NULL, 1, 1),
-- Case 4 sessions (David Smith - Crisis)
(4, 4, 4, 4, 2, 1, '2026-01-23 16:00:00', '2026-01-23 17:30:00', 90, '1.5', 'Crisis intervention session. Excellent progress.', '2026-01-23 17:30:00', 1, 1),
(4, 4, 4, 1, 2, 2, '2026-01-30 16:00:00', '2026-01-30 17:00:00', 60, '1.0', 'Follow-up session completed.', '2026-01-30 17:00:00', 1, 1),
-- Case 5 sessions (Emma Wilson)
(5, 5, 6, 1, 2, 2, '2026-01-24 11:00:00', '2026-01-24 12:00:00', 60, '1.0', 'Session completed.', '2026-01-24 12:00:00', 1, 1),
(5, 5, 6, 1, 3, NULL, '2026-01-31 11:00:00', NULL, NULL, NULL, 'Session cancelled by client.', NULL, 1, 1),
-- Case 6 sessions (James Brown)
(6, 6, 6, 1, 2, 2, '2026-01-25 13:00:00', '2026-01-25 14:00:00', 60, '1.0', 'Session completed.', '2026-01-25 14:00:00', 1, 1),
(6, 6, 6, 1, 2, 1, '2026-02-01 13:00:00', '2026-02-01 14:00:00', 60, '1.0', 'Excellent progress shown.', '2026-02-01 14:00:00', 1, 1),
-- Case 7 sessions (Sophia Martinez - Group Therapy)
(7, 7, 7, 2, 2, 2, '2026-01-26 15:00:00', '2026-01-26 16:30:00', 90, '1.5', 'Group therapy session completed.', '2026-01-26 16:30:00', 1, 1),
-- Case 8 sessions (Michael Lee - Family Counseling)
(8, 8, 8, 3, 2, 3, '2026-01-27 10:00:00', '2026-01-27 11:30:00', 90, '1.5', 'Family counseling session. Some progress.', '2026-01-27 11:30:00', 1, 1),
-- Case 9 sessions (Olivia Taylor)
(9, 9, 9, 1, 2, 2, '2026-01-28 14:00:00', '2026-01-28 15:00:00', 60, '1.0', 'Session completed.', '2026-01-28 15:00:00', 1, 1),
-- Case 10 sessions (William Anderson)
(10, 10, 10, 1, 2, 2, '2026-01-29 09:00:00', '2026-01-29 10:00:00', 60, '1.0', 'Session completed.', '2026-01-29 10:00:00', 1, 1);
