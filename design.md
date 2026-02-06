# DoH Book One - Mobile App Interface Design

## Overview

DoH Book One is a professional counseling tracker application designed for mobile-first usage in portrait orientation (9:16). The app follows iOS Human Interface Guidelines (HIG) and mainstream iOS design standards to feel like a first-party application. The interface prioritizes one-handed usage, clear information hierarchy, and efficient workflows for counseling staff.

## Design Principles

The application embraces a **clean, professional aesthetic** suitable for a healthcare/counseling environment. The interface uses **clear typography**, **consistent spacing**, and **subtle visual hierarchy** to guide users through complex workflows without overwhelming them. All interactions are designed for **one-handed operation** with touch targets sized appropriately for mobile use.

## Color Scheme

The application uses a **professional blue-gray palette** that conveys trust and professionalism while maintaining excellent readability in various lighting conditions. The primary accent color is a **calming teal blue** (#0a7ea4) that provides visual interest without being distracting. The color scheme supports both light and dark modes seamlessly.

**Light Mode**: Clean white backgrounds with subtle gray surfaces for cards and elevated elements. Text uses dark gray for primary content and medium gray for secondary information.

**Dark Mode**: Deep charcoal backgrounds with slightly lighter surfaces for depth. Text uses off-white for primary content and light gray for secondary information.

## Screen List and Functionality

### 1. Dashboard Screen (Home Tab)

The Dashboard serves as the **primary landing screen** after login. It provides staff with an at-a-glance view of their schedule and recent activity.

**Primary Content**:
- Welcome header with staff name and current date
- Upcoming sessions card (next 7 days) with client names, session times, and quick access buttons
- Recent sessions card (last 7 days) with completion status and billable hours
- Monthly billable hours summary with visual progress indicator
- Sync status indicator (online/offline/syncing)

**Key Functionality**:
- Tap any session to view details or edit (if within 48-hour window)
- Quick action floating button to "Record New Session"
- Pull-to-refresh to sync latest data
- Visual indicators for VIP clients (gold badge icon)

### 2. Clients Screen (Clients Tab)

The Clients screen provides **comprehensive client management** with search, filtering, and hierarchical organization viewing.

**Primary Content**:
- Search bar at top (searches by client name, company name)
- Filter chips (Company, Division, Department, VIP status, Active/Inactive)
- Scrollable list of client cards showing:
  - Client name with VIP badge if applicable
  - Company → Division → Department hierarchy
  - Contact information (phone, email)
  - Last session date
  - Active case count

**Key Functionality**:
- Tap client card to navigate to Client Detail screen
- Floating action button to "Add New Client"
- Swipe actions on client cards (Call, Email, View Cases)
- Filter panel slides up from bottom with multi-select options

### 3. Client Detail Screen

The Client Detail screen is the **central hub** for all client-related information and actions.

**Primary Content**:
- Client header with name, VIP badge, and contact quick actions (call, email, message)
- Contact information card (address, phones, email, occupation, title, age)
- Organization hierarchy card (Company → Division → Department)
- Referral source information
- Notification preferences display (SMS/WhatsApp, opt-out status)
- Case history section with expandable case cards showing:
  - Case number and status (Active/Closed/On Hold)
  - Date range
  - Total sessions count
  - Total billable hours
  - Session list within each case

**Key Functionality**:
- Edit client information (staff can edit, admin has full control)
- Create new case button (with VIP authorization check)
- Record session button (quick access to session recording)
- Expand/collapse case cards to view session details
- Tap session to view/edit details

### 4. Session Recording Screen

The Session Recording screen is the **core workflow** of the application, designed for efficient data entry during or immediately after counseling sessions.

**Primary Content**:
- Client name header (read-only, with VIP indicator)
- Case selection dropdown (existing cases) or "Create New Case" button
- Session type dropdown (Introductory, Counseling, Repair, Assist, Interview)
- Session status dropdown (Scheduled, In Progress, Completed, Cancelled, No-show)
- Scheduled date/time picker (for future sessions)
- Timer section with two modes:
  - **Timer Mode**: Large start/stop buttons for Interview and Session with live duration display
  - **Manual Mode**: Date/time pickers for start and end times with auto-calculated durations
- Billable hours input (decimal number, can differ from actual duration)
- Session result dropdown (shown only when status is Completed)
- Notes text area (multi-line, expandable)
- Save button (prominent, bottom of screen)

**Key Functionality**:
- Toggle between Timer and Manual time entry modes
- Interview timer: Start Interview → displays running time → Stop Interview
- Session timer: Start Session → displays running time → Stop Session
- Auto-calculate durations from start/end times
- VIP authorization check when creating new case for VIP client
- Validation: ensure required fields are filled before saving
- Show warning if client has opted out of notifications when scheduling

### 5. Sessions Screen (Sessions Tab)

The Sessions screen provides **comprehensive session history** with powerful filtering and search capabilities.

**Primary Content**:
- Filter bar at top (Date range, Staff, Client, Status, Session Type)
- Active filter chips (dismissible)
- Scrollable list of session cards showing:
  - Client name with VIP indicator
  - Session type and status badges
  - Date and time
  - Duration and billable hours
  - Session result (if completed)
  - Edit indicator (if within 48-hour window)

**Key Functionality**:
- Tap session card to view full details
- Edit button (enabled only if within 48 hours of completion, or if admin)
- Filter panel with multi-select options and date range picker
- Sort options (Date, Client, Duration, Billable Hours)
- Pull-to-refresh to sync latest data

### 6. Reports Screen (Reports Tab)

The Reports screen provides **data visualization and export** capabilities for billable hours and activity summaries.

**Primary Content**:
- Report type selector (Billable Hours, Summary, Custom)
- Date range picker with presets (This Week, This Month, Last Month, Custom)
- Filter options based on report type:
  - Billable Hours: By Staff, By Client, By Time Period
  - Summary: By Company, By Division, By Department
- Generate Report button
- Results display area with:
  - Summary metrics cards (total sessions, total hours, average duration)
  - Data table with sortable columns
  - Charts (bar chart for comparisons, line chart for trends)
- Export button (PDF or CSV)

**Key Functionality**:
- Select report parameters and generate on demand
- Interactive charts (tap to see details)
- Sort table columns by tapping headers
- Export to PDF for sharing or CSV for further analysis
- Staff sees own data + company summaries
- Admin sees all data across organization

### 7. More Screen (More Tab)

The More screen provides **access to settings, profile, and admin functions**.

**Primary Content**:
- Profile section with staff photo, name, role badge (Staff/Admin/VIP-rated)
- Settings options:
  - Notification preferences
  - Theme (Light/Dark/ settings (Auto-sync, Manual sync button)
  - About app
- Admin section (visible only to admin users):
  - Manage Organizations (Groups, Teams, Staff)
  - Manage Companies (Companies, Divisions, Departments)
  - Manage Lookup Tables (Session Types, Status, Results)
  - Manage FSMs (Field Staff Members)
  - User Management (Create accounts, Assign VIP ratings)
- Logout button

**Key Functionality**:
- Edit profile information
- Toggle theme preference
- Manual sync trigger with progress indicator
- Admin navigation to management screens
- Secure logout with confirmation

### 8. Admin Management Screens

Admin screens provide **CRUD operations** for all organizational data structures.

**Manage Organizations Screen**:
- Three-level hierarchy view: Groups → Teams → Staff
- Expandable tree structure
- Add/Edit/Delete actions at each level
- Staff detail includes: name, contact info, team assignment, VIP rating, admin flag

**Manage Companies Screen**:
- Three-level hierarchy view: Companies → Divisions → Departments
- Expandable tree structure
- Add/Edit/Delete actions at each level
- Company detail includes: name, contact info, website

**Manage Lookup Tables Screen**:
- Three separate lists: Session Types, Session Status, Session Results
- Add/Edit/Deactivate actions (never delete, only mark inactive)
- Reorder items (drag handles)

**Manage FSMs Screen**:
- List of Field Staff Members (referral sources)
- Add/Edit/Delete actions
- FSM detail includes: name, contact info, organization, notes

**User Management Screen**:
- List of all staff with user accounts
- Create new staff user account
- Assign/revoke VIP ratings
- Assign/revoke admin privileges
- Reset password functionality

## Key User Flows

### Flow 1: Record a Session (Primary Workflow)

**Scenario**: Staff member just completed a counseling session and needs to record it immediately.

1. Staff opens app → lands on Dashboard
2. Taps floating "Record Session" button
3. Searches for and selects client from list
4. System checks VIP authorization (if client is VIP)
5. Selects existing case from dropdown or creates new case
6. Selects session type "Counseling" from dropdown
7. Sets status to "Completed"
8. Taps "Use Timer" mode (or Manual if recording later)
9. Reviews auto-filled times (or enters manually)
10. Enters billable hours (may differ from actual duration)
11. Selects session result "Good Indicators"
12. Adds notes about session highlights
13. Taps "Save" button
14. System validates, saves, and shows success message
15. Returns to Dashboard with updated recent sessions

### Flow 2: Schedule a Future Session with Notifications

**Scenario**: Staff wants to schedule a follow-up session for next week.

1. From Client Detail screen, taps "Record Session" button
2. Selects existing case
3. Selects session type "Counseling"
4. Sets status to "Scheduled"
5. Taps scheduled date/time picker
6. Selects date and time for next week
7. System checks client notification preferences
8. If client opted out, shows warning: "This client has opted out of notifications. They will not receive reminders."
9. Staff acknowledges and continues
10. Adds notes about session plan
11. Taps "Save" button
12. System creates session and schedules notifications:
    - 24 hours before: Email + SMS/WhatsApp (staff only, client opted out)
    - 1 hour before: SMS/WhatsApp (staff only, client opted out)
13. Returns to Client Detail with scheduled session visible

### Flow 3: Create New Client and Case

**Scenario**: Admin receives referral for new client from a Field Staff Member.

1. Admin navigates to Clients tab
2. Taps floating "Add Client" button
3. Navigates organization hierarchy: Company → Division → Department
4. Fills client form:
   - Name, contact information (home/mobile/work phones, email)
   - Address, occupation, title, age
   - Time in service with company
5. Taps "Select Referral Source"
6. Searches for FSM by name
7. Selects FSM from list
8. Sets notification preference to "WhatsApp"
9. Leaves opt-out unchecked
10. Marks client as VIP (admin only)
11. Taps "Save Client"
12. System creates client and navigates to Client Detail screen
13. Admin taps "Create New Case" button
14. Enters case details (case number auto-generated)
15. Sets start date to today
16. Adds notes about referral reason
17. Taps "Save Case"
18. Case is now available for session recording

### Flow 4: Edit Recent Session (Within 48-Hour Window)

**Scenario**: Staff realizes they entered wrong billable hours for yesterday's session.

1. Staff opens app → Dashboard shows recent sessions
2. Taps on yesterday's session card
3. Session detail screen opens with "Edit" button enabled
4. Taps "Edit" button
5. Session Recording screen opens in edit mode
6. Updates billable hours field
7. Adds note: "Corrected billable hours"
8. Taps "Save" button
9. System updates session with new updated_at timestamp and updated_by staff ID
10. Returns to Dashboard with corrected information

### Flow 5: Generate Monthly Billable Hours Report

**Scenario**: Admin needs to generate billable hours report for all staff for last month.

1. Admin navigates to Reports tab
2. Selects report type "Billable Hours"
3. Selects "By Time Period" option
4. Taps date range picker
5. Selects "Last Month" preset
6. Optionally applies filters (Group, Team, Session Type)
7. Taps "Generate Report" button
8. System queries database and displays results:
   - Summary cards: Total sessions, Total billable hours, Average session duration
   - Data table: Staff name, Sessions count, Total hours, Avg duration
   - Bar chart: Billable hours by staff member
9. Admin reviews data
10. Taps "Export" button
11. Selects "PDF" format
12. System generates PDF and opens share sheet
13. Admin shares via email or saves to files

### Flow 6: Offline Session Recording with Sync

**Scenario**: Staff is in area with no internet connection and needs to record session.

1. Staff opens app (offline indicator shows in Dashboard)
2. Taps "Record Session" button
3. Fills in all session details as normal
4. Taps "Save" button
5. System saves to local storage and adds to sync queue
6. Success message shows: "Session saved locally. Will sync when online."
7. Pending changes indicator shows "1 pending"
8. Later, when internet connection restored:
9. System automatically detects connection
10. Sync indicator shows "Syncing..."
11. System uploads queued session to server
12. Server processes and returns confirmation
13. Sync indicator shows "Synced" with timestamp
14. Pending changes count returns to 0

## Navigation Structure

The application uses **iOS-standard tab bar navigation** at the bottom of the screen with five primary tabs:

1. **Home** (house icon) - Dashboard with upcoming and recent sessions
2. **Clients** (person icon) - Client list and management
3. **Sessions** (calendar icon) - Session history and filtering
4. **Reports** (chart icon) - Reporting and analytics
5. **More** (ellipsis icon) - Settings, profile, and admin functions

Each tab maintains its own navigation stack, allowing users to drill down into details while preserving context. The tab bar remains visible across all screens for quick navigation.

## Visual Design Elements

**Typography**: The app uses SF Pro (iOS system font) with clear hierarchy. Headers use bold weights (600-700), body text uses regular weight (400), and secondary information uses medium weight (500) in muted colors.

**Cards and Surfaces**: Content is organized into cards with subtle shadows and rounded corners (8-12px radius). Cards use slightly elevated background colors to create depth without heavy shadows.

**Buttons and Actions**: Primary actions use filled buttons with the primary color. Secondary actions use outlined buttons. Destructive actions use red color with confirmation dialogs. All buttons have minimum 44pt touch targets.

**Icons**: The app uses SF Symbols (iOS) and Material Icons (Android) for consistency with platform conventions. Icons are used sparingly to support text labels, not replace them.

**Spacing**: The app uses an 8pt grid system for consistent spacing. Padding within cards is typically 16pt, spacing between elements is 8-12pt, and spacing between sections is 24pt.

**Status Indicators**: Visual badges and color-coded status indicators help users quickly understand information:
- VIP clients: Gold star badge
- Session status: Color-coded pills (Scheduled=blue, In Progress=orange, Completed=green, Cancelled=gray, No-show=red)
- Sync status: Icon with color (Synced=green, Syncing=blue, Offline=gray, Error=red)

## Interaction Patterns

**Pull-to-Refresh**: All list screens support pull-to-refresh gesture to sync latest data from server.

**Swipe Actions**: Client and session list items support swipe gestures for quick actions (call, email, edit, delete).

**Long Press**: Long press on items reveals contextual menus with additional actions.

**Modal Sheets**: Complex forms and filters slide up from bottom as modal sheets, maintaining context of underlying screen.

**Confirmation Dialogs**: Destructive actions (delete, cancel session) require confirmation with clear messaging about consequences.

**Loading States**: All data-loading operations show skeleton screens or spinners to indicate progress.

**Error States**: Errors are communicated with clear messaging and actionable recovery options (retry, cancel, contact support).

**Empty States**: When lists are empty, friendly illustrations and helpful text guide users to take first actions.

## Accessibility Considerations

The application supports **iOS accessibility features** including VoiceOver, Dynamic Type, and high contrast modes. All interactive elements have descriptive labels, color is never the only indicator of state, and touch targets meet minimum size requirements. The app supports both light and dark modes with appropriate contrast ratios for readability.

## Platform-Specific Adaptations

While designed mobile-first for iOS, the app also supports Android and tablet/desktop views:

**Android**: Uses Material Design patterns where appropriate (floating action buttons, material ripples) while maintaining overall design consistency.

**Tablet**: Utilizes larger screen space with split-view layouts (master-detail) for client lists and detail screens.

**Desktop/Web**: Adapts to wider screens with multi-column layouts and mouse/keyboard interactions while maintaining mobile-first core experience.
