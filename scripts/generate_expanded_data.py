#!/usr/bin/env python3
"""
Generate expanded sample data with 50+ clients across all 12 departments
"""

import random
from datetime import datetime, timedelta

# Department mapping: (dept_id, dept_name, staff_id, company_name)
departments = [
    (201, "Frontend Development", 401, "Tech Solutions"),
    (202, "Backend Development", 402, "Tech Solutions"),
    (203, "IT Support", 403, "Tech Solutions"),
    (204, "Quality Assurance", 404, "Tech Solutions"),
    (205, "Mental Health", 405, "Healthcare Partners"),
    (206, "Primary Care", 406, "Healthcare Partners"),
    (207, "Patient Services", 407, "Healthcare Partners"),
    (208, "Medical Records", 408, "Healthcare Partners"),
    (209, "Elementary Education", 409, "Education First"),
    (210, "Secondary Education", 410, "Education First"),
    (211, "Adult Learning", 411, "Education First"),
    (212, "Curriculum Development", 412, "Education First"),
]

# Sample first names
first_names = [
    "John", "Sarah", "Michael", "Emily", "David", "Jessica", "Robert", "Amanda",
    "James", "Jennifer", "William", "Linda", "Richard", "Patricia", "Joseph", "Mary",
    "Thomas", "Barbara", "Charles", "Susan", "Christopher", "Karen", "Daniel", "Nancy",
    "Matthew", "Lisa", "Anthony", "Betty", "Mark", "Margaret", "Donald", "Sandra",
    "Steven", "Ashley", "Paul", "Kimberly", "Andrew", "Emily", "Joshua", "Donna",
    "Kenneth", "Michelle", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa",
    "Edward", "Deborah", "Ronald", "Stephanie", "Timothy", "Rebecca", "Jason", "Sharon",
    "Jeffrey", "Laura", "Ryan", "Cynthia"
]

# Sample last names
last_names = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
    "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas",
    "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White",
    "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young",
    "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
    "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
    "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker"
]

# Generate 60 clients (5 per department)
client_id = 501
case_id = 601
session_id = 701

print("-- ============================================================================")
print("-- EXPANDED CLIENTS (60 clients = 5 per department)")
print("-- ============================================================================")

clients_per_dept = []

for dept_id, dept_name, staff_id, company_name in departments:
    for i in range(5):
        first = random.choice(first_names)
        last = random.choice(last_names)
        name = f"{first} {last}"
        email = f"{first.lower()}.{last.lower()}@example.com"
        phone = f"{random.randint(200,999)}-555-{random.randint(1000,9999)}"
        
        # Random date of birth (25-65 years old)
        age_days = random.randint(25*365, 65*365)
        dob = (datetime.now() - timedelta(days=age_days)).strftime("%Y-%m-%d")
        
        print(f"INSERT INTO clients (id, name, email, phone, dateOfBirth, departmentId, isVip, createdBy, updatedBy) VALUES")
        print(f"({client_id}, '{name}', '{email}', '{phone}', '{dob}', {dept_id}, 0, 1, 1);")
        print()
        
        clients_per_dept.append((client_id, name, dept_id, staff_id))
        client_id += 1

print("-- ============================================================================")
print("-- EXPANDED CASES (60 cases = 1 per client)")
print("-- ============================================================================")

cases_data = []
for client_id, name, dept_id, staff_id in clients_per_dept:
    # Random start date in the past 3 months
    days_ago = random.randint(1, 90)
    start_date = (datetime.now() - timedelta(days=days_ago)).strftime("%Y-%m-%d")
    
    print(f"INSERT INTO cases (id, clientId, createdByStaffId, startDate, status, createdBy, updatedBy) VALUES")
    print(f"({case_id}, {client_id}, {staff_id}, '{start_date}', 'Active', 1, 1);")
    print()
    
    cases_data.append((case_id, client_id, staff_id, start_date))
    case_id += 1

print("-- ============================================================================")
print("-- EXPANDED SESSIONS (180 sessions = 3 per case)")
print("-- ============================================================================")

for case_id, client_id, staff_id, start_date in cases_data:
    start = datetime.strptime(start_date, "%Y-%m-%d")
    
    # Session 1: 1-2 weeks after case start (Completed)
    session1_date = start + timedelta(days=random.randint(7, 14))
    session1_str = session1_date.strftime("%Y-%m-%d %H:%M:%S")
    print(f"INSERT INTO sessions (id, caseId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES")
    print(f"({session_id}, {case_id}, {client_id}, {staff_id}, {random.choice([1,5])}, 3, 1, '{session1_str}', 60, 'Initial session', '{session1_str}', '{session1_str}', 1, 1);")
    print()
    session_id += 1
    
    # Session 2: 1-2 weeks after session 1 (Completed)
    session2_date = session1_date + timedelta(days=random.randint(7, 14))
    session2_str = session2_date.strftime("%Y-%m-%d %H:%M:%S")
    print(f"INSERT INTO sessions (id, caseId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES")
    print(f"({session_id}, {case_id}, {client_id}, {staff_id}, 1, 3, {random.choice([1,2])}, '{session2_str}', 60, 'Follow-up session', '{session2_str}', '{session2_str}', 1, 1);")
    print()
    session_id += 1
    
    # Session 3: 1-2 weeks after session 2 (Scheduled)
    session3_date = session2_date + timedelta(days=random.randint(7, 14))
    session3_str = session3_date.strftime("%Y-%m-%d %H:%M:%S")
    print(f"INSERT INTO sessions (id, caseId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES")
    print(f"({session_id}, {case_id}, {client_id}, {staff_id}, 1, 1, NULL, '{session3_str}', 60, 'Upcoming session', '{session3_str}', NULL, 1, 1);")
    print()
    session_id += 1

print(f"-- Generated {len(clients_per_dept)} clients, {len(cases_data)} cases, and {len(cases_data) * 3} sessions")
