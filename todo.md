# DoH Book One - Project TODO

## Database Schema
- [ ] Create Groups table with audit fields
- [ ] Create Teams table with group relationship
- [ ] Create Staff table with team relationship and VIP/admin flags
- [ ] Create Companies table with audit fields
- [ ] Create Divisions table with company relationship
- [ ] Create Departments table with division relationship
- [ ] Create Clients table with department relationship and polymorphic referral
- [ ] Create FSMs table (Field Staff Members - referral sources)
- [ ] Create Cases table with client and staff relationships
- [ ] Create Session Types lookup table
- [ ] Create Session Status lookup table
- [ ] Create Session Results lookup table
- [ ] Create Sessions table with all relationships and dual timers
- [ ] Create Notifications table with session relationship
- [ ] Add database indexes for performance
- [ ] Add database constraints and validations

## Backend API
- [ ] Implement Groups CRUD endpoints
- [ ] Implement Teams CRUD endpoints
- [ ] Implement Staff CRUD endpoints
- [ ] Implement Companies CRUD endpoints
- [ ] Implement Divisions CRUD endpoints
- [ ] Implement Departments CRUD endpoints
- [ ] Implement Clients CRUD endpoints with search and filtering
- [ ] Implement FSMs CRUD endpoints
- [ ] Implement Cases CRUD endpoints with VIP authorization
- [ ] Implement Session Types CRUD endpoints (admin only)
- [ ] Implement Session Status CRUD endpoints (admin only)
- [ ] Implement Session Results CRUD endpoints (admin only)
- [ ] Implement Sessions CRUD endpoints with 48-hour edit restriction
- [ ] Implement Notifications CRUD endpoints
- [ ] Implement session duration calculations
- [ ] Implement VIP access control middleware
- [ ] Implement 48-hour edit window validation
- [ ] Implement notification scheduling logic
- [ ] Implement reporting queries (billable hours by staff/client/period)
- [ ] Implement reporting queries (summary by company/division/department)
- [ ] Implement dashboard queries (upcoming/recent sessions)

## Authentication & Authorization
- [ ] Implement user authentication with Admin and Staff roles
- [ ] Implement role-based access control middleware
- [ ] Implement VIP-rated staff authorization checks
- [ ] Implement session edit time restriction checks
- [ ] Add audit trail tracking (created_by, updated_by, timestamps)

## Core UI Screens
- [ ] Update tab bar navigation with 5 tabs (Home, Clients, Sessions, Reports, More)
- [ ] Create Dashboard screen with welcome message
- [ ] Add upcoming sessions list to Dashboard (next 7 days)
- [ ] Add recent sessions list to Dashboard (last 7 days)
- [ ] Add monthly billable hours summary to Dashboard
- [ ] Add sync status indicator to Dashboard
- [ ] Create Clients screen with search bar
- [ ] Add client list with company info display
- [ ] Add filter chips for company/division/department
- [ ] Add floating action button to add new client
- [ ] Create Client Detail screen with contact information
- [ ] Add organization hierarchy display to Client Detail
- [ ] Add referral source information to Client Detail
- [ ] Add case history section to Client Detail
- [ ] Add VIP badge display for VIP clients
- [ ] Create Session Recording screen with client header
- [ ] Add case selection dropdown to Session Recording
- [ ] Add session type dropdown to Session Recording
- [ ] Add session status dropdown to Session Recording
- [ ] Add scheduled date/time picker to Session Recording
- [ ] Add timer mode with Interview and Session timers
- [ ] Add manual time entry mode to Session Recording
- [ ] Add billable hours input to Session Recording
- [ ] Add session result dropdown to Session Recording
- [ ] Add notes text area to Session Recording
- [ ] Create Sessions screen with filterable list
- [ ] Add filter bar with date range, staff, client, status
- [ ] Add session cards with edit indicators
- [ ] Create Reports screen with report type selector
- [ ] Add date range picker to Reports
- [ ] Add filter options to Reports
- [ ] Add results display with charts and tables
- [ ] Add export functionality (PDF/CSV)
- [ ] Create More screen with profile section
- [ ] Add settings options to More screen
- [ ] Add admin section to More screen (admin only)

## Session Recording & Case Management
- [ ] Implement session recording workflow
- [ ] Implement VIP authorization check for case creation
- [ ] Implement dual timer functionality (Interview and Session)
- [ ] Implement manual time entry functionality
- [ ] Implement auto-calculation of durations
- [ ] Implement billable hours input (can differ from duration)
- [ ] Implement session result selection
- [ ] Implement notes text area
- [ ] Implement session save with validation
- [ ] Implement case creation workflow
- [ ] Implement case history display
- [ ] Implement case status management (Active/Closed/On Hold)

## Client Management
- [ ] Implement add client workflow
- [ ] Implement client form with all fields
- [ ] Implement organization hierarchy navigation
- [ ] Implement referral source selection (FSMs, Staff, Clients)
- [ ] Implement notification preference selection (SMS/WhatsApp)
- [ ] Implement opt-out flag
- [ ] Implement VIP flag (admin only)
- [ ] Implement client search functionality
- [ ] Implement client filtering by company/division/department
- [ ] Implement client edit functionality
- [ ] Implement client status management (Active/Inactive/Referred/On Hold)

## Notification System
- [ ] Implement notification scheduling for scheduled sessions
- [ ] Create 24-hour before notification (Email + SMS/WhatsApp)
- [ ] Create 1-hour before notification (SMS/WhatsApp only)
- [ ] Implement client opt-out handling
- [ ] Implement notification preference handling (SMS vs WhatsApp)
- [ ] Display warning when scheduling session with opted-out client
- [ ] Implement background job for notification processing
- [ ] Integrate Twilio for SMS
- [ ] Integrate WhatsApp Business API
- [ ] Integrate SendGrid for email
- [ ] Request environment variables from user (Twilio, SendGrid)

## Offline Sync
- [ ] Implement local storage with AsyncStorage/SQLite
- [ ] Implement offline session recording
- [ ] Implement sync queue for offline operations
- [ ] Implement auto-sync when connection restored
- [ ] Implement conflict resolution (last-write-wins with timestamp)
- [ ] Add sync status indicator to UI
- [ ] Add pending changes count display
- [ ] Add manual "Sync Now" button
- [ ] Implement sync progress feedback

## Reporting & Dashboards
- [ ] Implement billable hours report by staff
- [ ] Implement billable hours report by client
- [ ] Implement billable hours report by time period
- [ ] Implement summary report by company
- [ ] Implement summary report by division
- [ ] Implement summary report by department
- [ ] Add report filters (Group, Team, Session Type, Status)
- [ ] Implement staff dashboard queries
- [ ] Implement admin dashboard queries
- [ ] Add charts for data visualization
- [ ] Implement PDF export functionality
- [ ] Implement CSV export functionality

## Admin Features
- [ ] Create Manage Organizations screen (Groups, Teams, Staff)
- [ ] Implement Groups CRUD UI
- [ ] Implement Teams CRUD UI
- [ ] Implement Staff CRUD UI
- [ ] Create Manage Companies screen (Companies, Divisions, Departments)
- [ ] Implement Companies CRUD UI
- [ ] Implement Divisions CRUD UI
- [ ] Implement Departments CRUD UI
- [ ] Create Manage Lookup Tables screen
- [ ] Implement Session Types CRUD UI
- [ ] Implement Session Status CRUD UI
- [ ] Implement Session Results CRUD UI
- [ ] Create Manage FSMs screen
- [ ] Implement FSMs CRUD UI
- [ ] Create User Management screen
- [ ] Implement create staff user account UI
- [ ] Implement assign VIP ratings UI
- [ ] Implement assign admin privileges UI

## Edit Restrictions & Business Rules
- [ ] Implement 48-hour edit window for staff
- [ ] Disable edit button after 48 hours for staff
- [ ] Allow admin to edit sessions any time
- [ ] Track all edits with updated_at and updated_by
- [ ] Implement VIP client case creation restriction
- [ ] Prevent non-VIP staff from adding sessions to VIP cases
- [ ] Allow non-VIP staff to view VIP clients

## Branding & Assets
- [ ] Generate custom app logo
- [ ] Update app.config.ts with app name
- [ ] Update app.config.ts with logo URL
- [ ] Copy logo to assets/images/icon.png
- [ ] Copy logo to assets/images/splash-icon.png
- [ ] Copy logo to assets/images/favicon.png
- [ ] Copy logo to assets/images/android-icon-foreground.png

## Testing
- [ ] Write unit tests for database models
- [ ] Write unit tests for VIP access control logic
- [ ] Write unit tests for 48-hour edit restriction logic
- [ ] Write unit tests for time calculations
- [ ] Write unit tests for notification scheduling logic
- [ ] Write integration tests for API endpoints
- [ ] Write integration tests for authentication
- [ ] Write integration tests for session recording flow
- [ ] Write integration tests for offline sync
- [ ] Test all user flows end-to-end
- [ ] Test VIP access control enforcement
- [ ] Test edit restrictions enforcement
- [ ] Test notification sending
- [ ] Test offline mode functionality

## Final Steps
- [ ] Review all features for completeness
- [ ] Test on iOS device via Expo Go
- [ ] Test on Android device via Expo Go
- [ ] Verify all business rules are enforced
- [ ] Verify all user flows work correctly
- [ ] Create first checkpoint for deployment

## Phase 1 Progress Update
- [x] Create Groups table with audit fields
- [x] Create Teams table with group relationship
- [x] Create Staff table with team relationship and VIP/admin flags
- [x] Create Companies table with audit fields
- [x] Create Divisions table with company relationship
- [x] Create Departments table with division relationship
- [x] Create Clients table with department relationship and polymorphic referral
- [x] Create FSMs table (Field Staff Members - referral sources)
- [x] Create Cases table with client and staff relationships
- [x] Create Session Types lookup table
- [x] Create Session Status lookup table
- [x] Create Session Results lookup table
- [x] Create Sessions table with all relationships and dual timers
- [x] Create Notifications table with session relationship
- [x] Add database indexes for performance
- [x] Add database constraints and validations
- [x] Implement Groups CRUD endpoints
- [x] Implement Teams CRUD endpoints
- [x] Implement Staff CRUD endpoints
- [x] Implement Companies CRUD endpoints
- [x] Implement Divisions CRUD endpoints
- [x] Implement Departments CRUD endpoints
- [x] Implement Clients CRUD endpoints with search and filtering
- [x] Implement FSMs CRUD endpoints
- [x] Implement Cases CRUD endpoints with VIP authorization
- [x] Implement Session Types CRUD endpoints (admin only)
- [x] Implement Session Status CRUD endpoints (admin only)
- [x] Implement Session Results CRUD endpoints (admin only)
- [x] Implement Sessions CRUD endpoints with 48-hour edit restriction
- [x] Implement Notifications CRUD endpoints
- [x] Implement session duration calculations
- [x] Implement VIP access control middleware
- [x] Implement 48-hour edit window validation
- [x] Implement notification scheduling logic
- [x] Implement reporting queries (billable hours by staff/client/period)
- [x] Implement reporting queries (summary by company/division/department)
- [x] Implement dashboard queries (upcoming/recent sessions)

## Phase 2 Progress Update - Core UI Screens
- [x] Update tab bar navigation with 5 tabs (Home, Clients, Sessions, Reports, More)
- [x] Create Dashboard screen with welcome message
- [x] Add upcoming sessions list to Dashboard (next 7 days)
- [x] Add recent sessions list to Dashboard (last 7 days)
- [x] Add monthly billable hours summary to Dashboard
- [x] Add sync status indicator to Dashboard
- [x] Create Clients screen with search bar
- [x] Add client list with company info display
- [x] Add filter chips for company/division/department
- [x] Add floating action button to add new client
- [x] Create Sessions screen with filterable list
- [x] Add filter bar with date range, staff, client, status
- [x] Add session cards with edit indicators
- [x] Create Reports screen with report type selector
- [x] Add date range picker to Reports
- [x] Add filter options to Reports
- [x] Add results display with charts and tables
- [x] Add export functionality (PDF/CSV)
- [x] Create More screen with profile section
- [x] Add settings options to More screen
- [x] Add admin section to More screen (admin only)

## Phase 3 Progress Update - Branding
- [x] Generate custom app logo with book and heart theme
- [x] Copy logo to all required asset locations
- [x] Update app.config.ts with app name "DoH Book One"
- [x] Update app.config.ts with logo URL

## Bug Fixes
- [x] Fix app.config.ts slug placeholder causing EAS build failure
- [x] Update appSlug from {{project_name}} to valid slug value

## Authentication Development
- [x] Add development bypass to auto-login as admin for testing
- [x] Create mock admin user in database
- [x] Update Log In button to trigger auto-login
- [x] Store mock session in AsyncStorage

## Logo Update
- [x] Replace app logo with custom DMSMH branding
- [x] Copy new logo to all required asset locations
- [x] Update app.config.ts with new logo URL

## Bug Fixes - Unmatched Routes
- [x] Create add-client screen for the + button on Clients tab
- [ ] Create record-session screen for the + button on Dashboard
- [x] Create admin management screen for companies
- [ ] Create admin management screens for divisions, departments
- [ ] Create admin management screens for staff, FSMs, lookup tables
- [ ] Fix all navigation routes to point to existing screens

## Bug Fixes - Authentication
- [x] Fix "Not Logged In" screen appearing in More tab
- [x] Remove broken "/login" route that causes page not found error
- [x] Redirect to Home tab instead of showing broken login button

## Authentication System
- [x] Create login screen with email/password fields
- [x] Implement backend email/password authentication API
- [x] Create default admin user (admin@dohbookone.com / password)
- [x] Add password change functionality
- [x] Replace auto-login with proper login flow
- [x] Add server initialization to create default admin on startup

## Bug Fixes - Authentication Persistence
- [x] Fix login state not persisting after successful authentication
- [x] Update login screen to use Auth helper functions (setUserInfo, setSessionToken)
- [x] Ensure More tab shows admin section after login instead of login prompt

## UI Improvements
- [x] Remove default admin credentials display from login screen for better security

## Bug Fixes - Admin Section Missing
- [x] Fix More tab not showing admin management buttons
- [x] Create default group and team for admin staff record
- [x] Create staff record for default admin user during initialization
- [x] Admin section now visible in More tab after login

## Bug Fixes - Admin Staff Record Migration
- [x] Update initialization to check if admin user exists without staff record
- [x] Create staff record for existing admin users who don't have one
- [x] Ensure admin section appears for all admin users regardless of when they were created

## Bug Fixes - Version and Admin Account
- [x] Increment version number in app.config.ts to 1.0.6
- [x] Create API endpoint to manually trigger admin staff record creation
- [x] Add "Fix Admin Account" button in More tab settings for troubleshooting
- [ ] Fix non-functional menu items in More tab (Edit Profile, Notifications, About)

## UI Improvements - Login Screen
- [x] Remove suggested email display (admin@dohbookone.com) from login screen for cleaner UI

## Bug Fixes - Missing Fix Admin Account Button
- [ ] Investigate why Fix Admin Account button doesn't appear in v1.0.6 Settings section
- [ ] Verify button was included in checkpoint 59cd3842
- [ ] Check if button is conditionally hidden based on user state

## v1.0.8 Bug Fixes
- [x] Fix Admin Account button not appearing in More tab Settings section
- [x] Fix Settings menu items 1-4 (Edit Profile, Notifications, Sync Data, About) doing nothing when tapped
- [x] Fix version number display showing v1.0.0 instead of actual version from app.config.ts
- [x] Verify admin section appears for users with staff records

## v1.0.9 Authentication Fix
- [x] Fix "Please login (10001)" error when using Fix Admin Account button
- [x] Ensure session token is properly sent with all tRPC API requests
- [x] Verify authentication persists after app restart
- [x] Test all authenticated API calls work correctly

## v1.0.10 Token Validation & UX Fixes
- [x] Fix session token validation - tokens created by login endpoint aren't being recognized by backend
- [x] Investigate why backend context.user is null despite valid token being sent
- [x] Improve More tab UX - show user settings for all users, admin section only for admins
- [x] Consider renaming More tab to Admin if it only contains admin functions
- [x] Test that Fix Admin Account works after token validation fix

## v1.0.11 Data Management Features
- [x] Fix data refetching - users shouldn't need to logout/login to see updates
- [x] Add automatic query invalidation after mutations
- [x] Implement Divisions management screen (add/edit/delete divisions for companies)
- [x] Implement Departments management screen (add/edit/delete departments for divisions)
- [x] Activate "Manage Lookup Tables" button in More tab
- [x] Create Lookup Tables management screen for session types, statuses, and results
- [x] Test all CRUD operations work without requiring logout/login
- [x] Activate "Manage Organizations" button (Groups/Teams management)
- [x] Activate "Manage FSMs" button
- [x] Create tRPC endpoints for divisions (list, create, delete)
- [x] Create tRPC endpoints for departments (list, create, delete)
- [x] Create tRPC endpoints for groups/teams (list, create, delete)
- [x] Create tRPC endpoints for FSMs (list, create, delete)

## v1.0.12 Core Features - Session Recording, Client Management, User Management

### Session Recording Screen
- [x] Create session recording screen with dual timers (Interview Time + Session Time)
- [x] Implement start/stop/pause functionality for both timers
- [x] Add session type, status, and result dropdowns (from lookup tables)
- [x] Add FSM/referral source selection
- [x] Add notes field for session details
- [x] Save session to database with all metadata
- [x] Link session to client
- [x] Display session history for each client

### Client Management
- [x] Create clients list screen showing all clients
- [x] Implement client search and filtering
- [x] Create add client screen with all required fields
- [x] Link clients to companies, divisions, and departments
- [x] Create client detail screen showing profile and session history
- [x] Implement edit client functionality
- [ ] Add delete client with confirmation
- [ ] Display client statistics (total sessions, last session date, etc.)

### User Management
- [x] Create staff/users list screen
- [x] Implement add user functionality
- [x] Assign users to groups and teams
- [x] Set user roles (Admin, Counselor, Viewer)
- [ ] Implement edit user functionality
- [x] Add delete user with confirmation
- [ ] Display user statistics (assigned clients, sessions conducted, etc.)
- [ ] Implement user permissions based on role

## v1.0.13 Full CRUD Operations for All Admin Screens

### 1. Lookup Tables Enhancement
- [x] Departments: Allow multiple entries with descriptions, edit, and delete
- [x] Groups: Allow multiple entries with descriptions, edit, and delete
- [x] Session Types: Add edit and delete functionality
- [x] Session Statuses: Add edit and delete functionality
- [x] Session Results: Add edit and delete functionality

### 2. Companies Enhancement
- [x] Add full contact info fields (name, address, phone, email)
- [ ] Add dropdown menu for Departments
- [ ] Add dropdown menu for Groups
- [x] Implement edit functionality
- [x] Implement delete with confirmation

### 3. Organizations Enhancement
- [ ] Add full contact info fields (name, address, phone, email)
- [ ] Implement edit functionality
- [ ] Implement delete with confirmation

### 4. FSMs Enhancement
- [x] Add full contact info fields (name, address, phone, email)
- [x] Implement edit functionality
- [x] Implement delete with confirmation

### 5. Clients Enhancement
- [x] Implement edit functionality with full form
- [ ] Implement delete with confirmation
- [x] Ensure all contact fields are editable

### 6. Users Enhancement
- [ ] Implement edit functionality with full form
- [ ] Ensure role and team assignment are editable
- [ ] Improve delete confirmation

## v1.0.14 Organizational Hierarchy Redesign

### 1. Lookup Tables Restructure
- [ ] Remove session types, statuses, and results from Lookup Tables
- [ ] Restructure Lookup Tables to only manage Divisions, Departments, and Teams
- [ ] Add auto-generated unique code/account number for each Division
- [ ] Add auto-generated unique code/account number for each Department
- [ ] Add auto-generated unique code/account number for each Team
- [ ] Make description field mandatory for all three entity types
- [ ] Implement code generation logic (e.g., DIV-001, DEPT-001, TEAM-001)

### 2. Database Schema Updates
- [x] Add companyId foreign key to divisions table (already exists)
- [x] Add divisionId foreign key to departments table (already exists)
- [x] Create separate companyTeams table (departmentId foreign key)
- [x] Add unique code fields to divisions, departments, and companyTeams tables
- [x] Create database migration for schema changes
- [x] Update tRPC endpoints to support company-specific filtering
- [x] Separate Teams (staff) from Company Teams (client organization)

### 3. Company Management Enhancement
- [ ] Add Division selection/creation within Company add/edit screen
- [ ] Add Department selection/creation within each Division
- [ ] Add Team selection/creation within each Department
- [ ] Implement cascading hierarchy display (Company → Divisions → Departments → Teams)
- [ ] Show unique codes for each organizational level
- [ ] Allow adding/removing Divisions, Departments, and Teams from Company screen

### 4. Client Creation Update
- [ ] Filter Divisions dropdown to show only divisions for selected Company
- [ ] Filter Departments dropdown to show only departments for selected Division
- [ ] Filter Teams dropdown to show only teams for selected Department
- [ ] Update client creation workflow to enforce hierarchical selection
- [ ] Display full hierarchy path in client detail (Company → Division → Department → Team)

## v1.0.15 Complete Organizational Hierarchy Implementation

### 1. Company Teams Backend
- [x] Add Company Teams CRUD functions to db.ts (create, read, update, delete)
- [x] Add Company Teams tRPC router with all endpoints
- [x] Implement auto-generated code for Company Teams (CTEAM-001, CTEAM-002, etc.)
- [x] Add getCompanyTeamsByDepartmentId function
- [x] Test Company Teams API endpoints

### 2. Hierarchy Viewer
- [x] Create new admin-hierarchy screen to view all Divisions, Departments, and Company Teams
- [x] Display auto-generated codes for each entity
- [x] Show parent hierarchy (Company for Divisions, Division for Departments, Department for Company Teams)
- [x] Add link to Hierarchy viewer in More tab
- [x] Keep existing Lookup Tables for session types/statuses/results

### 3. Client Creation Enhancement
- [ ] Update add-client screen with cascading dropdowns
- [ ] Filter Divisions by selected Company
- [ ] Filter Departments by selected Division
- [ ] Filter Company Teams by selected Department
- [ ] Display full hierarchy path in client detail
- [ ] Update edit-client screen with same cascading logic

### 4. Company Management Enhancement
- [ ] Show Divisions list in Company detail/edit screen
- [ ] Allow adding/removing Divisions from Company screen
- [ ] Navigate to Departments when clicking a Division
- [ ] Navigate to Company Teams when clicking a Department
- [ ] Display entity codes throughout the hierarchy

## v1.0.16 Cascading Dropdowns for Client Creation

### Client Creation Enhancement
- [x] Update add-client screen with cascading dropdowns
- [x] Filter Divisions by selected Company
- [x] Filter Departments by selected Division
- [x] Filter Company Teams by selected Department
- [x] Reset child selections when parent changes
- [x] Show loading states during filtering
- [x] Display Company Team codes in selection UI

### Client Editing Enhancement
- [ ] Update edit-client screen with same cascading logic (deferred - client already linked to department)
- [ ] Preserve existing selections when editing
- [ ] Handle cases where existing data might be orphaned

### Testing
- [x] Test full cascade: Company → Division → Department → Company Team
- [x] Test changing Company resets Division/Department/Team
- [x] Test changing Division resets Department/Team
- [x] Test changing Department resets Team
- [ ] Verify client saves with correct hierarchy (needs user testing)

## v1.0.17 Requirements - ID Display and Navigation Improvements
- [ ] Display unique ID numbers on all edit/delete screens (Companies, Clients, Staff, FSMs, Departments, Divisions, Company Teams, Staff Teams)
- [ ] Create submenu navigation for Lookup Tables (Departments, Divisions, Company Teams)
- [ ] Add list/add/edit/delete capabilities for each organizational entity in Lookup Tables submenu
- [ ] Make Departments, Divisions, and Company Teams visible and selectable when editing/adding Companies
- [ ] Make Company, Departments, Divisions, and Company Teams visible when editing Clients

## v1.0.17 Progress
- [x] Display unique ID numbers on all edit/delete screens (Companies, Clients, Staff, FSMs, Departments, Divisions, Company Teams, Staff Teams)
- [x] Create submenu navigation for Lookup Tables (Departments, Divisions, Company Teams)
- [x] Add list/add/edit/delete capabilities for each organizational entity in Lookup Tables submenu
- [x] Make Departments, Divisions, and Company Teams visible and selectable when editing/adding Companies
- [x] Make Company, Departments, Divisions, and Company Teams visible when editing Clients


## v1.0.18 Requirements - Referral Source Identifier
- [x] Add visual identifier showing referral source type (Company, Client, Staff, or FSM) in client detail screen
- [x] Add referral source type display in client edit screen
- [x] Add referral source type badge in client list items


## v1.0.19 Bug Fixes - Organizational Lookups
- [x] Fix Organizational Lookups to display all divisions (currently showing empty)
- [x] Fix Organizational Lookups to display all departments (currently showing empty)
- [x] Fix Organizational Lookups to display all company teams (currently showing empty)
- [x] Fix company hierarchy counts showing zero when divisions/departments exist
- [x] Add link to create company teams from department screen in admin-departments


## v1.0.20 Features - Advanced Organizational Management
- [x] Database Reset functionality (admin-only, clears all data except admin user)
- [x] Bulk CSV Import for organizational structures (companies, divisions, departments, teams)
- [x] CSV Import validation and error reporting
- [x] Template System: "Save as Template" button on company screens (admin-only)
- [x] Template System: "Apply Template" option when creating new companies
- [x] Template System: Template management screen (list, rename, delete templates)
- [ ] Interactive Organizational Chart visualization with hierarchy tree
- [ ] Organizational Chart: Drag-and-drop reorganization capability
- [ ] Organizational Chart: Expand/collapse nodes for better navigation
- [ ] Add all new features to More tab admin section


## v1.0.21 Features - CSV Documentation & Advanced Features
- [x] Create comprehensive CSV format documentation with field descriptions
- [x] Generate sample CSV templates for organizational and client imports
- [x] Add in-app CSV help screen showing format and examples
- [x] Implement bulk client CSV import with automatic organizational assignment
- [x] Add client import validation (duplicate detection, required fields)
- [x] Create reporting dashboard screen
- [x] Add analytics: client distribution across departments
- [x] Add analytics: session completion rates by FSM
- [x] Add analytics: organizational utilization metrics
- [ ] Add date range filters for reports (future enhancement)
- [ ] Add export functionality for reports (future enhancement)


## v1.0.22 Bug Fixes & Improvements - Testing Feedback
- [x] Fix CSV import duplicate prevention (companies being imported twice)
- [x] Fix company hierarchy counts showing zero (Divisions, Departments, Teams)
- [x] Fix Org Lookup Tables navigation errors (invalid ID when clicking tabs)
- [x] Remove obsolete "Manage Lookup Tables" link from More tab
- [x] Change Age field to Date of Birth in client schema
- [x] Add calculated age display in client views
- [x] Update client CSV import to use Date of Birth instead of Age
- [x] Add searchable dropdown for company selection in client creation (type to filter/jump to matching companies)
- [x] Add scrollable dropdowns for Division, Department, and Company Teams in client creation
- [x] Add radio button selection for referral source type (Client/Staff/FSM) with conditional scrollable menu


## v1.0.23 Features - Date Picker, Filters & Bulk Assignment
- [x] Install React Native date picker library (@react-native-community/datetimepicker)
- [x] Add date picker component to add client screen for Date of Birth field
- [x] Add date picker component to edit client screen for Date of Birth field
- [x] Ensure date picker works on iOS, Android, and Web platforms
- [x] Add cascading filters to client list (Company → Division → Department → Team)
- [x] Implement bulk client selection in client list
- [x] Create bulk assignment UI to reassign selected clients
- [x] Add backend endpoint for bulk client department/team updates


## v1.0.24 Bug Fix - Org Lookup Tables
- [x] Fix admin-divisions screen to be view-only in global mode (hide add/edit/delete buttons)
- [x] Fix admin-departments screen to be view-only in global mode (hide add/edit/delete buttons)
- [x] Add informational message explaining that entities must be added through Companies


## v1.0.25 Feature - Global Organizational Search
- [x] Add search bar to Org Lookup Tables screen
- [x] Implement search across all divisions and departments simultaneously
- [x] Display search results with full hierarchy context (Company → Division → Department)
- [x] Add navigation to specific entities from search results


## v1.0.26 Bug Fixes - Org Lookup Tables & Reports
- [x] Fix Org Lookup Tables showing zero counts for Divisions, Departments, and Company Teams
- [x] Verify data queries are fetching correctly
- [x] Ensure counts update in real-time
- [x] Fix Reports & Analytics showing zero departments
- [x] Fix Reports & Analytics not displaying divisions


## v1.0.27 Features - Advanced Reports & Analytics
- [ ] Add organizational hierarchy chart visualization showing Company → Division → Department → Team structure
- [ ] Display client counts at each organizational level in hierarchy chart
- [ ] Implement date range filters: Weekly (last 7 days), Monthly (last 30 days), YTD (Year to Date), Custom (user-selected dates)
- [ ] Add date picker component for custom date range selection
- [ ] Add organizational filters: Company, Division, Department (cascading dropdowns)
- [ ] Filter all analytics data based on selected date range and organizational filters
- [ ] Add PDF export functionality for Reports & Analytics
- [ ] Add CSV export functionality for Reports & Analytics
- [ ] Include all charts and metrics in exported reports

## Version 1.0.27 - Reports & Analytics Enhancements
- [x] Add date range filters to Reports & Analytics (Weekly, Monthly, YTD, Custom)
- [x] Add custom date picker for custom date range selection
- [x] Add organizational filters with cascading dropdowns (Company → Division → Department)
- [x] Implement filtered analytics based on date range and organizational selection
- [x] Create organizational hierarchy chart modal showing full tree structure
- [x] Display client counts at each organizational level in hierarchy chart
- [x] Add export buttons for CSV and PDF (placeholders ready for implementation)
- [x] Install @react-native-picker/picker package for dropdown selectors
