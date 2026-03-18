export const divisions = mysqlTable("divisions", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  updatedBy: int("updatedBy").notNull(),
});

export const departments = mysqlTable("departments", {
  id: int("id").autoincrement().primaryKey(),
  divisionId: int("divisionId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  updatedBy: int("updatedBy").notNull(),
});
import { date, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core staff table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */



// Authentication sessions for email/password login
export const authSessions = mysqlTable("authSessions", {
  id: int("id").autoincrement().primaryKey(),
  staffId: int("staffId").notNull(), // Now references staff.id
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuthSession = typeof authSessions.$inferSelect;
export type InsertAuthSession = typeof authSessions.$inferInsert;

// ============================================================================
// STAFF ORGANIZATION
// ============================================================================

export const organizations = mysqlTable("organizations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  addressLine1: text("addressLine1"),
  city: varchar("city", { length: 120 }),
  stateProvince: varchar("stateProvince", { length: 120 }),
  postalCode: varchar("postalCode", { length: 30 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  updatedBy: int("updatedBy").notNull(),
});

// Staff Departments - middle layer between organizations and teams
export const staffDepartments = mysqlTable("staffDepartments", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(), // Link to organization
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  updatedBy: int("updatedBy").notNull(),
});

export type StaffDepartment = typeof staffDepartments.$inferSelect;
export type InsertStaffDepartment = typeof staffDepartments.$inferInsert;

export const teams = mysqlTable("teams", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId"), // Link to organization for staff organization (DEPRECATED - use staffDepartmentId)
  staffDepartmentId: int("staffDepartmentId"), // Link to staff department
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  updatedBy: int("updatedBy").notNull(),
});

// Company Teams - for client organization hierarchy
export const companyTeams = mysqlTable("companyTeams", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(), // Link to company
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  updatedBy: int("updatedBy").notNull(),
  coDepartmentId: int("coDepartmentId").notNull(), // Link to department in company hierarchy
});

// Staff table
export const staff = mysqlTable("staff", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId"),
  staffDepartmentId: int("staffDepartmentId"),
  teamId: int("teamId"),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  addressLine1: text("addressLine1"),
  city: varchar("city", { length: 120 }),
  stateProvince: varchar("stateProvince", { length: 120 }),
  postalCode: varchar("postalCode", { length: 30 }),
  phone: varchar("phone", { length: 50 }),
  homePhone: varchar("homePhone", { length: 50 }),
  mobilePhone: varchar("mobilePhone", { length: 50 }),
  workPhone: varchar("workPhone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  mustChangePassword: int("mustChangePassword").notNull().default(0),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  role: mysqlEnum("role", ["admin", "counselor", "viewer"]).notNull().default("counselor"),
    notificationPreference: mysqlEnum("notificationPreference", ["sms", "whatsapp"]),
    notificationOptOut: int("notificationOptOut").notNull().default(0), // 0 = false, 1 = true
    isVipRated: int("isVipRated").notNull().default(0),
  isAdmin: int("isAdmin").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  updatedBy: int("updatedBy").notNull(),
});

// ============================================================================
// CLIENT ORGANIZATION
// ============================================================================

export const companies = mysqlTable("companies", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  addressLine1: text("addressLine1"),
  city: varchar("city", { length: 120 }),
  stateProvince: varchar("stateProvince", { length: 120 }),
  postalCode: varchar("postalCode", { length: 30 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  website: varchar("website", { length: 255 }),
  contactPerson: varchar("contactPerson", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  updatedBy: int("updatedBy").notNull(),
});

// Client Company Departments - middle layer between companies and teams
export const coDepartments = mysqlTable("coDepartments", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(), // Link to company
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  updatedBy: int("updatedBy").notNull(),
});

// ============================================================================
// REFERRAL SOURCES
// ============================================================================

export const fsms = mysqlTable("fsms", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  mobilePhone: varchar("mobilePhone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  organization: varchar("organization", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  updatedBy: int("updatedBy").notNull(),
});

// ============================================================================
// CLIENTS
// ============================================================================

export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  // Organizational hierarchy (redundant for easier querying)
  companyId: int("companyId").notNull(),
  coDepartmentId: int("coDepartmentId").notNull(),
  companyTeamId: int("companyTeamId"),
  // Polymorphic referral source
  referralSourceId: int("referralSourceId"),
  referralSourceType: mysqlEnum("referralSourceType", ["fsm", "staff", "client"]),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  addressLine1: text("addressLine1"),
  city: varchar("city", { length: 120 }),
  stateProvince: varchar("stateProvince", { length: 120 }),
  postalCode: varchar("postalCode", { length: 30 }),
  homePhone: varchar("homePhone", { length: 50 }),
  mobilePhone: varchar("mobilePhone", { length: 50 }),
  workPhone: varchar("workPhone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  occupation: varchar("occupation", { length: 255 }),
  title: varchar("title", { length: 255 }),
  dateOfBirth: date("dateOfBirth"),
  timeInServiceYears: int("timeInServiceYears"),
  timeInServiceMonths: int("timeInServiceMonths"),
  timeInService: int("timeInService"), // in months
  status: mysqlEnum("status", ["Active", "Inactive", "Referred", "On Hold"]).default("Active").notNull(),
  isVip: int("isVip").notNull().default(0), // 0 = false, 1 = true
  notificationPreference: mysqlEnum("notificationPreference", ["sms", "whatsapp"]),
  notificationOptOut: int("notificationOptOut").notNull().default(0), // 0 = false, 1 = true
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  updatedBy: int("updatedBy").notNull(),
});

// ============================================================================
// FOLDER MANAGEMENT
// ============================================================================

export const caseFolders = mysqlTable("caseFolders", {
  id: int("id").autoincrement().primaryKey(),
  folderNumber: varchar("folderNumber", { length: 3 }).notNull(),
  folderDescription: text("folderDescription"),
  clientId: int("clientId").notNull(),
  createdByStaffId: int("createdByStaffId").notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  status: mysqlEnum("status", ["Active", "Closed", "On Hold"]).default("Active").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  updatedBy: int("updatedBy").notNull(),
});

// ============================================================================
// SESSION LOOKUP TABLES
// ============================================================================

export const sessionTypes = mysqlTable("sessionTypes", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  isActive: int("isActive").notNull().default(1), // 0 = false, 1 = true
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  updatedBy: int("updatedBy").notNull(),
});

export const sessionStatuses = mysqlTable("sessionStatuses", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  isActive: int("isActive").notNull().default(1), // 0 = false, 1 = true
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  updatedBy: int("updatedBy").notNull(),
});

export const sessionResults = mysqlTable("sessionResults", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  isActive: int("isActive").notNull().default(1), // 0 = false, 1 = true
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  updatedBy: int("updatedBy").notNull(),
});

// ============================================================================
// SESSIONS
// ============================================================================

export const sessions = mysqlTable("sessions", {
  id: int("id").autoincrement().primaryKey(),
  folderId: int("folderId").notNull(),
  clientId: int("clientId").notNull(),
  staffId: int("staffId").notNull(),
  sessionTypeId: int("sessionTypeId").notNull(),
  sessionStatusId: int("sessionStatusId").notNull(),
  sessionResultId: int("sessionResultId"),
  // Interview times (pre/post activities)
  interviewStartTime: timestamp("interviewStartTime"),
  interviewEndTime: timestamp("interviewEndTime"),
  interviewDuration: int("interviewDuration"), // in minutes, calculated
  // Session times (actual counseling)
  sessionStartTime: timestamp("sessionStartTime"),
  sessionEndTime: timestamp("sessionEndTime"),
  sessionDuration: int("sessionDuration"), // in minutes, calculated
  // Billable hours (can differ from actual duration)
  billableHours: varchar("billableHours", { length: 10 }), // stored as string to avoid decimal precision issues
  notes: text("notes"),
  scheduledDate: timestamp("scheduledDate"), // for scheduled sessions
  completedAt: timestamp("completedAt"), // when status changed to Completed
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  updatedBy: int("updatedBy").notNull(),
});

// ============================================================================
// COMPANY TEMPLATES
// ============================================================================

export const companyTemplates = mysqlTable("companyTemplates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  // Store the template structure as JSON
  templateData: json("templateData").notNull(), // { divisions: [{name, desc, departments: [{name, desc, teams: [{name, desc}]}]}] }
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CompanyTemplate = typeof companyTemplates.$inferSelect;
export type InsertCompanyTemplate = typeof companyTemplates.$inferInsert;

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  recipientType: mysqlEnum("recipientType", ["staff", "client"]).notNull(),
  recipientId: int("recipientId").notNull(), // staff.id or client.id
  notificationType: mysqlEnum("notificationType", ["email", "sms", "whatsapp"]).notNull(),
  notificationTime: mysqlEnum("notificationTime", ["24_hours", "1_hour"]).notNull(),
  sentAt: timestamp("sentAt"),
  status: mysqlEnum("status", ["pending", "sent", "failed", "skipped"]).default("pending").notNull(),
  skipReason: text("skipReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;

export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;
export type InsertCompanyTeam = typeof companyTeams.$inferInsert;

export type Staff = typeof staff.$inferSelect;
export type InsertStaff = typeof staff.$inferInsert;

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

export type CoDepartment = typeof coDepartments.$inferSelect;
export type InsertCoDepartment = typeof coDepartments.$inferInsert;
export type coDepartment = CoDepartment;
export const coDepartment = coDepartments;

export type FSM = typeof fsms.$inferSelect;
export type InsertFSM = typeof fsms.$inferInsert;

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

export type CaseFolder = typeof caseFolders.$inferSelect;
export type InsertCaseFolder = typeof caseFolders.$inferInsert;

export type SessionType = typeof sessionTypes.$inferSelect;
export type InsertSessionType = typeof sessionTypes.$inferInsert;

export type SessionStatus = typeof sessionStatuses.$inferSelect;
export type InsertSessionStatus = typeof sessionStatuses.$inferInsert;

export type SessionResult = typeof sessionResults.$inferSelect;
export type InsertSessionResult = typeof sessionResults.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
