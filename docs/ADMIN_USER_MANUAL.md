# SSS Book One Admin User Manual

## Purpose

This manual is for administrators who manage staff, organization structures, reports, imports, exports, notifications, and maintenance tasks in SSS Book One.

## 1. Admin Access

Admins have additional access to:

- manage staff
- manage client company structures
- manage lookup tables
- open Reports & Analytics
- use CSV import and export tools
- reset the database
- send manual messages to clients and staff

> Screenshot placeholder: More tab showing Admin Functions.

## 2. Managing Staff

Use the staff management screens to:

- add new staff
- edit existing staff
- reset a staff password
- force password reset at next login
- assign organizational placement
- control role and admin status

Important rules:

- only admins can update staff records
- entering a new password in the staff edit screen writes the password hash to the database on save
- enabling `Require Password Reset` forces the user to create a new password at next login

> Screenshot placeholder: Admin staff edit screen with password and Require Password Reset controls.

## 3. Staff Self-Service vs Admin Edit

Staff can edit their own personal details from `More > Edit Profile`, but they do not see admin-only controls.

Admins editing staff records can see additional fields such as:

- role
- VIP rating
- organization assignment
- Require Password Reset
- delete action

## 4. Client Organization Management

Admins can manage:

- companies
- departments
- teams
- lookup hierarchy used for client placement and reporting

Keep these structures correct before imports or major reporting work.

> Screenshot placeholder: Admin client organizations screen.

## 5. Lookup Tables

Lookup tables control values used throughout the app, including:

- session types
- session statuses
- session results
- organization and team structures

Changes here affect data entry and reports.

> Screenshot placeholder: Lookup tables screen.

## 6. Reports and Analytics

The admin reports screen provides broader organization visibility, including totals and filtered summaries across:

- companies
- departments
- teams
- staff
- clients
- sessions

PDF export is available from the admin reporting workflow.

> Screenshot placeholder: Reports & Analytics screen.

## 7. Notifications and Messaging

Admins can use the Notifications screen to:

- send manual messages to clients
- send manual messages to staff

Messaging behavior:

- recipients only appear if they have a mobile number
- delivery uses their saved preference
- SMS / WhatsApp delivery depends on provider setup

> Screenshot placeholder: Notifications screen in admin mode.

## 8. CSV Import and Export

Where enabled, admins can:

- import structured staff data
- import client data
- export staff, client, or company CSV files

Best practice:

- confirm structures first
- validate incoming data before import
- keep exports for operational review or backup copies

## 9. Database Reset

Database reset is an admin-only maintenance action.

Before running reset:

- confirm the correct environment
- confirm any needed backups
- verify that users are out of the system if required

After reset:

- verify login
- verify staff baseline records
- verify session workflows
- verify reports

## 10. Deployment and Release Awareness

Admins involved in release or deployment support should remember:

- update version numbers before formal release
- verify server environment variables
- protect database and messaging credentials
- test login, sessions, notifications, and reports after deployment

## 11. Troubleshooting

### Staff cannot log in

- confirm email and password
- confirm whether the user is flagged for forced password reset
- confirm the password hash is present in the database

### Staff password reset does not work

- confirm the record was saved
- confirm `passwordHash` changed in the database
- confirm `mustChangePassword` is set correctly for the intended flow

### Messaging does not deliver

- confirm recipient has a mobile number
- confirm notification preference exists
- confirm messaging provider is active

### Reports look incorrect

- clear filters and recheck totals
- confirm lookup structures and assignments
- confirm data was saved under the expected organization, team, and staff

## 12. Maintenance Notes

Update this manual whenever:

- admin menu items change
- staff password rules change
- reporting behavior changes
- messaging workflows change
- deployment or reset procedures change
