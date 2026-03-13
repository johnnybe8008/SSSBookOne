-- ============================================================================
-- CLEAN SEED DATA WITH EXPLICIT IDS AND CONSISTENT RELATIONSHIPS
-- ============================================================================

-- ============================================================================
-- SESSION LOOKUP TABLES (must be populated before sessions)
-- ============================================================================
-- Session Types
INSERT INTO sessionTypes (id, name, description, createdBy, updatedBy) VALUES
(1, 'Individual Counseling', 'One-on-one counseling session', 1, 1);
INSERT INTO sessionTypes (id, name, description, createdBy, updatedBy) VALUES
(2, 'Group Therapy', 'Group counseling session', 1, 1);
INSERT INTO sessionTypes (id, name, description, createdBy, updatedBy) VALUES
(3, 'Family Counseling', 'Family therapy session', 1, 1);
INSERT INTO sessionTypes (id, name, description, createdBy, updatedBy) VALUES
(4, 'Crisis Intervention', 'Emergency crisis counseling', 1, 1);
INSERT INTO sessionTypes (id, name, description, createdBy, updatedBy) VALUES
(5, 'Assessment', 'Initial or follow-up assessment', 1, 1);

-- Session Statuses
INSERT INTO sessionStatuses (id, name, description, createdBy, updatedBy) VALUES
(1, 'Scheduled', 'Session is scheduled', 1, 1);
INSERT INTO sessionStatuses (id, name, description, createdBy, updatedBy) VALUES
(2, 'In Progress', 'Session is currently in progress', 1, 1);
INSERT INTO sessionStatuses (id, name, description, createdBy, updatedBy) VALUES
(3, 'Completed', 'Session has been completed', 1, 1);
INSERT INTO sessionStatuses (id, name, description, createdBy, updatedBy) VALUES
(4, 'Cancelled', 'Session was cancelled', 1, 1);
INSERT INTO sessionStatuses (id, name, description, createdBy, updatedBy) VALUES
(5, 'No-Show', 'Client did not attend', 1, 1);

-- Session Results
INSERT INTO sessionResults (id, name, description, createdBy, updatedBy) VALUES
(1, 'Successful', 'Session achieved intended goals', 1, 1);
INSERT INTO sessionResults (id, name, description, createdBy, updatedBy) VALUES
(2, 'Partial Progress', 'Some progress made toward goals', 1, 1);
INSERT INTO sessionResults (id, name, description, createdBy, updatedBy) VALUES
(3, 'No Progress', 'No significant progress made', 1, 1);
INSERT INTO sessionResults (id, name, description, createdBy, updatedBy) VALUES
(4, 'Rescheduled', 'Session was rescheduled', 1, 1);

-- ============================================================================
-- COMPANIES (3 companies with explicit IDs)
-- ============================================================================
INSERT INTO companies (id, name, address, phone, email, website, contactPerson, createdBy, updatedBy) VALUES
(1, 'Tech Solutions Inc', '123 Tech Street, San Francisco, CA 94105', '415-555-0100', 'contact@techsolutions.com', 'www.techsolutions.com', 'John Smith', 1, 1);

INSERT INTO companies (id, name, address, phone, email, website, contactPerson, createdBy, updatedBy) VALUES
(2, 'Healthcare Partners', '456 Medical Ave, Boston, MA 02115', '617-555-0200', 'info@healthcarepartners.com', 'www.healthcarepartners.com', 'Sarah Johnson', 1, 1);

INSERT INTO companies (id, name, address, phone, email, website, contactPerson, createdBy, updatedBy) VALUES
(3, 'Education First', '789 Learning Blvd, Austin, TX 78701', '512-555-0300', 'hello@educationfirst.com', 'www.educationfirst.com', 'Michael Chen', 1, 1);

-- ============================================================================
-- DIVISIONS (2 per company = 6 total with explicit IDs)
-- ============================================================================
-- Tech Solutions Inc divisions
INSERT INTO divisions (id, companyId, code, name, description, createdBy, updatedBy) VALUES
(101, 1, 'DIV-001', 'Engineering', 'Software development and technical teams', 1, 1);

INSERT INTO divisions (id, companyId, code, name, description, createdBy, updatedBy) VALUES
(102, 1, 'DIV-002', 'Operations', 'Business operations and support', 1, 1);

-- Healthcare Partners divisions
INSERT INTO divisions (id, companyId, code, name, description, createdBy, updatedBy) VALUES
(103, 2, 'DIV-003', 'Clinical Services', 'Direct patient care services', 1, 1);

INSERT INTO divisions (id, companyId, code, name, description, createdBy, updatedBy) VALUES
(104, 2, 'DIV-004', 'Administration', 'Healthcare administration and management', 1, 1);

-- Education First divisions
INSERT INTO divisions (id, companyId, code, name, description, createdBy, updatedBy) VALUES
(105, 3, 'DIV-005', 'K-12 Programs', 'Elementary and secondary education', 1, 1);

INSERT INTO divisions (id, companyId, code, name, description, createdBy, updatedBy) VALUES
(106, 3, 'DIV-006', 'Adult Learning', 'Adult education and professional development', 1, 1);

-- ============================================================================
-- DEPARTMENTS (2 per division = 12 total with explicit IDs)
-- ============================================================================
-- Tech Solutions - Engineering (divisionId: 101)
INSERT INTO departments (id, divisionId, code, name, description, createdBy, updatedBy) VALUES
(201, 101, 'DEPT-001', 'Frontend Development', 'Web and mobile UI development', 1, 1);

INSERT INTO departments (id, divisionId, code, name, description, createdBy, updatedBy) VALUES
(202, 101, 'DEPT-002', 'Backend Development', 'Server and database development', 1, 1);

-- Tech Solutions - Operations (divisionId: 102)
INSERT INTO departments (id, divisionId, code, name, description, createdBy, updatedBy) VALUES
(203, 102, 'DEPT-003', 'Customer Support', 'Technical support and customer service', 1, 1);

INSERT INTO departments (id, divisionId, code, name, description, createdBy, updatedBy) VALUES
(204, 102, 'DEPT-004', 'IT Infrastructure', 'Systems and network management', 1, 1);

-- Healthcare Partners - Clinical Services (divisionId: 103)
INSERT INTO departments (id, divisionId, code, name, description, createdBy, updatedBy) VALUES
(205, 103, 'DEPT-005', 'Mental Health', 'Counseling and therapy services', 1, 1);

INSERT INTO departments (id, divisionId, code, name, description, createdBy, updatedBy) VALUES
(206, 103, 'DEPT-006', 'Primary Care', 'General medical services', 1, 1);

-- Healthcare Partners - Administration (divisionId: 104)
INSERT INTO departments (id, divisionId, code, name, description, createdBy, updatedBy) VALUES
(207, 104, 'DEPT-007', 'Patient Services', 'Patient intake and coordination', 1, 1);

INSERT INTO departments (id, divisionId, code, name, description, createdBy, updatedBy) VALUES
(208, 104, 'DEPT-008', 'Billing', 'Medical billing and insurance', 1, 1);

-- Education First - K-12 Programs (divisionId: 105)
INSERT INTO departments (id, divisionId, code, name, description, createdBy, updatedBy) VALUES
(209, 105, 'DEPT-009', 'Elementary Education', 'Grades K-5 programs', 1, 1);

INSERT INTO departments (id, divisionId, code, name, description, createdBy, updatedBy) VALUES
(210, 105, 'DEPT-010', 'Secondary Education', 'Grades 6-12 programs', 1, 1);

-- Education First - Adult Learning (divisionId: 106)
INSERT INTO departments (id, divisionId, code, name, description, createdBy, updatedBy) VALUES
(211, 106, 'DEPT-011', 'Professional Development', 'Career training and certification', 1, 1);

INSERT INTO departments (id, divisionId, code, name, description, createdBy, updatedBy) VALUES
(212, 106, 'DEPT-012', 'Continuing Education', 'Lifelong learning programs', 1, 1);

-- ============================================================================
-- COMPANY TEAMS (1 per department = 12 total with explicit IDs)
-- ============================================================================
INSERT INTO companyTeams (id, departmentId, code, name, description, createdBy, updatedBy) VALUES
(301, 201, 'CTEAM-001', 'React Team', 'Frontend React developers', 1, 1);

INSERT INTO companyTeams (id, departmentId, code, name, description, createdBy, updatedBy) VALUES
(302, 202, 'CTEAM-002', 'Node.js Team', 'Backend Node.js developers', 1, 1);

INSERT INTO companyTeams (id, departmentId, code, name, description, createdBy, updatedBy) VALUES
(303, 203, 'CTEAM-003', 'Support Team A', 'Customer support group A', 1, 1);

INSERT INTO companyTeams (id, departmentId, code, name, description, createdBy, updatedBy) VALUES
(304, 204, 'CTEAM-004', 'Infrastructure Team', 'IT infrastructure specialists', 1, 1);

INSERT INTO companyTeams (id, departmentId, code, name, description, createdBy, updatedBy) VALUES
(305, 205, 'CTEAM-005', 'Counseling Team', 'Mental health counselors', 1, 1);

INSERT INTO companyTeams (id, departmentId, code, name, description, createdBy, updatedBy) VALUES
(306, 206, 'CTEAM-006', 'Medical Team', 'Primary care physicians', 1, 1);

INSERT INTO companyTeams (id, departmentId, code, name, description, createdBy, updatedBy) VALUES
(307, 207, 'CTEAM-007', 'Intake Team', 'Patient intake coordinators', 1, 1);

INSERT INTO companyTeams (id, departmentId, code, name, description, createdBy, updatedBy) VALUES
(308, 208, 'CTEAM-008', 'Billing Team', 'Medical billing specialists', 1, 1);

INSERT INTO companyTeams (id, departmentId, code, name, description, createdBy, updatedBy) VALUES
(309, 209, 'CTEAM-009', 'Elementary Teachers', 'K-5 teaching staff', 1, 1);

INSERT INTO companyTeams (id, departmentId, code, name, description, createdBy, updatedBy) VALUES
(310, 210, 'CTEAM-010', 'Secondary Teachers', '6-12 teaching staff', 1, 1);

INSERT INTO companyTeams (id, departmentId, code, name, description, createdBy, updatedBy) VALUES
(311, 211, 'CTEAM-011', 'Career Trainers', 'Professional development instructors', 1, 1);

INSERT INTO companyTeams (id, departmentId, code, name, description, createdBy, updatedBy) VALUES
(312, 212, 'CTEAM-012', 'Adult Educators', 'Continuing education instructors', 1, 1);

-- ============================================================================
-- STAFF (1 per team = 12 total with explicit IDs)
-- ============================================================================
INSERT INTO staff (id, teamId, name, email, phone, position, createdBy, updatedBy) VALUES
(401, 301, 'Alice Johnson', 'alice.johnson@techsolutions.com', '415-555-1001', 'Senior Frontend Developer', 1, 1);

INSERT INTO staff (id, teamId, name, email, phone, position, createdBy, updatedBy) VALUES
(402, 302, 'Robert Chen', 'robert.chen@techsolutions.com', '415-555-1002', 'Backend Team Lead', 1, 1);

INSERT INTO staff (id, teamId, name, email, phone, position, createdBy, updatedBy) VALUES
(403, 303, 'Maria Garcia', 'maria.garcia@techsolutions.com', '415-555-1003', 'Support Specialist', 1, 1);

INSERT INTO staff (id, teamId, name, email, phone, position, createdBy, updatedBy) VALUES
(404, 304, 'David Smith', 'david.smith@techsolutions.com', '415-555-1004', 'Infrastructure Engineer', 1, 1);

INSERT INTO staff (id, teamId, name, email, phone, position, createdBy, updatedBy) VALUES
(405, 305, 'Dr. Emma Wilson', 'emma.wilson@healthcarepartners.com', '617-555-2001', 'Licensed Counselor', 1, 1);

INSERT INTO staff (id, teamId, name, email, phone, position, createdBy, updatedBy) VALUES
(406, 306, 'Dr. James Brown', 'james.brown@healthcarepartners.com', '617-555-2002', 'Primary Care Physician', 1, 1);

INSERT INTO staff (id, teamId, name, email, phone, position, createdBy, updatedBy) VALUES
(407, 307, 'Sophia Martinez', 'sophia.martinez@healthcarepartners.com', '617-555-2003', 'Patient Coordinator', 1, 1);

INSERT INTO staff (id, teamId, name, email, phone, position, createdBy, updatedBy) VALUES
(408, 308, 'Michael Lee', 'michael.lee@healthcarepartners.com', '617-555-2004', 'Billing Specialist', 1, 1);

INSERT INTO staff (id, teamId, name, email, phone, position, createdBy, updatedBy) VALUES
(409, 309, 'Olivia Taylor', 'olivia.taylor@educationfirst.com', '512-555-3001', 'Elementary Teacher', 1, 1);

INSERT INTO staff (id, teamId, name, email, phone, position, createdBy, updatedBy) VALUES
(410, 310, 'William Anderson', 'william.anderson@educationfirst.com', '512-555-3002', 'High School Teacher', 1, 1);

INSERT INTO staff (id, teamId, name, email, phone, position, createdBy, updatedBy) VALUES
(411, 311, 'Ava Thompson', 'ava.thompson@educationfirst.com', '512-555-3003', 'Career Coach', 1, 1);

INSERT INTO staff (id, teamId, name, email, phone, position, createdBy, updatedBy) VALUES
(412, 312, 'Ethan White', 'ethan.white@educationfirst.com', '512-555-3004', 'Adult Education Instructor', 1, 1);

-- ============================================================================
-- CLIENTS - Mental Health Department (departmentId: 205)
-- ============================================================================
INSERT INTO clients (id, departmentId, firstName, lastName, dateOfBirth, gender, phone, email, address, emergencyContact, emergencyPhone, createdBy, updatedBy) VALUES
(501, 205, 'John', 'Doe', '1985-03-15', 'Male', '617-555-5001', 'john.doe@email.com', '100 Main St, Boston, MA', 'Jane Doe', '617-555-5002', 1, 1);

INSERT INTO clients (id, departmentId, firstName, lastName, dateOfBirth, gender, phone, email, address, emergencyContact, emergencyPhone, createdBy, updatedBy) VALUES
(502, 205, 'Sarah', 'Smith', '1990-07-22', 'Female', '617-555-5003', 'sarah.smith@email.com', '200 Oak Ave, Boston, MA', 'Mike Smith', '617-555-5004', 1, 1);

INSERT INTO clients (id, departmentId, firstName, lastName, dateOfBirth, gender, phone, email, address, emergencyContact, emergencyPhone, createdBy, updatedBy) VALUES
(503, 205, 'Michael', 'Johnson', '1978-11-08', 'Male', '617-555-5005', 'michael.j@email.com', '300 Pine Rd, Boston, MA', 'Lisa Johnson', '617-555-5006', 1, 1);

INSERT INTO clients (id, departmentId, firstName, lastName, dateOfBirth, gender, phone, email, address, emergencyContact, emergencyPhone, createdBy, updatedBy) VALUES
(504, 205, 'Emily', 'Williams', '1995-02-14', 'Female', '617-555-5007', 'emily.w@email.com', '400 Elm St, Boston, MA', 'Tom Williams', '617-555-5008', 1, 1);

INSERT INTO clients (id, departmentId, firstName, lastName, dateOfBirth, gender, phone, email, address, emergencyContact, emergencyPhone, createdBy, updatedBy) VALUES
(505, 205, 'David', 'Brown', '1982-09-30', 'Male', '617-555-5009', 'david.brown@email.com', '500 Maple Dr, Boston, MA', 'Anna Brown', '617-555-5010', 1, 1);

INSERT INTO clients (id, departmentId, firstName, lastName, dateOfBirth, gender, phone, email, address, emergencyContact, emergencyPhone, createdBy, updatedBy) VALUES
(506, 205, 'Jessica', 'Davis', '1988-05-18', 'Female', '617-555-5011', 'jessica.d@email.com', '600 Cedar Ln, Boston, MA', 'Robert Davis', '617-555-5012', 1, 1);

-- ============================================================================
-- CLIENTS - Primary Care Department (departmentId: 206)
-- ============================================================================
INSERT INTO clients (id, departmentId, firstName, lastName, dateOfBirth, gender, phone, email, address, emergencyContact, emergencyPhone, createdBy, updatedBy) VALUES
(507, 206, 'Robert', 'Miller', '1975-12-05', 'Male', '617-555-5013', 'robert.m@email.com', '700 Birch St, Boston, MA', 'Mary Miller', '617-555-5014', 1, 1);

INSERT INTO clients (id, departmentId, firstName, lastName, dateOfBirth, gender, phone, email, address, emergencyContact, emergencyPhone, createdBy, updatedBy) VALUES
(508, 206, 'Amanda', 'Wilson', '1992-04-20', 'Female', '617-555-5015', 'amanda.w@email.com', '800 Spruce Ave, Boston, MA', 'Chris Wilson', '617-555-5016', 1, 1);

INSERT INTO clients (id, departmentId, firstName, lastName, dateOfBirth, gender, phone, email, address, emergencyContact, emergencyPhone, createdBy, updatedBy) VALUES
(509, 206, 'James', 'Moore', '1980-08-12', 'Male', '617-555-5017', 'james.moore@email.com', '900 Willow Rd, Boston, MA', 'Susan Moore', '617-555-5018', 1, 1);

-- ============================================================================
-- CLIENTS - Patient Services Department (departmentId: 207)
-- ============================================================================
INSERT INTO clients (id, departmentId, firstName, lastName, dateOfBirth, gender, phone, email, address, emergencyContact, emergencyPhone, createdBy, updatedBy) VALUES
(510, 207, 'Linda', 'Taylor', '1987-06-25', 'Female', '617-555-5019', 'linda.t@email.com', '1000 Ash Dr, Boston, MA', 'Mark Taylor', '617-555-5020', 1, 1);

INSERT INTO clients (id, departmentId, firstName, lastName, dateOfBirth, gender, phone, email, address, emergencyContact, emergencyPhone, createdBy, updatedBy) VALUES
(511, 207, 'Christopher', 'Anderson', '1983-10-03', 'Male', '617-555-5021', 'chris.a@email.com', '1100 Cherry Ln, Boston, MA', 'Nicole Anderson', '617-555-5022', 1, 1);

-- ============================================================================
-- CLIENTS - Frontend Development Department (departmentId: 201)
-- ============================================================================
INSERT INTO clients (id, departmentId, firstName, lastName, dateOfBirth, gender, phone, email, address, emergencyContact, emergencyPhone, createdBy, updatedBy) VALUES
(512, 201, 'Patricia', 'Thomas', '1991-01-17', 'Female', '415-555-5023', 'patricia.t@email.com', '1200 Redwood St, SF, CA', 'Daniel Thomas', '415-555-5024', 1, 1);

INSERT INTO clients (id, departmentId, firstName, lastName, dateOfBirth, gender, phone, email, address, emergencyContact, emergencyPhone, createdBy, updatedBy) VALUES
(513, 201, 'Matthew', 'Jackson', '1986-03-28', 'Male', '415-555-5025', 'matthew.j@email.com', '1300 Sequoia Ave, SF, CA', 'Rachel Jackson', '415-555-5026', 1, 1);

-- ============================================================================
-- CLIENTS - Elementary Education Department (departmentId: 209)
-- ============================================================================
INSERT INTO clients (id, departmentId, firstName, lastName, dateOfBirth, gender, phone, email, address, emergencyContact, emergencyPhone, createdBy, updatedBy) VALUES
(514, 209, 'Barbara', 'White', '1989-09-11', 'Female', '512-555-5027', 'barbara.w@email.com', '1400 Cypress Rd, Austin, TX', 'Steven White', '512-555-5028', 1, 1);

INSERT INTO clients (id, departmentId, firstName, lastName, dateOfBirth, gender, phone, email, address, emergencyContact, emergencyPhone, createdBy, updatedBy) VALUES
(515, 209, 'Joseph', 'Harris', '1984-07-19', 'Male', '512-555-5029', 'joseph.h@email.com', '1500 Magnolia Dr, Austin, TX', 'Karen Harris', '512-555-5030', 1, 1);

-- ============================================================================
-- FOLDERS (1 per client = 15 total with explicit IDs)
-- ============================================================================
INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(601, 501, 405, '2026-01-15', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(602, 502, 405, '2026-01-18', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(603, 503, 405, '2026-01-20', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(604, 504, 405, '2026-01-22', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(605, 505, 405, '2026-01-25', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(606, 506, 405, '2026-01-28', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(607, 507, 406, '2026-01-16', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(608, 508, 406, '2026-01-19', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(609, 509, 406, '2026-01-21', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(610, 510, 407, '2026-01-17', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(611, 511, 407, '2026-01-23', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(612, 512, 401, '2026-01-24', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(613, 513, 401, '2026-01-26', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(614, 514, 409, '2026-01-27', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(615, 515, 409, '2026-01-29', 'Active', 1, 1);

-- ============================================================================
-- SESSIONS (3 per case = 45 total with explicit IDs)
-- ============================================================================
INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(701, 601, 501, 405, 5, 3, 1, '2026-01-20 10:00:00', 60, 'Initial assessment session', '2026-01-20 10:00:00', '2026-01-20 10:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(702, 601, 501, 405, 1, 3, 1, '2026-01-27 10:00:00', 60, 'Follow-up counseling', '2026-01-27 10:00:00', '2026-01-27 10:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(703, 601, 501, 405, 1, 1, NULL, '2026-02-03 10:00:00', 60, 'Ongoing therapy', '2026-02-03 10:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(704, 602, 502, 405, 5, 3, 1, '2026-01-22 14:00:00', 60, 'Initial assessment', '2026-01-22 14:00:00', '2026-01-22 14:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(705, 602, 502, 405, 1, 3, 2, '2026-01-29 14:00:00', 60, 'Therapy session', '2026-01-29 14:00:00', '2026-01-29 14:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(706, 602, 502, 405, 1, 1, NULL, '2026-02-05 14:00:00', 60, 'Scheduled session', '2026-02-05 14:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(707, 603, 503, 405, 5, 3, 1, '2026-01-24 09:00:00', 60, 'Initial consultation', '2026-01-24 09:00:00', '2026-01-24 09:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(708, 603, 503, 405, 1, 3, 1, '2026-01-31 09:00:00', 60, 'Counseling session', '2026-01-31 09:00:00', '2026-01-31 09:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(709, 603, 503, 405, 1, 1, NULL, '2026-02-07 09:00:00', 60, 'Upcoming session', '2026-02-07 09:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(710, 604, 504, 405, 5, 3, 1, '2026-01-26 11:00:00', 60, 'First session', '2026-01-26 11:00:00', '2026-01-26 11:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(711, 604, 504, 405, 1, 3, 2, '2026-02-02 11:00:00', 60, 'Second session', '2026-02-02 11:00:00', '2026-02-02 11:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(712, 604, 504, 405, 1, 1, NULL, '2026-02-09 11:00:00', 60, 'Third session', '2026-02-09 11:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(713, 605, 505, 405, 5, 3, 1, '2026-01-28 15:00:00', 60, 'Initial meeting', '2026-01-28 15:00:00', '2026-01-28 15:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(714, 605, 505, 405, 1, 3, 1, '2026-02-04 15:00:00', 60, 'Follow-up', '2026-02-04 15:00:00', '2026-02-04 15:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(715, 605, 505, 405, 1, 1, NULL, '2026-02-11 15:00:00', 60, 'Next session', '2026-02-11 15:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(716, 606, 506, 405, 5, 3, 1, '2026-01-30 13:00:00', 60, 'Assessment', '2026-01-30 13:00:00', '2026-01-30 13:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(717, 606, 506, 405, 1, 3, 1, '2026-02-06 13:00:00', 60, 'Therapy', '2026-02-06 13:00:00', '2026-02-06 13:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(718, 606, 506, 405, 1, 1, NULL, '2026-02-13 13:00:00', 60, 'Scheduled', '2026-02-13 13:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(719, 607, 507, 406, 5, 3, 1, '2026-01-21 09:00:00', 45, 'Annual checkup', '2026-01-21 09:00:00', '2026-01-21 09:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(720, 607, 507, 406, 1, 3, 1, '2026-01-28 09:30:00', 30, 'Lab results review', '2026-01-28 09:30:00', '2026-01-28 09:30:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(721, 607, 507, 406, 1, 1, NULL, '2026-02-10 09:00:00', 30, 'Follow-up', '2026-02-10 09:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(722, 608, 508, 406, 5, 3, 1, '2026-01-23 14:00:00', 45, 'Physical exam', '2026-01-23 14:00:00', '2026-01-23 14:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(723, 608, 508, 406, 1, 3, 2, '2026-01-30 14:30:00', 30, 'Consultation', '2026-01-30 14:30:00', '2026-01-30 14:30:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(724, 608, 508, 406, 1, 1, NULL, '2026-02-08 14:00:00', 30, 'Next visit', '2026-02-08 14:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(725, 609, 509, 406, 5, 3, 1, '2026-01-25 10:00:00', 45, 'Health screening', '2026-01-25 10:00:00', '2026-01-25 10:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(726, 609, 509, 406, 1, 3, 1, '2026-02-01 10:30:00', 30, 'Results discussion', '2026-02-01 10:30:00', '2026-02-01 10:30:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(727, 609, 509, 406, 1, 1, NULL, '2026-02-12 10:00:00', 30, 'Upcoming', '2026-02-12 10:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(728, 610, 510, 407, 5, 3, 1, '2026-01-22 11:00:00', 30, 'Registration', '2026-01-22 11:00:00', '2026-01-22 11:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(729, 610, 510, 407, 1, 3, 1, '2026-01-29 11:00:00', 30, 'Documentation', '2026-01-29 11:00:00', '2026-01-29 11:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(730, 610, 510, 407, 1, 1, NULL, '2026-02-05 11:00:00', 30, 'Follow-up', '2026-02-05 11:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(731, 611, 511, 407, 5, 3, 1, '2026-01-24 15:00:00', 30, 'Intake', '2026-01-24 15:00:00', '2026-01-24 15:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(732, 611, 511, 407, 1, 3, 1, '2026-01-31 15:00:00', 30, 'Services review', '2026-01-31 15:00:00', '2026-01-31 15:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(733, 611, 511, 407, 1, 1, NULL, '2026-02-07 15:00:00', 30, 'Scheduled', '2026-02-07 15:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(734, 612, 512, 401, 1, 3, 1, '2026-01-23 10:00:00', 90, 'Project kickoff', '2026-01-23 10:00:00', '2026-01-23 10:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(735, 612, 512, 401, 1, 3, 1, '2026-01-30 10:00:00', 90, 'Sprint planning', '2026-01-30 10:00:00', '2026-01-30 10:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(736, 612, 512, 401, 1, 1, NULL, '2026-02-06 10:00:00', 90, 'Code review', '2026-02-06 10:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(737, 613, 513, 401, 1, 3, 1, '2026-01-25 14:00:00', 90, 'Requirements gathering', '2026-01-25 14:00:00', '2026-01-25 14:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(738, 613, 513, 401, 1, 3, 2, '2026-02-06 14:00:00', 90, 'Design review', '2026-02-06 14:00:00', '2026-02-06 14:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(739, 613, 513, 401, 1, 1, NULL, '2026-02-13 14:00:00', 90, 'Implementation', '2026-02-13 14:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(740, 614, 514, 409, 1, 3, 1, '2026-01-31 13:00:00', 60, 'Parent-teacher conference', '2026-01-31 13:00:00', '2026-01-31 13:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(741, 614, 514, 409, 1, 3, 1, '2026-02-07 13:00:00', 60, 'Progress review', '2026-02-07 13:00:00', '2026-02-07 13:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(742, 614, 514, 409, 1, 1, NULL, '2026-02-14 13:00:00', 60, 'Next meeting', '2026-02-14 13:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(743, 615, 515, 409, 1, 3, 1, '2026-02-01 10:00:00', 60, 'Academic planning', '2026-02-01 10:00:00', '2026-02-01 10:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(744, 615, 515, 409, 1, 3, 2, '2026-02-08 10:00:00', 60, 'Learning assessment', '2026-02-08 10:00:00', '2026-02-08 10:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(745, 615, 515, 409, 1, 1, NULL, '2026-02-15 10:00:00', 60, 'Follow-up', '2026-02-15 10:00:00', NULL, 1, 1);

-- ============================================================================
-- EXPANDED CLIENTS (60 clients = 5 per department)
-- ============================================================================
INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(501, 'William King', 'william.king@example.com', '495-555-2843', '1963-11-03', 201, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(502, 'Ashley Anderson', 'ashley.anderson@example.com', '277-555-8716', '1996-02-10', 201, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(503, 'Margaret Adams', 'margaret.adams@example.com', '368-555-1091', '1969-03-26', 201, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(504, 'William Rivera', 'william.rivera@example.com', '520-555-3171', '1962-08-24', 201, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(505, 'Jeffrey Gomez', 'jeffrey.gomez@example.com', '223-555-7532', '1979-02-12', 201, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(506, 'Sharon Hernandez', 'sharon.hernandez@example.com', '456-555-7023', '1966-04-21', 202, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(507, 'Jeffrey Perez', 'jeffrey.perez@example.com', '742-555-8917', '1998-09-01', 202, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(508, 'Michael Rodriguez', 'michael.rodriguez@example.com', '273-555-1259', '1976-06-26', 202, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(509, 'Sarah Williams', 'sarah.williams@example.com', '677-555-5258', '1973-02-08', 202, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(510, 'Amanda Gomez', 'amanda.gomez@example.com', '724-555-6819', '1984-02-10', 202, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(511, 'Ryan Thomas', 'ryan.thomas@example.com', '618-555-7730', '1971-04-06', 203, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(512, 'Emily Nguyen', 'emily.nguyen@example.com', '683-555-8386', '1994-09-09', 203, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(513, 'William Thomas', 'william.thomas@example.com', '782-555-2478', '2000-05-05', 203, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(514, 'Melissa Phillips', 'melissa.phillips@example.com', '943-555-7486', '1992-06-16', 203, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(515, 'John Jones', 'john.jones@example.com', '858-555-5918', '1972-07-19', 203, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(516, 'Michael Harris', 'michael.harris@example.com', '862-555-7497', '1967-05-07', 204, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(517, 'Nancy Clark', 'nancy.clark@example.com', '829-555-7000', '1967-06-04', 204, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(518, 'Barbara Miller', 'barbara.miller@example.com', '640-555-5820', '1986-11-03', 204, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(519, 'Linda Moore', 'linda.moore@example.com', '386-555-2091', '1975-04-29', 204, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(520, 'Deborah Martin', 'deborah.martin@example.com', '238-555-1077', '2001-01-30', 204, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(521, 'Donna Garcia', 'donna.garcia@example.com', '913-555-8793', '1989-12-24', 205, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(522, 'Richard Young', 'richard.young@example.com', '635-555-9638', '1981-07-01', 205, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(523, 'Brian Johnson', 'brian.johnson@example.com', '996-555-6992', '1972-11-04', 205, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(524, 'Emily Diaz', 'emily.diaz@example.com', '475-555-9488', '1997-09-05', 205, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(525, 'Robert Adams', 'robert.adams@example.com', '355-555-6308', '1975-01-13', 205, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(526, 'Mary Martinez', 'mary.martinez@example.com', '236-555-2155', '1992-07-22', 206, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(527, 'John Evans', 'john.evans@example.com', '897-555-8501', '1999-03-01', 206, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(528, 'Jason Gomez', 'jason.gomez@example.com', '288-555-6241', '1992-05-11', 206, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(529, 'Christopher Jones', 'christopher.jones@example.com', '649-555-9893', '1969-05-16', 206, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(530, 'Laura Anderson', 'laura.anderson@example.com', '936-555-3565', '1963-07-04', 206, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(531, 'Charles Walker', 'charles.walker@example.com', '335-555-9783', '1992-09-20', 207, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(532, 'Richard Taylor', 'richard.taylor@example.com', '303-555-1171', '1973-12-31', 207, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(533, 'Anthony Clark', 'anthony.clark@example.com', '494-555-1887', '1974-04-05', 207, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(534, 'Amanda Jackson', 'amanda.jackson@example.com', '597-555-1175', '1991-07-10', 207, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(535, 'Matthew Williams', 'matthew.williams@example.com', '895-555-4406', '1999-04-04', 207, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(536, 'Robert Roberts', 'robert.roberts@example.com', '665-555-6344', '1965-07-15', 208, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(537, 'Karen Sanchez', 'karen.sanchez@example.com', '554-555-7139', '1999-05-22', 208, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(538, 'Donald Lee', 'donald.lee@example.com', '225-555-3495', '1976-03-20', 208, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(539, 'Andrew Lee', 'andrew.lee@example.com', '238-555-8189', '1971-11-06', 208, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(540, 'Karen Wright', 'karen.wright@example.com', '646-555-5461', '1996-09-21', 208, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(541, 'Donna Roberts', 'donna.roberts@example.com', '409-555-5725', '1996-06-04', 209, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(542, 'Paul Rodriguez', 'paul.rodriguez@example.com', '301-555-3995', '1999-10-11', 209, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(543, 'Donald Hall', 'donald.hall@example.com', '812-555-4659', '1964-01-03', 209, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(544, 'Mark Clark', 'mark.clark@example.com', '264-555-7070', '1972-06-11', 209, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(545, 'Stephanie Smith', 'stephanie.smith@example.com', '283-555-3880', '1961-10-14', 209, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(546, 'James Parker', 'james.parker@example.com', '729-555-6389', '1981-08-14', 210, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(547, 'Stephanie Gomez', 'stephanie.gomez@example.com', '934-555-9377', '1961-03-12', 210, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(548, 'Kenneth Wilson', 'kenneth.wilson@example.com', '614-555-9290', '1981-09-10', 210, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(549, 'David Nguyen', 'david.nguyen@example.com', '756-555-5593', '1976-04-28', 210, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(550, 'Joshua Moore', 'joshua.moore@example.com', '820-555-2526', '1967-12-27', 210, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(551, 'Jessica Parker', 'jessica.parker@example.com', '631-555-8701', '1973-10-31', 211, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(552, 'Lisa Smith', 'lisa.smith@example.com', '858-555-5964', '1998-01-07', 211, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(553, 'Jennifer Phillips', 'jennifer.phillips@example.com', '731-555-2242', '2001-02-04', 211, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(554, 'Joseph Flores', 'joseph.flores@example.com', '984-555-9586', '1988-07-06', 211, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(555, 'Sharon Phillips', 'sharon.phillips@example.com', '946-555-7587', '1964-12-27', 211, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(556, 'Edward Taylor', 'edward.taylor@example.com', '244-555-8060', '1990-04-10', 212, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(557, 'Karen Jackson', 'karen.jackson@example.com', '474-555-7897', '1965-11-12', 212, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(558, 'Joseph King', 'joseph.king@example.com', '408-555-5559', '1982-10-28', 212, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(559, 'Sandra Turner', 'sandra.turner@example.com', '863-555-5816', '1996-06-22', 212, 0, 1, 1);

INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES
(560, 'Karen Gomez', 'karen.gomez@example.com', '643-555-4864', '1990-03-16', 212, 0, 1, 1);

-- ============================================================================
-- EXPANDED FOLDERS (60 folders = 1 per client)
-- ============================================================================
INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(601, 501, 401, '2025-12-05', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(602, 502, 401, '2025-12-12', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(603, 503, 401, '2026-02-03', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(604, 504, 401, '2025-11-16', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(605, 505, 401, '2025-12-25', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(606, 506, 402, '2025-12-01', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(607, 507, 402, '2026-01-08', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(608, 508, 402, '2026-02-11', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(609, 509, 402, '2025-12-04', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(610, 510, 402, '2025-12-25', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(611, 511, 403, '2025-12-12', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(612, 512, 403, '2026-01-18', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(613, 513, 403, '2025-12-03', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(614, 514, 403, '2025-11-16', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(615, 515, 403, '2025-12-07', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(616, 516, 404, '2025-11-25', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(617, 517, 404, '2026-01-06', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(618, 518, 404, '2025-12-04', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(619, 519, 404, '2026-02-10', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(620, 520, 404, '2025-12-07', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(621, 521, 405, '2025-12-02', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(622, 522, 405, '2026-02-05', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(623, 523, 405, '2026-01-27', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(624, 524, 405, '2025-11-15', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(625, 525, 405, '2025-12-28', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(626, 526, 406, '2026-01-23', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(627, 527, 406, '2025-12-13', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(628, 528, 406, '2025-11-17', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(629, 529, 406, '2026-01-13', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(630, 530, 406, '2026-01-18', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(631, 531, 407, '2025-12-22', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(632, 532, 407, '2026-01-29', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(633, 533, 407, '2025-11-18', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(634, 534, 407, '2026-01-12', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(635, 535, 407, '2026-01-22', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(636, 536, 408, '2025-12-09', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(637, 537, 408, '2025-12-04', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(638, 538, 408, '2025-11-27', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(639, 539, 408, '2026-01-10', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(640, 540, 408, '2026-01-06', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(641, 541, 409, '2026-02-06', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(642, 542, 409, '2026-01-14', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(643, 543, 409, '2026-01-27', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(644, 544, 409, '2025-12-21', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(645, 545, 409, '2026-01-26', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(646, 546, 410, '2026-01-23', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(647, 547, 410, '2025-12-03', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(648, 548, 410, '2026-01-14', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(649, 549, 410, '2026-02-06', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(650, 550, 410, '2025-12-02', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(651, 551, 411, '2025-12-01', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(652, 552, 411, '2026-01-08', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(653, 553, 411, '2026-02-02', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(654, 554, 411, '2025-12-31', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(655, 555, 411, '2026-01-05', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(656, 556, 412, '2025-12-04', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(657, 557, 412, '2026-01-23', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(658, 558, 412, '2025-12-17', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(659, 559, 412, '2025-12-09', 'Active', 1, 1);

INSERT INTO caseFolders (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(660, 560, 412, '2025-12-25', 'Active', 1, 1);

-- ============================================================================
-- EXPANDED SESSIONS (180 sessions = 3 per case)
-- ============================================================================
INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(701, 601, 501, 401, 1, 3, 1, '2025-12-12 00:00:00', 60, 'Initial session', '2025-12-12 00:00:00', '2025-12-12 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(702, 601, 501, 401, 1, 3, 1, '2025-12-25 00:00:00', 60, 'Follow-up session', '2025-12-25 00:00:00', '2025-12-25 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(703, 601, 501, 401, 1, 1, NULL, '2026-01-07 00:00:00', 60, 'Upcoming session', '2026-01-07 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(704, 602, 502, 401, 5, 3, 1, '2025-12-22 00:00:00', 60, 'Initial session', '2025-12-22 00:00:00', '2025-12-22 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(705, 602, 502, 401, 1, 3, 1, '2025-12-29 00:00:00', 60, 'Follow-up session', '2025-12-29 00:00:00', '2025-12-29 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(706, 602, 502, 401, 1, 1, NULL, '2026-01-12 00:00:00', 60, 'Upcoming session', '2026-01-12 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(707, 603, 503, 401, 5, 3, 1, '2026-02-12 00:00:00', 60, 'Initial session', '2026-02-12 00:00:00', '2026-02-12 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(708, 603, 503, 401, 1, 3, 1, '2026-02-21 00:00:00', 60, 'Follow-up session', '2026-02-21 00:00:00', '2026-02-21 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(709, 603, 503, 401, 1, 1, NULL, '2026-03-01 00:00:00', 60, 'Upcoming session', '2026-03-01 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(710, 604, 504, 401, 5, 3, 1, '2025-11-29 00:00:00', 60, 'Initial session', '2025-11-29 00:00:00', '2025-11-29 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(711, 604, 504, 401, 1, 3, 2, '2025-12-12 00:00:00', 60, 'Follow-up session', '2025-12-12 00:00:00', '2025-12-12 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(712, 604, 504, 401, 1, 1, NULL, '2025-12-21 00:00:00', 60, 'Upcoming session', '2025-12-21 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(713, 605, 505, 401, 5, 3, 1, '2026-01-01 00:00:00', 60, 'Initial session', '2026-01-01 00:00:00', '2026-01-01 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(714, 605, 505, 401, 1, 3, 2, '2026-01-15 00:00:00', 60, 'Follow-up session', '2026-01-15 00:00:00', '2026-01-15 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(715, 605, 505, 401, 1, 1, NULL, '2026-01-28 00:00:00', 60, 'Upcoming session', '2026-01-28 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(716, 606, 506, 402, 5, 3, 1, '2025-12-08 00:00:00', 60, 'Initial session', '2025-12-08 00:00:00', '2025-12-08 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(717, 606, 506, 402, 1, 3, 1, '2025-12-21 00:00:00', 60, 'Follow-up session', '2025-12-21 00:00:00', '2025-12-21 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(718, 606, 506, 402, 1, 1, NULL, '2025-12-31 00:00:00', 60, 'Upcoming session', '2025-12-31 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(719, 607, 507, 402, 1, 3, 1, '2026-01-17 00:00:00', 60, 'Initial session', '2026-01-17 00:00:00', '2026-01-17 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(720, 607, 507, 402, 1, 3, 1, '2026-01-30 00:00:00', 60, 'Follow-up session', '2026-01-30 00:00:00', '2026-01-30 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(721, 607, 507, 402, 1, 1, NULL, '2026-02-06 00:00:00', 60, 'Upcoming session', '2026-02-06 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(722, 608, 508, 402, 5, 3, 1, '2026-02-23 00:00:00', 60, 'Initial session', '2026-02-23 00:00:00', '2026-02-23 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(723, 608, 508, 402, 1, 3, 2, '2026-03-08 00:00:00', 60, 'Follow-up session', '2026-03-08 00:00:00', '2026-03-08 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(724, 608, 508, 402, 1, 1, NULL, '2026-03-19 00:00:00', 60, 'Upcoming session', '2026-03-19 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(725, 609, 509, 402, 1, 3, 1, '2025-12-17 00:00:00', 60, 'Initial session', '2025-12-17 00:00:00', '2025-12-17 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(726, 609, 509, 402, 1, 3, 1, '2025-12-27 00:00:00', 60, 'Follow-up session', '2025-12-27 00:00:00', '2025-12-27 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(727, 609, 509, 402, 1, 1, NULL, '2026-01-04 00:00:00', 60, 'Upcoming session', '2026-01-04 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(728, 610, 510, 402, 1, 3, 1, '2026-01-07 00:00:00', 60, 'Initial session', '2026-01-07 00:00:00', '2026-01-07 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(729, 610, 510, 402, 1, 3, 2, '2026-01-18 00:00:00', 60, 'Follow-up session', '2026-01-18 00:00:00', '2026-01-18 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(730, 610, 510, 402, 1, 1, NULL, '2026-01-29 00:00:00', 60, 'Upcoming session', '2026-01-29 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(731, 611, 511, 403, 1, 3, 1, '2025-12-19 00:00:00', 60, 'Initial session', '2025-12-19 00:00:00', '2025-12-19 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(732, 611, 511, 403, 1, 3, 2, '2026-01-02 00:00:00', 60, 'Follow-up session', '2026-01-02 00:00:00', '2026-01-02 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(733, 611, 511, 403, 1, 1, NULL, '2026-01-10 00:00:00', 60, 'Upcoming session', '2026-01-10 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(734, 612, 512, 403, 5, 3, 1, '2026-01-28 00:00:00', 60, 'Initial session', '2026-01-28 00:00:00', '2026-01-28 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(735, 612, 512, 403, 1, 3, 2, '2026-02-04 00:00:00', 60, 'Follow-up session', '2026-02-04 00:00:00', '2026-02-04 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(736, 612, 512, 403, 1, 1, NULL, '2026-02-11 00:00:00', 60, 'Upcoming session', '2026-02-11 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(737, 613, 513, 403, 1, 3, 1, '2025-12-12 00:00:00', 60, 'Initial session', '2025-12-12 00:00:00', '2025-12-12 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(738, 613, 513, 403, 1, 3, 2, '2025-12-21 00:00:00', 60, 'Follow-up session', '2025-12-21 00:00:00', '2025-12-21 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(739, 613, 513, 403, 1, 1, NULL, '2026-01-02 00:00:00', 60, 'Upcoming session', '2026-01-02 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(740, 614, 514, 403, 5, 3, 1, '2025-11-26 00:00:00', 60, 'Initial session', '2025-11-26 00:00:00', '2025-11-26 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(741, 614, 514, 403, 1, 3, 2, '2025-12-07 00:00:00', 60, 'Follow-up session', '2025-12-07 00:00:00', '2025-12-07 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(742, 614, 514, 403, 1, 1, NULL, '2025-12-14 00:00:00', 60, 'Upcoming session', '2025-12-14 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(743, 615, 515, 403, 5, 3, 1, '2025-12-19 00:00:00', 60, 'Initial session', '2025-12-19 00:00:00', '2025-12-19 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(744, 615, 515, 403, 1, 3, 2, '2026-01-01 00:00:00', 60, 'Follow-up session', '2026-01-01 00:00:00', '2026-01-01 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(745, 615, 515, 403, 1, 1, NULL, '2026-01-10 00:00:00', 60, 'Upcoming session', '2026-01-10 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(746, 616, 516, 404, 1, 3, 1, '2025-12-07 00:00:00', 60, 'Initial session', '2025-12-07 00:00:00', '2025-12-07 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(747, 616, 516, 404, 1, 3, 2, '2025-12-16 00:00:00', 60, 'Follow-up session', '2025-12-16 00:00:00', '2025-12-16 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(748, 616, 516, 404, 1, 1, NULL, '2025-12-27 00:00:00', 60, 'Upcoming session', '2025-12-27 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(749, 617, 517, 404, 5, 3, 1, '2026-01-17 00:00:00', 60, 'Initial session', '2026-01-17 00:00:00', '2026-01-17 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(750, 617, 517, 404, 1, 3, 1, '2026-01-30 00:00:00', 60, 'Follow-up session', '2026-01-30 00:00:00', '2026-01-30 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(751, 617, 517, 404, 1, 1, NULL, '2026-02-09 00:00:00', 60, 'Upcoming session', '2026-02-09 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(752, 618, 518, 404, 5, 3, 1, '2025-12-16 00:00:00', 60, 'Initial session', '2025-12-16 00:00:00', '2025-12-16 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(753, 618, 518, 404, 1, 3, 2, '2025-12-25 00:00:00', 60, 'Follow-up session', '2025-12-25 00:00:00', '2025-12-25 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(754, 618, 518, 404, 1, 1, NULL, '2026-01-04 00:00:00', 60, 'Upcoming session', '2026-01-04 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(755, 619, 519, 404, 1, 3, 1, '2026-02-23 00:00:00', 60, 'Initial session', '2026-02-23 00:00:00', '2026-02-23 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(756, 619, 519, 404, 1, 3, 2, '2026-03-09 00:00:00', 60, 'Follow-up session', '2026-03-09 00:00:00', '2026-03-09 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(757, 619, 519, 404, 1, 1, NULL, '2026-03-21 00:00:00', 60, 'Upcoming session', '2026-03-21 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(758, 620, 520, 404, 1, 3, 1, '2025-12-16 00:00:00', 60, 'Initial session', '2025-12-16 00:00:00', '2025-12-16 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(759, 620, 520, 404, 1, 3, 1, '2025-12-26 00:00:00', 60, 'Follow-up session', '2025-12-26 00:00:00', '2025-12-26 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(760, 620, 520, 404, 1, 1, NULL, '2026-01-09 00:00:00', 60, 'Upcoming session', '2026-01-09 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(761, 621, 521, 405, 5, 3, 1, '2025-12-09 00:00:00', 60, 'Initial session', '2025-12-09 00:00:00', '2025-12-09 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(762, 621, 521, 405, 1, 3, 2, '2025-12-20 00:00:00', 60, 'Follow-up session', '2025-12-20 00:00:00', '2025-12-20 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(763, 621, 521, 405, 1, 1, NULL, '2026-01-02 00:00:00', 60, 'Upcoming session', '2026-01-02 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(764, 622, 522, 405, 5, 3, 1, '2026-02-12 00:00:00', 60, 'Initial session', '2026-02-12 00:00:00', '2026-02-12 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(765, 622, 522, 405, 1, 3, 2, '2026-02-25 00:00:00', 60, 'Follow-up session', '2026-02-25 00:00:00', '2026-02-25 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(766, 622, 522, 405, 1, 1, NULL, '2026-03-09 00:00:00', 60, 'Upcoming session', '2026-03-09 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(767, 623, 523, 405, 1, 3, 1, '2026-02-07 00:00:00', 60, 'Initial session', '2026-02-07 00:00:00', '2026-02-07 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(768, 623, 523, 405, 1, 3, 2, '2026-02-16 00:00:00', 60, 'Follow-up session', '2026-02-16 00:00:00', '2026-02-16 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(769, 623, 523, 405, 1, 1, NULL, '2026-03-01 00:00:00', 60, 'Upcoming session', '2026-03-01 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(770, 624, 524, 405, 1, 3, 1, '2025-11-29 00:00:00', 60, 'Initial session', '2025-11-29 00:00:00', '2025-11-29 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(771, 624, 524, 405, 1, 3, 2, '2025-12-08 00:00:00', 60, 'Follow-up session', '2025-12-08 00:00:00', '2025-12-08 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(772, 624, 524, 405, 1, 1, NULL, '2025-12-22 00:00:00', 60, 'Upcoming session', '2025-12-22 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(773, 625, 525, 405, 1, 3, 1, '2026-01-10 00:00:00', 60, 'Initial session', '2026-01-10 00:00:00', '2026-01-10 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(774, 625, 525, 405, 1, 3, 2, '2026-01-19 00:00:00', 60, 'Follow-up session', '2026-01-19 00:00:00', '2026-01-19 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(775, 625, 525, 405, 1, 1, NULL, '2026-01-26 00:00:00', 60, 'Upcoming session', '2026-01-26 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(776, 626, 526, 406, 1, 3, 1, '2026-01-30 00:00:00', 60, 'Initial session', '2026-01-30 00:00:00', '2026-01-30 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(777, 626, 526, 406, 1, 3, 1, '2026-02-08 00:00:00', 60, 'Follow-up session', '2026-02-08 00:00:00', '2026-02-08 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(778, 626, 526, 406, 1, 1, NULL, '2026-02-15 00:00:00', 60, 'Upcoming session', '2026-02-15 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(779, 627, 527, 406, 5, 3, 1, '2025-12-23 00:00:00', 60, 'Initial session', '2025-12-23 00:00:00', '2025-12-23 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(780, 627, 527, 406, 1, 3, 1, '2025-12-30 00:00:00', 60, 'Follow-up session', '2025-12-30 00:00:00', '2025-12-30 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(781, 627, 527, 406, 1, 1, NULL, '2026-01-08 00:00:00', 60, 'Upcoming session', '2026-01-08 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(782, 628, 528, 406, 1, 3, 1, '2025-11-26 00:00:00', 60, 'Initial session', '2025-11-26 00:00:00', '2025-11-26 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(783, 628, 528, 406, 1, 3, 1, '2025-12-07 00:00:00', 60, 'Follow-up session', '2025-12-07 00:00:00', '2025-12-07 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(784, 628, 528, 406, 1, 1, NULL, '2025-12-15 00:00:00', 60, 'Upcoming session', '2025-12-15 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(785, 629, 529, 406, 5, 3, 1, '2026-01-20 00:00:00', 60, 'Initial session', '2026-01-20 00:00:00', '2026-01-20 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(786, 629, 529, 406, 1, 3, 2, '2026-02-03 00:00:00', 60, 'Follow-up session', '2026-02-03 00:00:00', '2026-02-03 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(787, 629, 529, 406, 1, 1, NULL, '2026-02-12 00:00:00', 60, 'Upcoming session', '2026-02-12 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(788, 630, 530, 406, 1, 3, 1, '2026-01-26 00:00:00', 60, 'Initial session', '2026-01-26 00:00:00', '2026-01-26 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(789, 630, 530, 406, 1, 3, 2, '2026-02-03 00:00:00', 60, 'Follow-up session', '2026-02-03 00:00:00', '2026-02-03 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(790, 630, 530, 406, 1, 1, NULL, '2026-02-10 00:00:00', 60, 'Upcoming session', '2026-02-10 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(791, 631, 531, 407, 1, 3, 1, '2026-01-01 00:00:00', 60, 'Initial session', '2026-01-01 00:00:00', '2026-01-01 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(792, 631, 531, 407, 1, 3, 2, '2026-01-10 00:00:00', 60, 'Follow-up session', '2026-01-10 00:00:00', '2026-01-10 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(793, 631, 531, 407, 1, 1, NULL, '2026-01-20 00:00:00', 60, 'Upcoming session', '2026-01-20 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(794, 632, 532, 407, 1, 3, 1, '2026-02-09 00:00:00', 60, 'Initial session', '2026-02-09 00:00:00', '2026-02-09 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(795, 632, 532, 407, 1, 3, 2, '2026-02-17 00:00:00', 60, 'Follow-up session', '2026-02-17 00:00:00', '2026-02-17 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(796, 632, 532, 407, 1, 1, NULL, '2026-02-27 00:00:00', 60, 'Upcoming session', '2026-02-27 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(797, 633, 533, 407, 5, 3, 1, '2025-11-26 00:00:00', 60, 'Initial session', '2025-11-26 00:00:00', '2025-11-26 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(798, 633, 533, 407, 1, 3, 2, '2025-12-08 00:00:00', 60, 'Follow-up session', '2025-12-08 00:00:00', '2025-12-08 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(799, 633, 533, 407, 1, 1, NULL, '2025-12-16 00:00:00', 60, 'Upcoming session', '2025-12-16 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(800, 634, 534, 407, 1, 3, 1, '2026-01-22 00:00:00', 60, 'Initial session', '2026-01-22 00:00:00', '2026-01-22 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(801, 634, 534, 407, 1, 3, 2, '2026-01-31 00:00:00', 60, 'Follow-up session', '2026-01-31 00:00:00', '2026-01-31 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(802, 634, 534, 407, 1, 1, NULL, '2026-02-13 00:00:00', 60, 'Upcoming session', '2026-02-13 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(803, 635, 535, 407, 1, 3, 1, '2026-02-04 00:00:00', 60, 'Initial session', '2026-02-04 00:00:00', '2026-02-04 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(804, 635, 535, 407, 1, 3, 1, '2026-02-18 00:00:00', 60, 'Follow-up session', '2026-02-18 00:00:00', '2026-02-18 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(805, 635, 535, 407, 1, 1, NULL, '2026-02-25 00:00:00', 60, 'Upcoming session', '2026-02-25 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(806, 636, 536, 408, 5, 3, 1, '2025-12-23 00:00:00', 60, 'Initial session', '2025-12-23 00:00:00', '2025-12-23 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(807, 636, 536, 408, 1, 3, 2, '2026-01-06 00:00:00', 60, 'Follow-up session', '2026-01-06 00:00:00', '2026-01-06 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(808, 636, 536, 408, 1, 1, NULL, '2026-01-19 00:00:00', 60, 'Upcoming session', '2026-01-19 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(809, 637, 537, 408, 5, 3, 1, '2025-12-13 00:00:00', 60, 'Initial session', '2025-12-13 00:00:00', '2025-12-13 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(810, 637, 537, 408, 1, 3, 2, '2025-12-20 00:00:00', 60, 'Follow-up session', '2025-12-20 00:00:00', '2025-12-20 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(811, 637, 537, 408, 1, 1, NULL, '2026-01-01 00:00:00', 60, 'Upcoming session', '2026-01-01 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(812, 638, 538, 408, 5, 3, 1, '2025-12-08 00:00:00', 60, 'Initial session', '2025-12-08 00:00:00', '2025-12-08 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(813, 638, 538, 408, 1, 3, 1, '2025-12-22 00:00:00', 60, 'Follow-up session', '2025-12-22 00:00:00', '2025-12-22 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(814, 638, 538, 408, 1, 1, NULL, '2026-01-05 00:00:00', 60, 'Upcoming session', '2026-01-05 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(815, 639, 539, 408, 5, 3, 1, '2026-01-22 00:00:00', 60, 'Initial session', '2026-01-22 00:00:00', '2026-01-22 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(816, 639, 539, 408, 1, 3, 1, '2026-02-04 00:00:00', 60, 'Follow-up session', '2026-02-04 00:00:00', '2026-02-04 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(817, 639, 539, 408, 1, 1, NULL, '2026-02-11 00:00:00', 60, 'Upcoming session', '2026-02-11 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(818, 640, 540, 408, 1, 3, 1, '2026-01-14 00:00:00', 60, 'Initial session', '2026-01-14 00:00:00', '2026-01-14 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(819, 640, 540, 408, 1, 3, 2, '2026-01-22 00:00:00', 60, 'Follow-up session', '2026-01-22 00:00:00', '2026-01-22 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(820, 640, 540, 408, 1, 1, NULL, '2026-02-02 00:00:00', 60, 'Upcoming session', '2026-02-02 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(821, 641, 541, 409, 1, 3, 1, '2026-02-14 00:00:00', 60, 'Initial session', '2026-02-14 00:00:00', '2026-02-14 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(822, 641, 541, 409, 1, 3, 2, '2026-02-25 00:00:00', 60, 'Follow-up session', '2026-02-25 00:00:00', '2026-02-25 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(823, 641, 541, 409, 1, 1, NULL, '2026-03-07 00:00:00', 60, 'Upcoming session', '2026-03-07 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(824, 642, 542, 409, 5, 3, 1, '2026-01-28 00:00:00', 60, 'Initial session', '2026-01-28 00:00:00', '2026-01-28 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(825, 642, 542, 409, 1, 3, 2, '2026-02-05 00:00:00', 60, 'Follow-up session', '2026-02-05 00:00:00', '2026-02-05 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(826, 642, 542, 409, 1, 1, NULL, '2026-02-19 00:00:00', 60, 'Upcoming session', '2026-02-19 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(827, 643, 543, 409, 1, 3, 1, '2026-02-05 00:00:00', 60, 'Initial session', '2026-02-05 00:00:00', '2026-02-05 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(828, 643, 543, 409, 1, 3, 1, '2026-02-15 00:00:00', 60, 'Follow-up session', '2026-02-15 00:00:00', '2026-02-15 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(829, 643, 543, 409, 1, 1, NULL, '2026-02-23 00:00:00', 60, 'Upcoming session', '2026-02-23 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(830, 644, 544, 409, 5, 3, 1, '2025-12-28 00:00:00', 60, 'Initial session', '2025-12-28 00:00:00', '2025-12-28 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(831, 644, 544, 409, 1, 3, 2, '2026-01-10 00:00:00', 60, 'Follow-up session', '2026-01-10 00:00:00', '2026-01-10 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(832, 644, 544, 409, 1, 1, NULL, '2026-01-24 00:00:00', 60, 'Upcoming session', '2026-01-24 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(833, 645, 545, 409, 1, 3, 1, '2026-02-02 00:00:00', 60, 'Initial session', '2026-02-02 00:00:00', '2026-02-02 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(834, 645, 545, 409, 1, 3, 2, '2026-02-10 00:00:00', 60, 'Follow-up session', '2026-02-10 00:00:00', '2026-02-10 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(835, 645, 545, 409, 1, 1, NULL, '2026-02-21 00:00:00', 60, 'Upcoming session', '2026-02-21 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(836, 646, 546, 410, 1, 3, 1, '2026-02-05 00:00:00', 60, 'Initial session', '2026-02-05 00:00:00', '2026-02-05 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(837, 646, 546, 410, 1, 3, 1, '2026-02-16 00:00:00', 60, 'Follow-up session', '2026-02-16 00:00:00', '2026-02-16 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(838, 646, 546, 410, 1, 1, NULL, '2026-02-24 00:00:00', 60, 'Upcoming session', '2026-02-24 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(839, 647, 547, 410, 1, 3, 1, '2025-12-14 00:00:00', 60, 'Initial session', '2025-12-14 00:00:00', '2025-12-14 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(840, 647, 547, 410, 1, 3, 2, '2025-12-25 00:00:00', 60, 'Follow-up session', '2025-12-25 00:00:00', '2025-12-25 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(841, 647, 547, 410, 1, 1, NULL, '2026-01-01 00:00:00', 60, 'Upcoming session', '2026-01-01 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(842, 648, 548, 410, 1, 3, 1, '2026-01-24 00:00:00', 60, 'Initial session', '2026-01-24 00:00:00', '2026-01-24 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(843, 648, 548, 410, 1, 3, 2, '2026-01-31 00:00:00', 60, 'Follow-up session', '2026-01-31 00:00:00', '2026-01-31 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(844, 648, 548, 410, 1, 1, NULL, '2026-02-08 00:00:00', 60, 'Upcoming session', '2026-02-08 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(845, 649, 549, 410, 1, 3, 1, '2026-02-14 00:00:00', 60, 'Initial session', '2026-02-14 00:00:00', '2026-02-14 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(846, 649, 549, 410, 1, 3, 1, '2026-02-23 00:00:00', 60, 'Follow-up session', '2026-02-23 00:00:00', '2026-02-23 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(847, 649, 549, 410, 1, 1, NULL, '2026-03-09 00:00:00', 60, 'Upcoming session', '2026-03-09 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(848, 650, 550, 410, 5, 3, 1, '2025-12-09 00:00:00', 60, 'Initial session', '2025-12-09 00:00:00', '2025-12-09 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(849, 650, 550, 410, 1, 3, 1, '2025-12-21 00:00:00', 60, 'Follow-up session', '2025-12-21 00:00:00', '2025-12-21 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(850, 650, 550, 410, 1, 1, NULL, '2025-12-30 00:00:00', 60, 'Upcoming session', '2025-12-30 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(851, 651, 551, 411, 1, 3, 1, '2025-12-15 00:00:00', 60, 'Initial session', '2025-12-15 00:00:00', '2025-12-15 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(852, 651, 551, 411, 1, 3, 1, '2025-12-26 00:00:00', 60, 'Follow-up session', '2025-12-26 00:00:00', '2025-12-26 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(853, 651, 551, 411, 1, 1, NULL, '2026-01-03 00:00:00', 60, 'Upcoming session', '2026-01-03 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(854, 652, 552, 411, 1, 3, 1, '2026-01-16 00:00:00', 60, 'Initial session', '2026-01-16 00:00:00', '2026-01-16 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(855, 652, 552, 411, 1, 3, 1, '2026-01-23 00:00:00', 60, 'Follow-up session', '2026-01-23 00:00:00', '2026-01-23 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(856, 652, 552, 411, 1, 1, NULL, '2026-02-05 00:00:00', 60, 'Upcoming session', '2026-02-05 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(857, 653, 553, 411, 1, 3, 1, '2026-02-10 00:00:00', 60, 'Initial session', '2026-02-10 00:00:00', '2026-02-10 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(858, 653, 553, 411, 1, 3, 2, '2026-02-24 00:00:00', 60, 'Follow-up session', '2026-02-24 00:00:00', '2026-02-24 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(859, 653, 553, 411, 1, 1, NULL, '2026-03-06 00:00:00', 60, 'Upcoming session', '2026-03-06 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(860, 654, 554, 411, 1, 3, 1, '2026-01-10 00:00:00', 60, 'Initial session', '2026-01-10 00:00:00', '2026-01-10 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(861, 654, 554, 411, 1, 3, 1, '2026-01-19 00:00:00', 60, 'Follow-up session', '2026-01-19 00:00:00', '2026-01-19 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(862, 654, 554, 411, 1, 1, NULL, '2026-01-31 00:00:00', 60, 'Upcoming session', '2026-01-31 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(863, 655, 555, 411, 1, 3, 1, '2026-01-17 00:00:00', 60, 'Initial session', '2026-01-17 00:00:00', '2026-01-17 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(864, 655, 555, 411, 1, 3, 2, '2026-01-30 00:00:00', 60, 'Follow-up session', '2026-01-30 00:00:00', '2026-01-30 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(865, 655, 555, 411, 1, 1, NULL, '2026-02-07 00:00:00', 60, 'Upcoming session', '2026-02-07 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(866, 656, 556, 412, 1, 3, 1, '2025-12-16 00:00:00', 60, 'Initial session', '2025-12-16 00:00:00', '2025-12-16 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(867, 656, 556, 412, 1, 3, 2, '2025-12-29 00:00:00', 60, 'Follow-up session', '2025-12-29 00:00:00', '2025-12-29 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(868, 656, 556, 412, 1, 1, NULL, '2026-01-11 00:00:00', 60, 'Upcoming session', '2026-01-11 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(869, 657, 557, 412, 1, 3, 1, '2026-01-30 00:00:00', 60, 'Initial session', '2026-01-30 00:00:00', '2026-01-30 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(870, 657, 557, 412, 1, 3, 1, '2026-02-12 00:00:00', 60, 'Follow-up session', '2026-02-12 00:00:00', '2026-02-12 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(871, 657, 557, 412, 1, 1, NULL, '2026-02-20 00:00:00', 60, 'Upcoming session', '2026-02-20 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(872, 658, 558, 412, 5, 3, 1, '2025-12-29 00:00:00', 60, 'Initial session', '2025-12-29 00:00:00', '2025-12-29 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(873, 658, 558, 412, 1, 3, 2, '2026-01-08 00:00:00', 60, 'Follow-up session', '2026-01-08 00:00:00', '2026-01-08 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(874, 658, 558, 412, 1, 1, NULL, '2026-01-17 00:00:00', 60, 'Upcoming session', '2026-01-17 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(875, 659, 559, 412, 5, 3, 1, '2025-12-16 00:00:00', 60, 'Initial session', '2025-12-16 00:00:00', '2025-12-16 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(876, 659, 559, 412, 1, 3, 2, '2025-12-27 00:00:00', 60, 'Follow-up session', '2025-12-27 00:00:00', '2025-12-27 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(877, 659, 559, 412, 1, 1, NULL, '2026-01-10 00:00:00', 60, 'Upcoming session', '2026-01-10 00:00:00', NULL, 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(878, 660, 560, 412, 5, 3, 1, '2026-01-04 00:00:00', 60, 'Initial session', '2026-01-04 00:00:00', '2026-01-04 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(879, 660, 560, 412, 1, 3, 2, '2026-01-12 00:00:00', 60, 'Follow-up session', '2026-01-12 00:00:00', '2026-01-12 00:00:00', 1, 1);

INSERT INTO sessions (id, folderId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES
(880, 660, 560, 412, 1, 1, NULL, '2026-01-23 00:00:00', 60, 'Upcoming session', '2026-01-23 00:00:00', NULL, 1, 1);

-- Generated 60 clients, 60 folders, and 180 sessions

