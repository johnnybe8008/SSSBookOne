-- ============================================================================
-- CLEAN SEED DATA WITH EXPLICIT IDS AND CONSISTENT RELATIONSHIPS
-- ============================================================================

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
-- CASES (1 per client = 15 total with explicit IDs)
-- ============================================================================
INSERT INTO cases (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(601, 501, 405, '2026-01-15', 'Active', 1, 1);

INSERT INTO cases (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(602, 502, 405, '2026-01-18', 'Active', 1, 1);

INSERT INTO cases (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(603, 503, 405, '2026-01-20', 'Active', 1, 1);

INSERT INTO cases (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(604, 504, 405, '2026-01-22', 'Active', 1, 1);

INSERT INTO cases (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(605, 505, 405, '2026-01-25', 'Active', 1, 1);

INSERT INTO cases (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(606, 506, 405, '2026-01-28', 'Active', 1, 1);

INSERT INTO cases (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(607, 507, 406, '2026-01-16', 'Active', 1, 1);

INSERT INTO cases (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(608, 508, 406, '2026-01-19', 'Active', 1, 1);

INSERT INTO cases (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(609, 509, 406, '2026-01-21', 'Active', 1, 1);

INSERT INTO cases (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(610, 510, 407, '2026-01-17', 'Active', 1, 1);

INSERT INTO cases (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(611, 511, 407, '2026-01-23', 'Active', 1, 1);

INSERT INTO cases (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(612, 512, 401, '2026-01-24', 'Active', 1, 1);

INSERT INTO cases (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(613, 513, 401, '2026-01-26', 'Active', 1, 1);

INSERT INTO cases (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(614, 514, 409, '2026-01-27', 'Active', 1, 1);

INSERT INTO cases (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES
(615, 515, 409, '2026-01-29', 'Active', 1, 1);

-- ============================================================================
-- SESSIONS (3 per case = 45 total with explicit IDs)
-- ============================================================================
-- Sessions for case 601 (John Doe - Mental Health)
INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(701, 601, 501, 405, '2026-01-20', 60, 'Initial assessment session', 'Completed', 1, 1);

INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(702, 601, 501, 405, '2026-01-27', 60, 'Follow-up counseling', 'Completed', 1, 1);

INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(703, 601, 501, 405, '2026-02-03', 60, 'Ongoing therapy', 'Scheduled', 1, 1);

-- Sessions for case 602 (Sarah Smith - Mental Health)
INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(704, 602, 502, 405, '2026-01-22', 60, 'Initial assessment', 'Completed', 1, 1);

INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(705, 602, 502, 405, '2026-01-29', 60, 'Therapy session', 'Completed', 1, 1);

INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(706, 602, 502, 405, '2026-02-05', 60, 'Scheduled session', 'Scheduled', 1, 1);

-- Sessions for case 603 (Michael Johnson - Mental Health)
INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(707, 603, 503, 405, '2026-01-24', 60, 'Initial consultation', 'Completed', 1, 1);

INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(708, 603, 503, 405, '2026-01-31', 60, 'Counseling session', 'Completed', 1, 1);

INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(709, 603, 503, 405, '2026-02-07', 60, 'Upcoming session', 'Scheduled', 1, 1);

-- Sessions for case 604 (Emily Williams - Mental Health)
INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(710, 604, 504, 405, '2026-01-26', 60, 'First session', 'Completed', 1, 1);

INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(711, 604, 504, 405, '2026-02-02', 60, 'Second session', 'Completed', 1, 1);

INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(712, 604, 504, 405, '2026-02-09', 60, 'Third session', 'Scheduled', 1, 1);

-- Sessions for case 605 (David Brown - Mental Health)
INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(713, 605, 505, 405, '2026-01-28', 60, 'Initial meeting', 'Completed', 1, 1);

INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(714, 605, 505, 405, '2026-02-04', 60, 'Follow-up', 'Completed', 1, 1);

INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(715, 605, 505, 405, '2026-02-11', 60, 'Next session', 'Scheduled', 1, 1);

-- Sessions for case 606 (Jessica Davis - Mental Health)
INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(716, 606, 506, 405, '2026-01-30', 60, 'Assessment', 'Completed', 1, 1);

INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(717, 606, 506, 405, '2026-02-06', 60, 'Therapy', 'Completed', 1, 1);

INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(718, 606, 506, 405, '2026-02-13', 60, 'Scheduled', 'Scheduled', 1, 1);

-- Sessions for case 607 (Robert Miller - Primary Care)
INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(719, 607, 507, 406, '2026-01-21', 45, 'Annual checkup', 'Completed', 1, 1);

INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(720, 607, 507, 406, '2026-01-28', 30, 'Lab results review', 'Completed', 1, 1);

INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(721, 607, 507, 406, '2026-02-10', 30, 'Follow-up', 'Scheduled', 1, 1);

-- Sessions for case 608 (Amanda Wilson - Primary Care)
INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(722, 608, 508, 406, '2026-01-23', 45, 'Physical exam', 'Completed', 1, 1);

INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(723, 608, 508, 406, '2026-01-30', 30, 'Consultation', 'Completed', 1, 1);

INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(724, 608, 508, 406, '2026-02-08', 30, 'Next visit', 'Scheduled', 1, 1);

-- Sessions for case 609 (James Moore - Primary Care)
INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(725, 609, 509, 406, '2026-01-25', 45, 'Health screening', 'Completed', 1, 1);

INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(726, 609, 509, 406, '2026-02-01', 30, 'Results discussion', 'Completed', 1, 1);

INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(727, 609, 509, 406, '2026-02-12', 30, 'Upcoming', 'Scheduled', 1, 1);

-- Sessions for case 610 (Linda Taylor - Patient Services)
INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(728, 610, 510, 407, '2026-01-22', 30, 'Intake coordination', 'Completed', 1, 1);

INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(729, 610, 510, 407, '2026-01-29', 30, 'Service planning', 'Completed', 1, 1);

INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(730, 610, 510, 407, '2026-02-09', 30, 'Follow-up', 'Scheduled', 1, 1);

-- Sessions for case 611 (Christopher Anderson - Patient Services)
INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(731, 611, 511, 407, '2026-01-27', 30, 'Initial intake', 'Completed', 1, 1);

INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(732, 611, 511, 407, '2026-02-03', 30, 'Coordination', 'Completed', 1, 1);

INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(733, 611, 511, 407, '2026-02-11', 30, 'Next meeting', 'Scheduled', 1, 1);

-- Sessions for case 612 (Patricia Thomas - Frontend Development)
INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(734, 612, 512, 401, '2026-01-28', 90, 'Project kickoff', 'Completed', 1, 1);

INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(735, 612, 512, 401, '2026-02-04', 90, 'Development review', 'Completed', 1, 1);

INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(736, 612, 512, 401, '2026-02-11', 90, 'Sprint planning', 'Scheduled', 1, 1);

-- Sessions for case 613 (Matthew Jackson - Frontend Development)
INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(737, 613, 513, 401, '2026-01-30', 90, 'Requirements gathering', 'Completed', 1, 1);

INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(738, 613, 513, 401, '2026-02-06', 90, 'Design review', 'Completed', 1, 1);

INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(739, 613, 513, 401, '2026-02-13', 90, 'Implementation', 'Scheduled', 1, 1);

-- Sessions for case 614 (Barbara White - Elementary Education)
INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(740, 614, 514, 409, '2026-01-31', 60, 'Parent-teacher conference', 'Completed', 1, 1);

INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(741, 614, 514, 409, '2026-02-07', 60, 'Progress review', 'Completed', 1, 1);

INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(742, 614, 514, 409, '2026-02-14', 60, 'Next meeting', 'Scheduled', 1, 1);

-- Sessions for case 615 (Joseph Harris - Elementary Education)
INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(743, 615, 515, 409, '2026-02-01', 60, 'Academic planning', 'Completed', 1, 1);

INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(744, 615, 515, 409, '2026-02-08', 60, 'Learning assessment', 'Completed', 1, 1);

INSERT INTO sessions (id, caseId, clientId, staffId, sessionDate, duration, notes, status, createdBy, updatedBy) VALUES
(745, 615, 515, 409, '2026-02-15', 60, 'Follow-up', 'Scheduled', 1, 1);
