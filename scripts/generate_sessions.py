#!/usr/bin/env python3
"""
Generate session INSERT statements with correct schema
"""

# Session data: (id, caseId, clientId, staffId, date, duration, notes, statusId, typeId, resultId)
sessions = [
    # Mental Health sessions (cases 601-606, staff 405)
    (701, 601, 501, 405, '2026-01-20 10:00:00', 60, 'Initial assessment session', 3, 5, 1),
    (702, 601, 501, 405, '2026-01-27 10:00:00', 60, 'Follow-up counseling', 3, 1, 1),
    (703, 601, 501, 405, '2026-02-03 10:00:00', 60, 'Ongoing therapy', 1, 1, None),
    
    (704, 602, 502, 405, '2026-01-22 14:00:00', 60, 'Initial assessment', 3, 5, 1),
    (705, 602, 502, 405, '2026-01-29 14:00:00', 60, 'Therapy session', 3, 1, 2),
    (706, 602, 502, 405, '2026-02-05 14:00:00', 60, 'Scheduled session', 1, 1, None),
    
    (707, 603, 503, 405, '2026-01-24 09:00:00', 60, 'Initial consultation', 3, 5, 1),
    (708, 603, 503, 405, '2026-01-31 09:00:00', 60, 'Counseling session', 3, 1, 1),
    (709, 603, 503, 405, '2026-02-07 09:00:00', 60, 'Upcoming session', 1, 1, None),
    
    (710, 604, 504, 405, '2026-01-26 11:00:00', 60, 'First session', 3, 5, 1),
    (711, 604, 504, 405, '2026-02-02 11:00:00', 60, 'Second session', 3, 1, 2),
    (712, 604, 504, 405, '2026-02-09 11:00:00', 60, 'Third session', 1, 1, None),
    
    (713, 605, 505, 405, '2026-01-28 15:00:00', 60, 'Initial meeting', 3, 5, 1),
    (714, 605, 505, 405, '2026-02-04 15:00:00', 60, 'Follow-up', 3, 1, 1),
    (715, 605, 505, 405, '2026-02-11 15:00:00', 60, 'Next session', 1, 1, None),
    
    (716, 606, 506, 405, '2026-01-30 13:00:00', 60, 'Assessment', 3, 5, 1),
    (717, 606, 506, 405, '2026-02-06 13:00:00', 60, 'Therapy', 3, 1, 1),
    (718, 606, 506, 405, '2026-02-13 13:00:00', 60, 'Scheduled', 1, 1, None),
    
    # Primary Care sessions (cases 607-609, staff 406)
    (719, 607, 507, 406, '2026-01-21 09:00:00', 45, 'Annual checkup', 3, 5, 1),
    (720, 607, 507, 406, '2026-01-28 09:30:00', 30, 'Lab results review', 3, 1, 1),
    (721, 607, 507, 406, '2026-02-10 09:00:00', 30, 'Follow-up', 1, 1, None),
    
    (722, 608, 508, 406, '2026-01-23 14:00:00', 45, 'Physical exam', 3, 5, 1),
    (723, 608, 508, 406, '2026-01-30 14:30:00', 30, 'Consultation', 3, 1, 2),
    (724, 608, 508, 406, '2026-02-08 14:00:00', 30, 'Next visit', 1, 1, None),
    
    (725, 609, 509, 406, '2026-01-25 10:00:00', 45, 'Health screening', 3, 5, 1),
    (726, 609, 509, 406, '2026-02-01 10:30:00', 30, 'Results discussion', 3, 1, 1),
    (727, 609, 509, 406, '2026-02-12 10:00:00', 30, 'Upcoming', 1, 1, None),
    
    # Patient Services sessions (cases 610-611, staff 407)
    (728, 610, 510, 407, '2026-01-22 11:00:00', 30, 'Registration', 3, 5, 1),
    (729, 610, 510, 407, '2026-01-29 11:00:00', 30, 'Documentation', 3, 1, 1),
    (730, 610, 510, 407, '2026-02-05 11:00:00', 30, 'Follow-up', 1, 1, None),
    
    (731, 611, 511, 407, '2026-01-24 15:00:00', 30, 'Intake', 3, 5, 1),
    (732, 611, 511, 407, '2026-01-31 15:00:00', 30, 'Services review', 3, 1, 1),
    (733, 611, 511, 407, '2026-02-07 15:00:00', 30, 'Scheduled', 1, 1, None),
    
    # Tech Solutions sessions (cases 612-613, staff 401)
    (734, 612, 512, 401, '2026-01-23 10:00:00', 90, 'Project kickoff', 3, 1, 1),
    (735, 612, 512, 401, '2026-01-30 10:00:00', 90, 'Sprint planning', 3, 1, 1),
    (736, 612, 512, 401, '2026-02-06 10:00:00', 90, 'Code review', 1, 1, None),
    
    (737, 613, 513, 401, '2026-01-25 14:00:00', 90, 'Requirements gathering', 3, 1, 1),
    (738, 613, 513, 401, '2026-02-06 14:00:00', 90, 'Design review', 3, 1, 2),
    (739, 613, 513, 401, '2026-02-13 14:00:00', 90, 'Implementation', 1, 1, None),
    
    # Education sessions (cases 614-615, staff 409)
    (740, 614, 514, 409, '2026-01-31 13:00:00', 60, 'Parent-teacher conference', 3, 1, 1),
    (741, 614, 514, 409, '2026-02-07 13:00:00', 60, 'Progress review', 3, 1, 1),
    (742, 614, 514, 409, '2026-02-14 13:00:00', 60, 'Next meeting', 1, 1, None),
    
    (743, 615, 515, 409, '2026-02-01 10:00:00', 60, 'Academic planning', 3, 1, 1),
    (744, 615, 515, 409, '2026-02-08 10:00:00', 60, 'Learning assessment', 3, 1, 2),
    (745, 615, 515, 409, '2026-02-15 10:00:00', 60, 'Follow-up', 1, 1, None),
]

print("-- ============================================================================")
print("-- SESSIONS (3 per case = 45 total with explicit IDs)")
print("-- ============================================================================")

for session in sessions:
    sid, caseId, clientId, staffId, timestamp, duration, notes, statusId, typeId, resultId = session
    
    # Calculate session times (assume session starts at timestamp and lasts for duration minutes)
    session_start = timestamp
    # For completed sessions, set end time
    if statusId == 3:  # Completed
        result_str = f", sessionResultId = {resultId}" if resultId else ""
        completed_str = f", completedAt = '{timestamp}'"
    else:
        result_str = ""
        completed_str = ""
    
    # Build INSERT statement
    result_field = f", {resultId}" if resultId else ", NULL"
    completed_field = f", '{timestamp}'" if statusId == 3 else ", NULL"
    
    print(f"INSERT INTO sessions (id, caseId, clientId, staffId, sessionTypeId, sessionStatusId, sessionResultId, sessionStartTime, sessionDuration, notes, scheduledDate, completedAt, createdBy, updatedBy) VALUES")
    print(f"({sid}, {caseId}, {clientId}, {staffId}, {typeId}, {statusId}{result_field}, '{session_start}', {duration}, '{notes}', '{session_start}'{completed_field}, 1, 1);")
    print()
