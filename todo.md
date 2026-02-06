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
