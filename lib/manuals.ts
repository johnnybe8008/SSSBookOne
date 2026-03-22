export type ManualSection = {
  title: string;
  body: string[];
  screenshot?: string;
};

export type ManualDefinition = {
  title: string;
  subtitle: string;
  audience: string;
  versionNote: string;
  sections: ManualSection[];
};

export const staffManual: ManualDefinition = {
  title: "SSS Book One Staff User Manual",
  subtitle: "Daily guide for counselors, viewers, and general staff users",
  audience: "Staff users",
  versionNote: "Prepared from the current project workflows. Update when key screens or policies change.",
  sections: [
    {
      title: "Login and Password Reset",
      screenshot: "Add screenshot: Login screen showing email field and password reset state.",
      body: [
        "Enter your email address first.",
        "If your account is flagged for reset, the screen switches to a new password and confirm password form.",
        "Save the new password, then sign in normally with that password.",
        "If no reset is required, enter your password and continue into the app.",
      ],
    },
    {
      title: "Home Tab",
      screenshot: "Add screenshot: Home tab with welcome header, monthly hours, upcoming sessions, and recent sessions.",
      body: [
        "Use Home as your starting page each day.",
        "Review current-month billable hours, upcoming sessions, and recent sessions.",
        "Use the quick action button to record a new session.",
      ],
    },
    {
      title: "Clients Tab",
      screenshot: "Add screenshot: Clients tab with search bar and filter controls.",
      body: [
        "Search clients by name or email.",
        "Use company, department, and team filters to narrow the list.",
        "Open a client record to review profile, contact, and referral information.",
      ],
    },
    {
      title: "Sessions Tab",
      screenshot: "Add screenshot: Sessions tab with filter drawer and session cards.",
      body: [
        "Review sessions assigned to you.",
        "Use filters such as status to narrow the list.",
        "Open a session for detail view, or edit it if it is still within the allowed edit window.",
      ],
    },
    {
      title: "Recording a Session",
      screenshot: "Add screenshot: Record Session screen showing client, folder, session fields, and save action.",
      body: [
        "Select the client and the correct folder first.",
        "Choose session type and status, then enter time details.",
        "Add billable hours and notes before saving.",
        "If the session start is in the future, the system treats it as a scheduled session.",
      ],
    },
    {
      title: "Reports Tab",
      screenshot: "Add screenshot: Reports tab with summary cards and period selector.",
      body: [
        "Review total sessions, billable hours, and average duration.",
        "Use period buttons and filters to focus on the information you need.",
        "Staff users mainly use this page for personal productivity review.",
      ],
    },
    {
      title: "More Tab and Edit Profile",
      screenshot: "Add screenshot: More tab showing profile section and settings list.",
      body: [
        "Open Edit Profile to update your own personal details.",
        "Staff can update contact details, address details, notification preferences, and their own password.",
        "Admin-only controls such as force password reset are hidden from non-admin staff.",
      ],
    },
    {
      title: "Notifications",
      screenshot: "Add screenshot: Notifications screen with recipient list and message box.",
      body: [
        "Staff can send manual messages to clients from their existing session list.",
        "Only recipients with a mobile number appear in the list.",
        "Delivery uses each recipient's saved notification preference.",
      ],
    },
    {
      title: "Good Practice Tips",
      body: [
        "Always confirm the correct client and folder before saving a session.",
        "Keep notes clear and professional.",
        "Review billable hours before saving.",
        "Log out on shared devices.",
      ],
    },
  ],
};

export const adminManual: ManualDefinition = {
  title: "SSS Book One Admin User Manual",
  subtitle: "Operational guide for administrators",
  audience: "Admin users",
  versionNote: "Prepared from the current admin workflows. Update when admin tools or release processes change.",
  sections: [
    {
      title: "Admin Role Overview",
      screenshot: "Add screenshot: More tab showing admin function entries.",
      body: [
        "Admins can manage staff, client organizations, lookup tables, reports, imports, exports, and reset tools.",
        "Admin users can also send manual messages to both clients and staff.",
        "Only admins can create or update staff records and force password reset at next login.",
      ],
    },
    {
      title: "Managing Staff",
      screenshot: "Add screenshot: Admin staff edit screen with password and profile controls.",
      body: [
        "Use Manage Staff to add, edit, or remove staff records.",
        "When creating a staff record, assign the role, team structure, and initial password.",
        "Use Require Password Reset to force a password change at next login.",
        "Entering a new password on save writes the password hash to the database immediately.",
      ],
    },
    {
      title: "Managing Client Organizations",
      screenshot: "Add screenshot: Admin client organizations screen with company hierarchy controls.",
      body: [
        "Manage companies, departments, and teams that organize client records.",
        "Keep names and hierarchy clean before large imports or reporting changes.",
      ],
    },
    {
      title: "Lookup Tables",
      screenshot: "Add screenshot: Lookup tables screen.",
      body: [
        "Use lookup tables to maintain session types, statuses, results, and organization structures.",
        "Changes here affect staff selection options and reporting output.",
      ],
    },
    {
      title: "Reports and Analytics",
      screenshot: "Add screenshot: Admin reports screen with overview and filter sections.",
      body: [
        "Admins can view global activity across staff, companies, departments, teams, and clients.",
        "Use the filters carefully, because filtered results affect totals and summaries on screen.",
        "PDF export is available from the admin reports area.",
      ],
    },
    {
      title: "Notifications and Messaging",
      screenshot: "Add screenshot: Notifications screen in admin mode with client and staff recipient options.",
      body: [
        "Admins can send manual messages to clients or staff.",
        "Scheduled session notifications depend on future session dates and active messaging provider setup.",
        "Only recipients with mobile numbers are available for manual messaging.",
      ],
    },
    {
      title: "Manage SMS Providers",
      screenshot: "Add screenshot: More tab admin section and Manage SMS Providers screen with provider form.",
      body: [
        "Open More, then select Manage SMS Providers to configure the active messaging service.",
        "Create either a CM.com or Twilio provider record and mark one provider as the default.",
        "For CM.com, enter the product token, SMS from number, WhatsApp from number, template namespace, staff template name, client template name, and the WhatsApp template language code such as en_US.",
        "For Twilio, enter the account SID, auth token, SMS from number, and WhatsApp from value if WhatsApp is enabled there.",
        "The default mobile country setting controls how local mobile numbers are normalized before sending, so use South Africa for production unless a different country is required.",
        "After changing provider credentials, send a manual test message and confirm scheduled reminders still deliver as expected.",
      ],
    },
    {
      title: "CSV Import and Export",
      screenshot: "Add screenshot: More tab or admin import/export entry points.",
      body: [
        "Use CSV import for structured staff or client onboarding where enabled.",
        "Use CSV export to create backups or operational extracts.",
        "Always validate organization structure before importing new records.",
      ],
    },
    {
      title: "Database Reset and Environment Care",
      body: [
        "Database reset is an admin-only operation and should be used with care.",
        "Confirm the environment before running reset to avoid wiping the wrong database.",
        "After major deployment or migration work, confirm login, sessions, reports, and notifications.",
      ],
    },
    {
      title: "Release and Deployment Notes",
      body: [
        "Keep the application version updated before significant releases.",
        "For server deployment, pull branch v2.5.4, build production assets, and restart the PM2 process.",
        "Protect secrets such as database and messaging credentials outside git.",
      ],
    },
  ],
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildManualHtml(manual: ManualDefinition) {
  const sectionsHtml = manual.sections
    .map(
      (section, index) => `
        <section class="section">
          <div class="section-number">${index + 1}</div>
          <div class="section-body">
            <h2>${escapeHtml(section.title)}</h2>
            ${
              section.screenshot
                ? `<div class="screenshot-box"><strong>Screenshot Placeholder</strong><br/>${escapeHtml(section.screenshot)}</div>`
                : ""
            }
            <ul>
              ${section.body.map((item) => `<li>${escapeHtml(item)}</li>`).join("\n")}
            </ul>
          </div>
        </section>
      `
    )
    .join("\n");

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #1f2933;
            margin: 36px;
            line-height: 1.5;
          }
          .cover {
            border: 2px solid #d7dee5;
            border-radius: 18px;
            padding: 32px;
            margin-bottom: 28px;
            background: linear-gradient(135deg, #f7fafc, #eef4f8);
          }
          .eyebrow {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1.6px;
            color: #5c7080;
            margin-bottom: 12px;
          }
          h1 {
            font-size: 28px;
            margin: 0 0 8px 0;
            color: #102a43;
          }
          .subtitle {
            font-size: 16px;
            color: #334e68;
            margin-bottom: 16px;
          }
          .note {
            font-size: 13px;
            color: #486581;
          }
          .section {
            display: table;
            width: 100%;
            margin: 0 0 22px 0;
          }
          .section-number {
            display: table-cell;
            width: 44px;
            vertical-align: top;
            font-size: 22px;
            font-weight: bold;
            color: #0a7ea4;
          }
          .section-body {
            display: table-cell;
            vertical-align: top;
          }
          h2 {
            font-size: 18px;
            margin: 0 0 10px 0;
            color: #102a43;
          }
          ul {
            margin: 0;
            padding-left: 18px;
          }
          li {
            margin-bottom: 6px;
          }
          .screenshot-box {
            border: 1px dashed #9fb3c8;
            background: #f8fbfd;
            border-radius: 12px;
            padding: 14px;
            margin: 10px 0 14px 0;
            color: #486581;
            font-size: 13px;
          }
          .footer {
            margin-top: 28px;
            padding-top: 14px;
            border-top: 1px solid #d9e2ec;
            font-size: 12px;
            color: #7b8794;
          }
        </style>
      </head>
      <body>
        <div class="cover">
          <div class="eyebrow">${escapeHtml(manual.audience)}</div>
          <h1>${escapeHtml(manual.title)}</h1>
          <div class="subtitle">${escapeHtml(manual.subtitle)}</div>
          <div class="note">${escapeHtml(manual.versionNote)}</div>
        </div>
        ${sectionsHtml}
        <div class="footer">
          SSS Book One manual export. Screenshot placeholders can be replaced with real captures in a later documentation pass.
        </div>
      </body>
    </html>
  `;
}
