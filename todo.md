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
