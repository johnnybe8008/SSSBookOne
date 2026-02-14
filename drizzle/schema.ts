import { date, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  /** Hashed password for email/password authentication (bcrypt) */
  passwordHash: varchar("passwordHash", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Authentication sessions for email/password login
export const authSessions = mysqlTable("authSessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuthSession = typeof authSessions.$inferSelect;
export type InsertAuthSession = typeof authSessions.$inferInsert;

// ============================================================================
// STAFF ORGANIZATION
// ============================================================================

export const groups = mysqlTable("groups", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  updatedBy: int("updatedBy").notNull(),
});

// Staff Departments - middle layer between organizations (groups) and teams
export const staffDepartments = mysqlTable("staffDepartments", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(), // Link to organization (group)
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  updatedBy: int("updatedBy").notNull(),
});

export type StaffDepartment = typeof staffDepartments.$inferSelect;
export type InsertStaffDepartment = typeof staffDepartments.$inferInsert;

export const teams = mysqlTable("teams", {
  id: int("id").autoincrement().primaryKey(),
  groupId: int("groupId").notNull(), // Link to group for staff organization (DEPRECATED - use staffDepartmentId)
  staffDepartmentId: int("staffDepartmentId"), // Link to staff department
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  updatedBy: int("updatedBy").notNull(),
});

// Company Teams - for client organization hierarchy
export const companyTeams = mysqlTable("companyTeams", {
  id: int("id").autoincrement().primaryKey(),
  departmentId: int("departmentId").notNull(), // Link to department in company hierarchy
  code: varchar("code", { length: 50 }).notNull().unique(), // Auto-generated unique code (e.g., CTEAM-001)
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(), // Mandatory description
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  updatedBy: int("updatedBy").notNull(),
});

export const staff = mysqlTable("staff", {
  id: int("id").autoincrement().primaryKey(),
  teamId: int("teamId").notNull(), // Staff organization team (groups/teams for internal structure)
  // Company organizational assignment (for client-facing work)
  companyId: int("companyId"),
  divisionId: int("divisionId"),
  departmentId: int("departmentId"),
  companyTeamId: int("companyTeamId"),
  userId: int("userId"), // Foreign key to users table for authentication
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  role: mysqlEnum("role", ["admin", "counselor", "viewer"]).notNull().default("counselor"), // Staff role for access control
  isVipRated: int("isVipRated").notNull().default(0), // 0 = false, 1 = true
  isAdmin: int("isAdmin").notNull().default(0), // DEPRECATED: Use role field instead
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
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  website: varchar("website", { length: 255 }),
  contactPerson: varchar("contactPerson", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  updatedBy: int("updatedBy").notNull(),
});

export const divisions = mysqlTable("divisions", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(), // Auto-generated unique code (e.g., DIV-001)
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(), // Mandatory description
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  updatedBy: int("updatedBy").notNull(),
});

export const departments = mysqlTable("departments", {
  id: int("id").autoincrement().primaryKey(),
  divisionId: int("divisionId").notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(), // Auto-generated unique code (e.g., DEPT-001)
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(), // Mandatory description
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
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
  divisionId: int("divisionId").notNull(),
  departmentId: int("departmentId").notNull(),
  companyTeamId: int("companyTeamId"),
  // Polymorphic referral source
  referralSourceId: int("referralSourceId"),
  referralSourceType: mysqlEnum("referralSourceType", ["fsm", "staff", "client"]),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  homePhone: varchar("homePhone", { length: 50 }),
  mobilePhone: varchar("mobilePhone", { length: 50 }),
  workPhone: varchar("workPhone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  occupation: varchar("occupation", { length: 255 }),
  title: varchar("title", { length: 255 }),
  dateOfBirth: date("dateOfBirth"),
  timeInService: int("timeInService"), // in months
  status: mysqlEnum("status", ["Active", "Inactive", "Referred", "On Hold"]).default("Active").notNull(),
  isVip: int("isVip").notNull().default(0), // 0 = false, 1 = true
  notificationPreference: mysqlEnum("notificationPreference", ["sms", "whatsapp"]).default("sms").notNull(),
  notificationOptOut: int("notificationOptOut").notNull().default(0), // 0 = false, 1 = true
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  updatedBy: int("updatedBy").notNull(),
});

// ============================================================================
// CASE MANAGEMENT
// ============================================================================

export const cases = mysqlTable("cases", {
  id: int("id").autoincrement().primaryKey(),
  caseNumber: varchar("caseNumber", { length: 100 }).notNull().unique(),
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
  caseId: int("caseId").notNull(),
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
  description: text("description"),
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

export type Group = typeof groups.$inferSelect;
export type InsertGroup = typeof groups.$inferInsert;

export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;
export type InsertCompanyTeam = typeof companyTeams.$inferInsert;

export type Staff = typeof staff.$inferSelect;
export type InsertStaff = typeof staff.$inferInsert;

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

export type Division = typeof divisions.$inferSelect;
export type InsertDivision = typeof divisions.$inferInsert;

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = typeof departments.$inferInsert;

export type FSM = typeof fsms.$inferSelect;
export type InsertFSM = typeof fsms.$inferInsert;

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

export type Case = typeof cases.$inferSelect;
export type InsertCase = typeof cases.$inferInsert;

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
