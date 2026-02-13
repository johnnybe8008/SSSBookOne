-- ============================================================================
-- CLEAN SEED DATA WITH CONSISTENT RELATIONSHIPS
-- ============================================================================
-- This seed data creates a realistic organizational structure with properly
-- aligned relationships between all tables.

-- ============================================================================
-- COMPANIES (3 companies)
-- ============================================================================
INSERT INTO companies (name, address, phone, email, website, contactPerson, createdBy, updatedBy) VALUES
('Tech Solutions Inc', '123 Tech Street, San Francisco, CA 94105', '415-555-0100', 'contact@techsolutions.com', 'www.techsolutions.com', 'John Smith', 1, 1),
('Healthcare Partners', '456 Medical Ave, Boston, MA 02115', '617-555-0200', 'info@healthcarepartners.com', 'www.healthcarepartners.com', 'Sarah Johnson', 1, 1),
('Education First', '789 Learning Blvd, Austin, TX 78701', '512-555-0300', 'hello@educationfirst.com', 'www.educationfirst.com', 'Michael Chen', 1, 1);

-- ============================================================================
-- DIVISIONS (2 per company = 6 total)
-- ============================================================================
-- Tech Solutions Inc divisions
INSERT INTO divisions (companyId, code, name, description, createdBy, updatedBy) VALUES
(1, 'DIV-001', 'Engineering', 'Software development and technical teams', 1, 1),
(1, 'DIV-002', 'Operations', 'Business operations and support', 1, 1);

-- Healthcare Partners divisions
INSERT INTO divisions (companyId, code, name, description, createdBy, updatedBy) VALUES
(2, 'DIV-003', 'Clinical Services', 'Direct patient care services', 1, 1),
(2, 'DIV-004', 'Administration', 'Healthcare administration and management', 1, 1);

-- Education First divisions
INSERT INTO divisions (companyId, code, name, description, createdBy, updatedBy) VALUES
(3, 'DIV-005', 'K-12 Programs', 'Elementary and secondary education', 1, 1),
(3, 'DIV-006', 'Adult Learning', 'Adult education and professional development', 1, 1);

-- ============================================================================
-- DEPARTMENTS (2 per division = 12 total)
-- ============================================================================
-- Tech Solutions - Engineering
INSERT INTO departments (divisionId, code, name, description, createdBy, updatedBy) VALUES
(1, 'DEPT-001', 'Frontend Development', 'Web and mobile UI development', 1, 1),
(1, 'DEPT-002', 'Backend Development', 'Server and database development', 1, 1);

-- Tech Solutions - Operations
INSERT INTO departments (divisionId, code, name, description, createdBy, updatedBy) VALUES
(2, 'DEPT-003', 'Customer Support', 'Technical support and customer service', 1, 1),
(2, 'DEPT-004', 'IT Infrastructure', 'Systems and network management', 1, 1);

-- Healthcare Partners - Clinical Services
INSERT INTO departments (divisionId, code, name, description, createdBy, updatedBy) VALUES
(3, 'DEPT-005', 'Mental Health', 'Counseling and therapy services', 1, 1),
(3, 'DEPT-006', 'Primary Care', 'General medical services', 1, 1);

-- Healthcare Partners - Administration
INSERT INTO departments (divisionId, code, name, description, createdBy, updatedBy) VALUES
(4, 'DEPT-007', 'Patient Services', 'Patient intake and coordination', 1, 1),
(4, 'DEPT-008', 'Billing', 'Medical billing and insurance', 1, 1);

-- Education First - K-12 Programs
INSERT INTO departments (divisionId, code, name, description, createdBy, updatedBy) VALUES
(5, 'DEPT-009', 'Elementary Education', 'Grades K-5 programs', 1, 1),
(5, 'DEPT-010', 'Secondary Education', 'Grades 6-12 programs', 1, 1);

-- Education First - Adult Learning
INSERT INTO departments (divisionId, code, name, description, createdBy, updatedBy) VALUES
(6, 'DEPT-011', 'Professional Development', 'Career training and certification', 1, 1),
(6, 'DEPT-012', 'Continuing Education', 'Lifelong learning programs', 1, 1);

-- ============================================================================
-- COMPANY TEAMS (1 per department = 12 total)
-- ============================================================================
INSERT INTO companyTeams (departmentId, code, name, description, createdBy, updatedBy) VALUES
(1, 'CTEAM-001', 'React Team', 'Frontend React developers', 1, 1),
(2, 'CTEAM-002', 'Node.js Team', 'Backend Node.js developers', 1, 1),
(3, 'CTEAM-003', 'Support Team A', 'Customer support group A', 1, 1),
(4, 'CTEAM-004', 'Infrastructure Team', 'IT infrastructure specialists', 1, 1),
(5, 'CTEAM-005', 'Counseling Team', 'Mental health counselors', 1, 1),
(6, 'CTEAM-006', 'Medical Team', 'Primary care physicians', 1, 1),
(7, 'CTEAM-007', 'Intake Team', 'Patient intake coordinators', 1, 1),
(8, 'CTEAM-008', 'Billing Team', 'Medical billing specialists', 1, 1),
(9, 'CTEAM-009', 'Elementary Teachers', 'K-5 teaching staff', 1, 1),
(10, 'CTEAM-010', 'Secondary Teachers', '6-12 teaching staff', 1, 1),
(11, 'CTEAM-011', 'Career Trainers', 'Professional development instructors', 1, 1),
(12, 'CTEAM-012', 'Adult Educators', 'Continuing education instructors', 1, 1);

-- ============================================================================
-- STAFF (1 per team = 12 total)
-- ============================================================================
INSERT INTO staff (teamId, name, email, phone, position, createdBy, updatedBy) VALUES
(1, 'Alice Johnson', 'alice.johnson@techsolutions.com', '415-555-1001', 'Senior Frontend Developer', 1, 1),
(2, 'Robert Chen', 'robert.chen@techsolutions.com', '415-555-1002', 'Backend Team Lead', 1, 1),
(3, 'Maria Garcia', 'maria.garcia@techsolutions.com', '415-555-1003', 'Support Specialist', 1, 1),
(4, 'David Smith', 'david.smith@techsolutions.com', '415-555-1004', 'Infrastructure Engineer', 1, 1),
(5, 'Dr. Emma Wilson', 'emma.wilson@healthcarepartners.com', '617-555-2001', 'Licensed Counselor', 1, 1),
(6, 'Dr. James Brown', 'james.brown@healthcarepartners.com', '617-555-2002', 'Primary Care Physician', 1, 1),
(7, 'Sophia Martinez', 'sophia.martinez@healthcarepartners.com', '617-555-2003', 'Patient Coordinator', 1, 1),
(8, 'Michael Lee', 'michael.lee@healthcarepartners.com', '617-555-2004', 'Billing Specialist', 1, 1),
(9, 'Olivia Taylor', 'olivia.taylor@educationfirst.com', '512-555-3001', 'Elementary Teacher', 1, 1),
(10, 'William Anderson', 'william.anderson@educationfirst.com', '512-555-3002', 'High School Teacher', 1, 1),
(11, 'Ava Thompson', 'ava.thompson@educationfirst.com', '512-555-3003', 'Career Coach', 1, 1),
(12, 'Ethan White', 'ethan.white@educationfirst.com', '512-555-3004', 'Adult Education Instructor', 1, 1);

-- ============================================================================
-- CLIENTS (3 per department = 36 total, focused on Mental Health dept for counseling)
-- ============================================================================
-- Mental Health Department (DEPT-005) - Main counseling clients
INSERT INTO clients (departmentId, name, email, phone, address, dateOfBirth, gender, emergencyContact, emergencyPhone, referralSource, status, notes, createdBy, updatedBy) VALUES
(5, 'Jennifer Adams', 'jennifer.adams@email.com', '617-555-5001', '10 Oak St, Boston, MA', '1985-03-15', 'Female', 'Tom Adams', '617-555-5002', 'Self-Referral', 'Active', 'Anxiety and stress management', 1, 1),
(5, 'Christopher Davis', 'chris.davis@email.com', '617-555-5003', '20 Maple Ave, Boston, MA', '1990-07-22', 'Male', 'Lisa Davis', '617-555-5004', 'Doctor Referral', 'Active', 'Depression treatment', 1, 1),
(5, 'Patricia Miller', 'patricia.miller@email.com', '617-555-5005', '30 Pine Rd, Boston, MA', '1978-11-08', 'Female', 'Mark Miller', '617-555-5006', 'Insurance Provider', 'Active', 'Family counseling', 1, 1),
(5, 'Daniel Wilson', 'daniel.wilson@email.com', '617-555-5007', '40 Elm St, Boston, MA', '1982-05-30', 'Male', 'Sarah Wilson', '617-555-5008', 'Self-Referral', 'Active', 'Work-related stress', 1, 1),
(5, 'Linda Moore', 'linda.moore@email.com', '617-555-5009', '50 Birch Ln, Boston, MA', '1995-09-12', 'Female', 'John Moore', '617-555-5010', 'Doctor Referral', 'Active', 'Grief counseling', 1, 1),
(5, 'James Taylor', 'james.taylor@email.com', '617-555-5011', '60 Cedar Ave, Boston, MA', '1988-01-25', 'Male', 'Emily Taylor', '617-555-5012', 'Self-Referral', 'Active', 'Relationship counseling', 1, 1);

-- Primary Care Department (DEPT-006) - Medical clients
INSERT INTO clients (departmentId, name, email, phone, address, dateOfBirth, gender, emergencyContact, emergencyPhone, referralSource, status, notes, createdBy, updatedBy) VALUES
(6, 'Barbara Anderson', 'barbara.anderson@email.com', '617-555-6001', '70 Spruce St, Boston, MA', '1965-04-18', 'Female', 'Robert Anderson', '617-555-6002', 'Insurance Provider', 'Active', 'Annual checkup', 1, 1),
(6, 'Richard Thomas', 'richard.thomas@email.com', '617-555-6003', '80 Willow Rd, Boston, MA', '1972-08-09', 'Male', 'Nancy Thomas', '617-555-6004', 'Self-Referral', 'Active', 'Chronic condition management', 1, 1),
(6, 'Susan Jackson', 'susan.jackson@email.com', '617-555-6005', '90 Ash Ave, Boston, MA', '1980-12-03', 'Female', 'David Jackson', '617-555-6006', 'Doctor Referral', 'Active', 'Preventive care', 1, 1);

-- Other departments (1 client each for variety)
INSERT INTO clients (departmentId, name, email, phone, address, dateOfBirth, gender, emergencyContact, emergencyPhone, referralSource, status, notes, createdBy, updatedBy) VALUES
(1, 'Tech Client A', 'clienta@email.com', '415-555-7001', '100 Tech St, SF, CA', '1992-06-15', 'Male', 'Contact A', '415-555-7002', 'Self-Referral', 'Active', 'Frontend consultation', 1, 1),
(2, 'Tech Client B', 'clientb@email.com', '415-555-7003', '110 Tech St, SF, CA', '1987-10-20', 'Female', 'Contact B', '415-555-7004', 'Self-Referral', 'Active', 'Backend consultation', 1, 1),
(7, 'Patient Services Client', 'psclient@email.com', '617-555-7005', '120 Med Ave, Boston, MA', '1975-02-28', 'Male', 'Contact C', '617-555-7006', 'Insurance Provider', 'Active', 'Patient coordination', 1, 1);

-- ============================================================================
-- CASES (1 per Mental Health client = 6 cases)
-- ============================================================================
INSERT INTO cases (clientId, caseNumber, createdByStaffId, startDate, endDate, status, notes, createdBy, updatedBy) VALUES
(1, 'CASE-2026-0001', 5, '2026-01-15', NULL, 'Active', 'Anxiety treatment plan - weekly sessions', 1, 1),
(2, 'CASE-2026-0002', 5, '2026-01-16', NULL, 'Active', 'Depression treatment - bi-weekly sessions', 1, 1),
(3, 'CASE-2026-0003', 5, '2026-01-17', NULL, 'Active', 'Family counseling - weekly family sessions', 1, 1),
(4, 'CASE-2026-0004', 5, '2026-01-18', NULL, 'Active', 'Work stress management - weekly sessions', 1, 1),
(5, 'CASE-2026-0005', 5, '2026-01-19', NULL, 'Active', 'Grief counseling - weekly sessions', 1, 1),
(6, 'CASE-2026-0006', 5, '2026-01-20', '2026-02-10', 'Closed', 'Relationship counseling - completed successfully', 1, 1);

-- ============================================================================
-- SESSION LOOKUP TABLES
-- ============================================================================
INSERT INTO sessionTypes (name, description, createdBy, updatedBy) VALUES
('Individual Counseling', 'One-on-one counseling session', 1, 1),
('Group Therapy', 'Group counseling session', 1, 1),
('Family Counseling', 'Family therapy session', 1, 1),
('Crisis Intervention', 'Emergency mental health support', 1, 1),
('Assessment', 'Initial client assessment', 1, 1),
('Follow-up', 'Follow-up session', 1, 1);

INSERT INTO sessionStatuses (name, description, createdBy, updatedBy) VALUES
('Scheduled', 'Session is scheduled', 1, 1),
('Completed', 'Session was completed', 1, 1),
('Cancelled', 'Session was cancelled', 1, 1),
('No Show', 'Client did not attend', 1, 1),
('Rescheduled', 'Session was rescheduled', 1, 1);

INSERT INTO sessionResults (name, description, createdBy, updatedBy) VALUES
('Excellent Progress', 'Client showed excellent progress', 1, 1),
('Good Progress', 'Client showed good progress', 1, 1),
('Some Progress', 'Client showed some progress', 1, 1),
('No Progress', 'No significant progress', 1, 1),
('Needs Follow-up', 'Client needs additional follow-up', 1, 1);

-- ============================================================================
-- SESSIONS (4 sessions per case = 24 total)
-- ============================================================================
-- Case 1: Jennifer Adams - Anxiety (4 sessions, all completed)
INSERT INTO sessions (caseId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionEndTime, sessionDuration, billableHours, notes, completedAt, createdBy, updatedBy) VALUES
(1, 1, 5, 1, 2, 2, '2026-01-20 10:00:00', '2026-01-20 11:00:00', 60, '1.0', 'Initial assessment. Client expressed anxiety about work deadlines.', '2026-01-20 11:00:00', 1, 1),
(1, 1, 5, 1, 2, 2, '2026-01-27 10:00:00', '2026-01-27 11:00:00', 60, '1.0', 'Introduced breathing exercises and coping strategies.', '2026-01-27 11:00:00', 1, 1),
(1, 1, 5, 1, 2, 1, '2026-02-03 10:00:00', '2026-02-03 11:00:00', 60, '1.0', 'Client reported significant improvement in managing anxiety.', '2026-02-03 11:00:00', 1, 1),
(1, 1, 5, 1, 1, NULL, '2026-02-17 10:00:00', NULL, NULL, NULL, 'Follow-up session scheduled.', NULL, 1, 1);

-- Case 2: Christopher Davis - Depression (4 sessions, 3 completed, 1 no-show)
INSERT INTO sessions (caseId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionEndTime, sessionDuration, billableHours, notes, completedAt, createdBy, updatedBy) VALUES
(2, 2, 5, 1, 2, 3, '2026-01-21 14:00:00', '2026-01-21 15:00:00', 60, '1.0', 'Initial assessment. Client showing signs of depression.', '2026-01-21 15:00:00', 1, 1),
(2, 2, 5, 1, 2, 3, '2026-01-28 14:00:00', '2026-01-28 15:00:00', 60, '1.0', 'Discussed treatment options and set goals.', '2026-01-28 15:00:00', 1, 1),
(2, 2, 5, 1, 4, NULL, '2026-02-04 14:00:00', NULL, NULL, NULL, 'Client did not show up for session.', NULL, 1, 1),
(2, 2, 5, 1, 2, 2, '2026-02-11 14:00:00', '2026-02-11 15:00:00', 60, '1.0', 'Client returned. Discussed missed session and progress.', '2026-02-11 15:00:00', 1, 1);

-- Case 3: Patricia Miller - Family Counseling (4 sessions, all completed)
INSERT INTO sessions (caseId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionEndTime, sessionDuration, billableHours, notes, completedAt, createdBy, updatedBy) VALUES
(3, 3, 5, 3, 2, 2, '2026-01-22 16:00:00', '2026-01-22 17:30:00', 90, '1.5', 'Family session with spouse and children. Identified communication issues.', '2026-01-22 17:30:00', 1, 1),
(3, 3, 5, 3, 2, 2, '2026-01-29 16:00:00', '2026-01-29 17:30:00', 90, '1.5', 'Worked on active listening techniques.', '2026-01-29 17:30:00', 1, 1),
(3, 3, 5, 3, 2, 1, '2026-02-05 16:00:00', '2026-02-05 17:30:00', 90, '1.5', 'Family showing excellent progress in communication.', '2026-02-05 17:30:00', 1, 1),
(3, 3, 5, 3, 1, NULL, '2026-02-19 16:00:00', NULL, NULL, NULL, 'Follow-up family session scheduled.', NULL, 1, 1);

-- Case 4: Daniel Wilson - Work Stress (4 sessions, 2 completed, 1 cancelled, 1 scheduled)
INSERT INTO sessions (caseId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionEndTime, sessionDuration, billableHours, notes, completedAt, createdBy, updatedBy) VALUES
(4, 4, 5, 1, 2, 2, '2026-01-23 09:00:00', '2026-01-23 10:00:00', 60, '1.0', 'Discussed work-related stressors and burnout.', '2026-01-23 10:00:00', 1, 1),
(4, 4, 5, 1, 3, NULL, '2026-01-30 09:00:00', NULL, NULL, NULL, 'Client cancelled due to work conflict.', NULL, 1, 1),
(4, 4, 5, 1, 2, 2, '2026-02-06 09:00:00', '2026-02-06 10:00:00', 60, '1.0', 'Introduced work-life balance strategies.', '2026-02-06 10:00:00', 1, 1),
(4, 4, 5, 1, 1, NULL, '2026-02-20 09:00:00', NULL, NULL, NULL, 'Scheduled follow-up session.', NULL, 1, 1);

-- Case 5: Linda Moore - Grief Counseling (4 sessions, all completed)
INSERT INTO sessions (caseId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionEndTime, sessionDuration, billableHours, notes, completedAt, createdBy, updatedBy) VALUES
(5, 5, 5, 1, 2, 3, '2026-01-24 11:00:00', '2026-01-24 12:00:00', 60, '1.0', 'Initial grief counseling session. Client lost parent recently.', '2026-01-24 12:00:00', 1, 1),
(5, 5, 5, 1, 2, 3, '2026-01-31 11:00:00', '2026-01-31 12:00:00', 60, '1.0', 'Discussed stages of grief and coping mechanisms.', '2026-01-31 12:00:00', 1, 1),
(5, 5, 5, 1, 2, 2, '2026-02-07 11:00:00', '2026-02-07 12:00:00', 60, '1.0', 'Client showing good progress in processing grief.', '2026-02-07 12:00:00', 1, 1),
(5, 5, 5, 1, 1, NULL, '2026-02-21 11:00:00', NULL, NULL, NULL, 'Scheduled follow-up session.', NULL, 1, 1);

-- Case 6: James Taylor - Relationship Counseling (4 sessions, all completed, case closed)
INSERT INTO sessions (caseId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionEndTime, sessionDuration, billableHours, notes, completedAt, createdBy, updatedBy) VALUES
(6, 6, 5, 1, 2, 2, '2026-01-25 13:00:00', '2026-01-25 14:00:00', 60, '1.0', 'Initial relationship counseling session with partner.', '2026-01-25 14:00:00', 1, 1),
(6, 6, 5, 1, 2, 2, '2026-02-01 13:00:00', '2026-02-01 14:00:00', 60, '1.0', 'Worked on conflict resolution techniques.', '2026-02-01 14:00:00', 1, 1),
(6, 6, 5, 1, 2, 1, '2026-02-08 13:00:00', '2026-02-08 14:00:00', 60, '1.0', 'Couple showing excellent progress. Relationship improving.', '2026-02-08 14:00:00', 1, 1),
(6, 6, 5, 1, 2, 1, '2026-02-10 13:00:00', '2026-02-10 14:00:00', 60, '1.0', 'Final session. Case successfully closed.', '2026-02-10 14:00:00', 1, 1);
