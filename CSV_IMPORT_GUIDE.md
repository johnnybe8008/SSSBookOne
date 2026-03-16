# CSV Import Guide - SSS Book One

This guide explains the active CSV imports in Admin > More:

- CSV Import (Staff)
- CSV Import (Clients)

Both imports now use the current schema and do not use Divisions.

---

## Staff Import

### Purpose
Bulk create staff records and optional organization hierarchy.

### CSV Columns

Required:
- `Name`
- `Organization`

Optional:
- `Email`
- `Phone`
- `Address`
- `Role` (`admin`, `counselor`, `viewer`)
- `IsVipRated` (`1/0`, `true/false`, `yes/no`)
- `StaffDepartment`
- `Team`

### Rules
- No Division column.
- If `Team` is provided, `StaffDepartment` is required.
- If `StaffDepartment` or `Team` is provided, `Organization` is required.
- Missing Organization / StaffDepartment / Team names are created automatically.
- Duplicate staff rows are skipped by:
  - email (when provided), or
  - name + organization + department + team path.

### Example

```csv
Name,Email,Phone,Address,Role,IsVipRated,Organization,StaffDepartment,Team
Jack Black,jack.black@sss.org,555-0001,11 Main St,admin,1,Central Org,Clinical Services,Intake Team
Mary Lane,mary.lane@sss.org,555-0002,22 Oak St,counselor,0,Central Org,Clinical Services,Crisis Team
Jon Doe,jon.doe@sss.org,555-0003,33 Pine St,viewer,0,North Org,Operations,
```

---

## Client Import

### Purpose
Bulk create client records in Company -> Department -> Team hierarchy.

### CSV Columns

Required:
- `Name`
- `Company`
- `Department`

Optional:
- `Email`
- `HomePhone`
- `MobilePhone`
- `WorkPhone`
- `Address`
- `Occupation`
- `Title`
- `DateOfBirth` (`YYYY-MM-DD`)
- `Team`
- `ReferralSourceType` (`fsm`, `staff`, `client`)
- `ReferralSourceId` (positive integer)

### Rules
- No Division column.
- Missing Company / Department / Team names are created automatically.
- Duplicate client rows are skipped by name + company + department.
- `ReferralSourceType` and `ReferralSourceId` should be provided together.

### Example

```csv
Name,Email,HomePhone,MobilePhone,WorkPhone,Address,Occupation,Title,DateOfBirth,Company,Department,Team,ReferralSourceType,ReferralSourceId
John Smith,john@example.com,555-0100,555-0101,,123 Main St,Engineer,Senior Engineer,1989-03-12,ABC Corp,Enterprise Sales,Team A,fsm,1
Jane Doe,jane@example.com,555-0200,,,555-0202,456 Oak Ave,Manager,Project Manager,1982-11-04,ABC Corp,Enterprise Sales,Team B,staff,2
```

---

## Tips

- Keep names consistent to avoid unintended duplicates.
- Start with small CSV batches and verify results.
- Use UTF-8 CSV files.
