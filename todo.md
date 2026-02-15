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
