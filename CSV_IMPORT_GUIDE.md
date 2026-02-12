# CSV Import Guide - DoH Book One

This guide explains how to use the CSV bulk import feature to quickly populate your organizational structure and client data.

---

## Organizational Structure Import

### CSV Format

The organizational import CSV uses a **hierarchical structure** where each row represents a complete path from Company → Division → Department → Company Team.

### Required Columns

| Column Name | Required | Description | Example |
|------------|----------|-------------|---------|
| `Company` | Yes | Company name | "ABC Corporation" |
| `Division` | No | Division name within the company | "Sales Division" |
| `Department` | No | Department name within the division | "Enterprise Sales" |
| `CompanyTeam` | No | Team name within the department | "Team Alpha" |

### Important Notes

- **Use names, not IDs**: The system automatically creates entities and links them by name
- **Case-insensitive matching**: "Sales Division" and "sales division" are treated as the same
- **Automatic creation**: If an entity doesn't exist, it will be created
- **Automatic linking**: Entities are linked based on the hierarchy in each row
- **Duplicate handling**: Duplicate entries are skipped (no duplicates created)
- **Partial hierarchies**: You can import just companies, or companies with divisions, etc.

### Example: Organizational Structure CSV

```csv
Company,Division,Department,CompanyTeam
ABC Corporation,Sales Division,Enterprise Sales,Team Alpha
ABC Corporation,Sales Division,Enterprise Sales,Team Beta
ABC Corporation,Sales Division,SMB Sales,Team Gamma
ABC Corporation,Marketing Division,Digital Marketing,Content Team
ABC Corporation,Marketing Division,Digital Marketing,Social Media Team
XYZ Inc,Operations Division,Logistics,Warehouse Team A
XYZ Inc,Operations Division,Logistics,Warehouse Team B
```

**Result**: This creates:
- 2 companies: ABC Corporation, XYZ Inc
- 3 divisions: Sales Division, Marketing Division, Operations Division
- 4 departments: Enterprise Sales, SMB Sales, Digital Marketing, Logistics
- 7 company teams: Team Alpha, Team Beta, Team Gamma, Content Team, Social Media Team, Warehouse Team A, Warehouse Team B

### Validation Rules

- Company name is required (cannot be empty)
- Maximum length: 255 characters for all fields
- Empty rows are skipped
- Rows with only a company name create a company with no divisions

---

## Client Import (Coming Soon)

### CSV Format

The client import CSV allows you to bulk import clients and assign them to companies, divisions, departments, and teams.

### Required Columns

| Column Name | Required | Description | Example |
|------------|----------|-------------|---------|
| `FirstName` | Yes | Client's first name | "John" |
| `LastName` | Yes | Client's last name | "Smith" |
| `Email` | No | Client's email address | "john.smith@example.com" |
| `Phone` | No | Client's phone number | "+1-555-0123" |
| `Company` | No | Company name (must exist or will be created) | "ABC Corporation" |
| `Division` | No | Division name within the company | "Sales Division" |
| `Department` | No | Department name within the division | "Enterprise Sales" |
| `CompanyTeam` | No | Team name within the department | "Team Alpha" |
| `ReferralSource` | No | How client was referred: "FSM", "Staff", or "Client" | "FSM" |
| `ReferralId` | No | ID of the referring FSM, Staff, or Client | "5" |

### Example: Client Import CSV

```csv
FirstName,LastName,Email,Phone,Company,Division,Department,CompanyTeam,ReferralSource,ReferralId
John,Smith,john.smith@example.com,+1-555-0123,ABC Corporation,Sales Division,Enterprise Sales,Team Alpha,FSM,1
Jane,Doe,jane.doe@example.com,+1-555-0124,ABC Corporation,Sales Division,Enterprise Sales,Team Alpha,Staff,2
Mike,Johnson,mike.j@example.com,+1-555-0125,XYZ Inc,Operations Division,Logistics,Warehouse Team A,Client,3
```

### Validation Rules

- First name and last name are required
- Email must be valid format if provided
- Company/Division/Department/Team must exist in the system (import organizational structure first)
- ReferralSource must be one of: "FSM", "Staff", "Client" (case-insensitive)
- ReferralId must be a valid ID for the specified referral source type
- Duplicate detection: Clients with same first name + last name + company are skipped

---

## Tips for Successful Imports

### 1. Start with Organizational Structure
Always import your organizational structure (companies, divisions, departments, teams) **before** importing clients. This ensures all organizational entities exist when assigning clients.

### 2. Use Consistent Naming
- Use the exact same names across rows for entities that should be linked
- Example: "Sales Division" not "Sales Div" or "sales division"
- The system is case-insensitive but consistent naming improves readability

### 3. Build Hierarchies Incrementally
You can import in stages:
1. First pass: Just companies
2. Second pass: Companies with divisions
3. Third pass: Complete hierarchy with teams

### 4. Check Results
After import, the system shows:
- Number of entities created
- Number of duplicates skipped
- Any errors encountered

### 5. Export Before Import
If you already have data, export it first as a backup before doing bulk imports.

---

## Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Company name is required" | Empty company column | Ensure every row has a company name |
| "Invalid CSV format" | Missing columns or malformed CSV | Check that your CSV has the correct column headers |
| "Failed to create entity" | Database constraint violation | Check for special characters or extremely long names |
| "Referral ID not found" | ReferralId doesn't exist in database | Verify the FSM/Staff/Client ID exists before importing |

---

## Sample Templates

### Minimal Organizational Structure
```csv
Company,Division,Department,CompanyTeam
Acme Corp,,,
```
Creates a single company with no divisions.

### Company with Divisions Only
```csv
Company,Division,Department,CompanyTeam
Acme Corp,Sales,,
Acme Corp,Marketing,,
Acme Corp,Operations,,
```
Creates one company with three divisions, no departments.

### Complete Hierarchy
```csv
Company,Division,Department,CompanyTeam
Acme Corp,Sales,Enterprise,Team A
Acme Corp,Sales,Enterprise,Team B
Acme Corp,Sales,SMB,Team C
```
Creates full hierarchy: 1 company → 1 division → 2 departments → 3 teams.

---

## Need Help?

If you encounter issues with CSV imports:
1. Check this guide for format requirements
2. Verify your CSV file encoding is UTF-8
3. Ensure no special characters in entity names
4. Contact your system administrator for assistance

---

**Last Updated**: Version 1.0.21
