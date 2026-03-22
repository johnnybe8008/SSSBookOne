# SSS Book One Admin User Manual

## Purpose

This manual is for administrators who manage staff, client organizations, lookup tables, reports, notifications, imports, exports, messaging providers, and maintenance tasks in SSS Book One.

## 1. Admin Role Overview

Admins can:

- manage staff
- manage client organizations
- manage lookup tables
- review reports and analytics
- run imports and exports
- manage messaging providers
- use reset and maintenance tools
- send manual messages to clients and staff

> Screenshot placeholder: More tab showing admin function entries.

## 2. Managing Staff

Use Manage Staff to:

- add staff
- edit staff
- remove staff
- assign role and organization structure
- set initial passwords
- force password reset at next login

Key notes:

- only admins can create or update staff records
- entering a new password on save writes the password hash immediately
- `Require Password Reset` forces the user to set a new password at next login

> Screenshot placeholder: Admin staff edit screen with password and profile controls.

## 3. Managing Client Organizations

Use the client organization tools to:

- manage companies
- manage departments
- manage teams
- keep reporting structures clean

Keep names and hierarchy consistent before imports or reporting changes.

> Screenshot placeholder: Admin client organizations screen with company hierarchy controls.

## 4. Lookup Tables

Lookup tables control values used across the app, including:

- session types
- session statuses
- session results
- organization structures

Changes here affect available selections and reporting output.

> Screenshot placeholder: Lookup tables screen.

## 5. Reports and Analytics

Admins can review:

- staff activity
- company and department totals
- team and client summaries
- session and billable-hour trends

Use filters carefully because filtered results affect totals and summaries shown on screen.

> Screenshot placeholder: Admin reports screen with overview and filter sections.

## 6. Notifications and Messaging

Admins can:

- send manual messages to clients
- send manual messages to staff

Messaging notes:

- scheduled session notifications depend on future session dates and active messaging provider setup
- only recipients with mobile numbers are available for manual messaging
- delivery uses each recipient's saved notification preference

> Screenshot placeholder: Notifications screen in admin mode with client and staff recipient options.

## 7. Manage SMS Providers

Use `More > Manage SMS Providers` to configure the active messaging service.

Setup guidance:

- create either a `CM.com` or `Twilio` provider record
- mark one provider as the default
- for `CM.com`, enter the product token, SMS from number, WhatsApp from number, template namespace, staff template name, client template name, and WhatsApp template language code such as `en_US`
- for `Twilio`, enter the account SID, auth token, SMS from number, and WhatsApp from value if WhatsApp is enabled there
- use the default mobile country setting to control how local mobile numbers are normalized before sending
- after changing credentials, send a manual test message and confirm scheduled reminders still deliver as expected

> Screenshot placeholder: More tab admin section and Manage SMS Providers screen with provider form.

## 8. CSV Import and Export

Use import/export tools to:

- import structured staff data where enabled
- import client data where enabled
- export staff, client, or company CSV files

Best practice:

- validate organization structure before import
- review incoming data before saving
- keep exports for backup or operational extracts

> Screenshot placeholder: More tab or admin import/export entry points.

## 9. Database Reset and Environment Care

Database reset is an admin-only maintenance action.

Before running reset:

- confirm the correct environment
- confirm backups if needed
- avoid running reset in the wrong deployment

After reset or major migration work:

- verify login
- verify sessions
- verify reports
- verify notifications

## 10. Release and Deployment Notes

Admins involved in release or deployment support should remember:

- keep the application version updated before significant releases
- for server deployment, pull branch `v2.5.4`, build production assets, and restart the PM2 process
- protect database and messaging credentials outside git

## 11. Troubleshooting

### Messaging does not deliver

- confirm the recipient has a mobile number
- confirm the notification preference is set
- confirm the default messaging provider is active
- confirm provider credentials and template values are correct

### Reports look incorrect

- clear filters and recheck totals
- confirm assignment and lookup structure
- confirm data was saved under the expected records

### Staff account changes do not take effect

- confirm the record was saved successfully
- confirm password reset settings were applied as intended
- confirm the user is editing the expected staff record

## 12. Maintenance Notes

Update this manual whenever:

- admin menu items change
- messaging provider setup changes
- reporting behavior changes
- deployment or reset procedures change
- notification workflows change
