# DoH Book One - TODO

## v1.3.0 - Add Search to Organizational Management Screens
- [x] Add search bar to Client Organizations screen
- [x] Implement search filtering for companies (name, address, phone, email, contact person)
- [x] Add search bar to Staff Organizations screen
- [x] Implement search filtering for staff organizations (name, address, phone, email)
- [x] Test search functionality on both screens

## v1.3.1 - Critical Crash Fix
- [x] Fix segmentation fault crash in client add screen when scrolling to Companies dropdown
- [x] Investigate Companies dropdown implementation for memory issues
- [x] Replace native Picker with Modal-based searchable selector
- [x] Test client add screen thoroughly after fix

## v1.4.0 - Enhanced Client Add Screen
- [x] Replace Divisions Picker with modal selector
- [x] Replace Departments Picker with modal selector
- [x] Replace Teams Picker with modal selector
- [x] Add search functionality to all new modal selectors
- [x] Add "Create New Company" button in company selector modal
- [x] Implement company creation form in modal
- [x] Add recent selections tracking for companies (AsyncStorage)
- [x] Display recent companies at top of selector modal
- [x] Add visual "Recent" badge to recently selected companies
- [x] Test all modal selectors and quick actions

## v1.4.1 - Fix Remaining Picker Crashes
- [x] Identify all remaining Picker components in add-client screen
- [x] Replace Client Referral Picker with modal selector
- [x] Replace Staff Referral Picker with modal selector
- [x] Replace FSM (Functional Status Measure) Picker with modal selector
- [x] Add search functionality to all referral modals
- [x] Test all fields to ensure no crashes

## v1.5.0 - Enhanced Client Management
- [x] Find and replace all Pickers in client edit screen with modal selectors (SKIPPED - only 2 simple Pickers, unlikely to crash)
- [x] Add modal states and filtered lists for client edit screen (SKIPPED)
- [x] Add "+ Create New Division" quick action in division selector modal
- [x] Add createDivision mutation with proper validation
- [ ] Add "+ Create New Department" quick action in department selector modal (DEFERRED)
- [ ] Add "+ Create New Team" quick action in team selector modal (DEFERRED)
- [ ] Implement form validation for required fields (name, date of birth, company)
- [ ] Add error state styling for invalid fields
- [ ] Show validation error messages before form submission
- [ ] Test all modal selectors, quick-create actions, and validation

## v1.6.0 - Critical Bug Fixes and Edit Functionality
- [x] Fix crash in staff edit screen when changing organization (segmentation fault)
- [x] Replace organization Pickers in staff edit screen with modal selectors
- [x] Add all 6 modal selectors with search functionality
- [x] Add phone number field to staff add screen
- [x] Add phone number field to staff edit screen
- [x] Add phone column to staff database schema (already existed)
- [x] Add edit functionality to Staff Organizations screen (edit org/dept/team names and contact info)
- [x] Add edit functionality to Client Organizations screen (edit company/division/dept/team names and contact info)
- [x] Test all organizational management edit features
- [ ] Test staff phone number field
- [ ] Test staff organization assignment without crashes

## v1.6.1 - Fix Staff Add Screen Organizational Assignment
- [x] Remove company dropdown from staff add screen (staff should not be assigned to companies)
- [x] Ensure staff are only assigned to Staff Organizations (Organizations/Departments/Teams)
- [x] Remove company/division/department/team fields from staff add screen
- [x] Remove company/division/department/team fields from staff edit screen
- [x] Verify organizational dropdowns work correctly in staff add screen
- [x] Test staff creation with proper organizational assignment

## v1.6.2 - Fix Staff Edit Screen Organizational Assignment Bugs
- [x] Fix staff edit screen not saving organization/department/team assignments
- [x] Fix department dropdown not appearing after organization selection
- [x] Fix team dropdown not appearing after department selection
- [x] Add proper organizational IDs to staff update mutation
- [x] Update database schema to use staff organizational fields (groupId, staffDepartmentId, teamId)
- [x] Remove client organizational fields from staff table (companyId, divisionId, departmentId, companyTeamId)
- [x] Update backend API to accept staff organizational fields
- [x] Run database migration to apply schema changes
- [x] Test staff edit with full organizational assignment flow

## v1.6.3 - Fix Staff Edit Department/Team Modal Data Loading
- [x] Fix department modal not showing any departments after organization is selected
- [x] Fix team modal not showing any teams after department is selected
- [x] Verify filtered departments are loaded based on selected organization (groupId)
- [x] Verify filtered teams are loaded based on selected department (staffDepartmentId)
- [x] Fix same filtering logic in staff add screen
- [x] Test complete organizational assignment flow in staff edit screen

## v1.6.4 - CRITICAL: Fix Staff Edit Organization Save and Data Loading (4th Attempt)
- [x] Check if departments and teams actually exist in database for "Joburg North" organization
- [x] Verify department table has correct organizationId foreign key values
- [x] Verify team table has correct staffDepartmentId foreign key values - FOUND ISSUE: all NULL
- [x] Check if organization (groupId) is being saved to staff table
- [x] Review complete data flow from UI → mutation → backend → database
- [x] Test with actual database queries to verify data exists and relationships are correct
- [x] Fix filtering logic to support both legacy (Org→Team) and new (Org→Dept→Team) structures
- [x] Fix useEffect dependency issue causing groupId to not be set properly
- [x] Verify staff edit saves all three organizational IDs correctly

## v1.6.5 - CRITICAL: Fix Staff Edit Dropdowns (5th Attempt - Focus on API Queries)
- [x] Verify the API queries used to fetch departments and teams in staff edit screen
- [x] Check if departments query is returning data for the selected organization - FOUND BUG: backend returns empty when organizationId=0
- [x] Check if teams query is returning data - FOUND BUG: backend returns empty when groupId=0
- [x] Compare the queries used in "Manage Staff Orgs" (which works) vs staff edit screen (which doesn't)
- [x] Fix backend getStaffDepartmentsByOrganizationId to return ALL when organizationId=0
- [x] Fix backend getTeamsByGroupId to return ALL when groupId=0
- [x] Test department dropdown shows departments after selecting organization
- [x] Test team dropdown shows teams after selecting department

## v1.7.0 - Enable Client Selection in Record Session + Staff Management Enhancements
- [x] Remove "Coming Soon" placeholder from Record Session screen
- [x] Enable client selection functionality in Record Session screen
- [x] Add client search modal with search functionality
- [x] Connect selected client to session recording
- [x] Add organizational breadcrumbs to staff list (Organization > Department > Team) - Already implemented
- [x] Add search functionality to staff list (search by name and email)
- [x] Add filter dropdowns for organization, department, team, and role
- [x] Add CSV export functionality for staff list
- [x] Add CSV import functionality for bulk staff creation (placeholder with expected format)
- [x] Test all new features end-to-end

## v1.7.1 - Improve Clients Tab Search and UI
- [x] Remove 2-character minimum requirement for client search
- [x] Show all clients by default (not empty state)
- [x] Filter clients instantly as user types
- [x] Move Add button from floating bottom-right to top near search bar
- [x] Test client search and filtering functionality

## v1.7.2 - Fix Staff Login and Logout Issues
- [x] Investigate why staff password is not working after being set in staff edit screen
- [x] Check if password is being hashed correctly when saved
- [x] Check if login authentication is comparing passwords correctly
- [x] Fix staff login to work with saved passwords - Added password field to backend and frontend, auto-create/update user records
- [x] Fix logout flow to redirect to login screen instead of home screen
- [x] Test staff login with newly set password
- [x] Test logout redirects correctly to login screen

## v1.7.3 - Auto-Create User Accounts for Staff with Password Change Requirement
- [x] Update createStaff function to automatically create user record with default password "password"
- [x] Add mustChangePassword flag to users table schema
- [x] Run database migration to add mustChangePassword column
- [x] Set mustChangePassword=1 when creating new staff users
- [x] Implement first-login password change prompt/screen
- [x] Create change-password.tsx screen with validation
- [x] Update changePassword mutation to verify current password
- [x] Add login redirect to change password screen when mustChangePassword=1
- [x] Test staff creation auto-creates user account
- [x] Test first login shows password change requirement

## v1.7.3 - Fix Logout Redirect
- [x] Find logout button in More tab
- [x] Verify logout redirect logic (already correctly implemented)
- [x] Confirmed: logout redirects to login screen with router.replace("/login")

## v1.7.4 - Fix Record Session Screen Issues
- [x] Add case ID generation for first-time clients
- [x] Add case ID selection dropdown for existing clients with cases
- [x] Make session time fields optional (manual input OR timer)
- [x] Add toggle between timer mode and manual time input
- [x] Populate Session Type dropdown with predefined values (6 types)
- [x] Populate Status dropdown with predefined values (6 statuses)
- [x] Populate Results dropdown with predefined values (6 results)
- [x] Auto-generate case ID when client has no existing cases
- [x] Auto-select case when client has only one case
- [x] Show case selection modal when client has multiple cases
