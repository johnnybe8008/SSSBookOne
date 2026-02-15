import { eq, and, gte, lte, desc, asc, or, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  groups,
  staffDepartments,
  teams,
  staff,
  companies,
  divisions,
  departments,
  companyTeams,
  fsms,
  clients,
  cases,
  sessionTypes,
  sessionStatuses,
  sessionResults,
  sessions,
  notifications,
  type InsertGroup,
  type InsertStaffDepartment,
  type InsertTeam,
  type InsertStaff,
  type InsertCompany,
  type InsertDivision,
  type InsertDepartment,
  type InsertCompanyTeam,
  type InsertFSM,
  type InsertClient,
  type InsertCase,
  type InsertSessionType,
  type InsertSessionStatus,
  type InsertSessionResult,
  type InsertSession,
  type InsertNotification,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { sql } from "drizzle-orm";

// Helper functions to generate unique codes
async function generateDivisionCode(): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result: any = await db.execute(sql`SELECT MAX(CAST(SUBSTRING(code, 5) AS UNSIGNED)) as maxNum FROM divisions WHERE code LIKE 'DIV-%'`);
  const maxNum = result[0]?.[0]?.maxNum || 0;
  return `DIV-${String(maxNum + 1).padStart(3, '0')}`;
}

async function generateDepartmentCode(): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result: any = await db.execute(sql`SELECT MAX(CAST(SUBSTRING(code, 6) AS UNSIGNED)) as maxNum FROM departments WHERE code LIKE 'DEPT-%'`);
  const maxNum = result[0]?.[0]?.maxNum || 0;
  return `DEPT-${String(maxNum + 1).padStart(3, '0')}`;
}

async function generateCompanyTeamCode(): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result: any = await db.execute(sql`SELECT MAX(CAST(SUBSTRING(code, 7) AS UNSIGNED)) as maxNum FROM companyTeams WHERE code LIKE 'CTEAM-%'`);
  const maxNum = result[0]?.[0]?.maxNum || 0;
  return `CTEAM-${String(maxNum + 1).padStart(3, '0')}`;
}

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// STAFF ORGANIZATION
// ============================================================================

export async function getAllGroups() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(groups).orderBy(asc(groups.name));
}

export async function getGroupById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(groups).where(eq(groups.id, id));
  return result[0] || null;
}

export async function createGroup(data: InsertGroup) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result: any = await db.insert(groups).values(data);
  return result.insertId as number;
}

export async function updateGroup(id: number, data: Partial<InsertGroup>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(groups).set(data).where(eq(groups.id, id));
}

export async function deleteGroup(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(groups).where(eq(groups.id, id));
}

// Staff Departments
export async function getStaffDepartmentsByOrganizationId(organizationId: number) {
  const db = await getDb();
  if (!db) return [];
  // If organizationId is 0, return all departments
  if (organizationId === 0) {
    return db.select().from(staffDepartments).orderBy(asc(staffDepartments.name));
  }
  return db.select().from(staffDepartments).where(eq(staffDepartments.organizationId, organizationId)).orderBy(asc(staffDepartments.name));
}

export async function getStaffDepartmentById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(staffDepartments).where(eq(staffDepartments.id, id));
  return result[0] || null;
}

export async function createStaffDepartment(data: InsertStaffDepartment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result: any = await db.insert(staffDepartments).values(data);
  return result.insertId as number;
}

export async function updateStaffDepartment(id: number, data: Partial<InsertStaffDepartment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(staffDepartments).set(data).where(eq(staffDepartments.id, id));
}

export async function deleteStaffDepartment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(staffDepartments).where(eq(staffDepartments.id, id));
}

export async function getTeamsByGroupId(groupId: number) {
  const db = await getDb();
  if (!db) return [];
  // If groupId is 0, return all teams
  if (groupId === 0) {
    return db.select().from(teams).orderBy(asc(teams.name));
  }
  return db.select().from(teams).where(eq(teams.groupId, groupId)).orderBy(asc(teams.name));
}

export async function getTeamById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(teams).where(eq(teams.id, id));
  return result[0] || null;
}

export async function createTeam(data: InsertTeam) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result: any = await db.insert(teams).values(data);
  return result.insertId as number;
}

export async function updateTeam(id: number, data: Partial<InsertTeam>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(teams).set(data).where(eq(teams.id, id));
}

export async function deleteTeam(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(teams).where(eq(teams.id, id));
}

export async function getAllStaff() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(staff).orderBy(asc(staff.name));
}

export async function getStaffByTeamId(teamId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(staff).where(eq(staff.teamId, teamId)).orderBy(asc(staff.name));
}

export async function getStaffById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(staff).where(eq(staff.id, id));
  return result[0] || null;
}

export async function getStaffByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(staff).where(eq(staff.userId, userId));
  return result[0] || null;
}

export async function createStaff(data: InsertStaff) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result: any = await db.insert(staff).values(data);
  return result.insertId as number;
}

export async function updateStaff(id: number, data: Partial<InsertStaff>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(staff).set(data).where(eq(staff.id, id));
}

export async function deleteStaff(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(staff).where(eq(staff.id, id));
}

// ============================================================================
// CLIENT ORGANIZATION
// ============================================================================

export async function getAllCompanies() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(companies).orderBy(asc(companies.name));
}

export async function getCompanyById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(companies).where(eq(companies.id, id));
  return result[0] || null;
}

export async function createCompany(data: InsertCompany) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result: any = await db.insert(companies).values(data);
  return result.insertId as number;
}

export async function updateCompany(id: number, data: Partial<InsertCompany>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(companies).set(data).where(eq(companies.id, id));
}

export async function deleteCompany(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(companies).where(eq(companies.id, id));
}

export async function getAllDivisions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(divisions).orderBy(asc(divisions.name));
}

export async function getDivisionsByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(divisions).where(eq(divisions.companyId, companyId)).orderBy(asc(divisions.name));
}

export async function getDivisionById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(divisions).where(eq(divisions.id, id));
  return result[0] || null;
}

export async function createDivision(data: Omit<InsertDivision, 'code'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const code = await generateDivisionCode();
  const result: any = await db.insert(divisions).values({ ...data, code });
  return result.insertId as number;
}

export async function updateDivision(id: number, data: Partial<InsertDivision>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(divisions).set(data).where(eq(divisions.id, id));
}

export async function deleteDivision(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(divisions).where(eq(divisions.id, id));
}

export async function getAllDepartments() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(departments).orderBy(asc(departments.name));
}

export async function getDepartmentsByDivisionId(divisionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(departments).where(eq(departments.divisionId, divisionId)).orderBy(asc(departments.name));
}

export async function getDepartmentById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(departments).where(eq(departments.id, id));
  return result[0] || null;
}

export async function createDepartment(data: Omit<InsertDepartment, 'code'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const code = await generateDepartmentCode();
  const result: any = await db.insert(departments).values({ ...data, code });
  return result.insertId as number;
}

export async function updateDepartment(id: number, data: Partial<InsertDepartment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(departments).set(data).where(eq(departments.id, id));
}

export async function deleteDepartment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(departments).where(eq(departments.id, id));
}

// ============================================================================
// COMPANY TEAMS
// ============================================================================

export async function getAllCompanyTeams() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(companyTeams).orderBy(asc(companyTeams.name));
}

export async function getCompanyTeamsByDepartmentId(departmentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(companyTeams).where(eq(companyTeams.departmentId, departmentId)).orderBy(asc(companyTeams.name));
}

export async function getCompanyTeamById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(companyTeams).where(eq(companyTeams.id, id));
  return result[0] || null;
}

export async function createCompanyTeam(data: Omit<InsertCompanyTeam, 'code'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const code = await generateCompanyTeamCode();
  const result: any = await db.insert(companyTeams).values({ ...data, code });
  return result.insertId as number;
}

export async function updateCompanyTeam(id: number, data: Partial<InsertCompanyTeam>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(companyTeams).set(data).where(eq(companyTeams.id, id));
}

export async function deleteCompanyTeam(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(companyTeams).where(eq(companyTeams.id, id));
}

// ============================================================================
// REFERRAL SOURCES
// ============================================================================

export async function getAllFSMs() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(fsms).orderBy(asc(fsms.name));
}

export async function getFSMById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(fsms).where(eq(fsms.id, id));
  return result[0] || null;
}

export async function createFSM(data: InsertFSM) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result: any = await db.insert(fsms).values(data);
  return result.insertId as number;
}

export async function updateFSM(id: number, data: Partial<InsertFSM>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(fsms).set(data).where(eq(fsms.id, id));
}

export async function deleteFSM(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(fsms).where(eq(fsms.id, id));
}

// ============================================================================
// CLIENTS
// ============================================================================

export async function getAllClients() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clients).orderBy(asc(clients.name));
}

export async function getClientsByDepartmentId(departmentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clients).where(eq(clients.departmentId, departmentId)).orderBy(asc(clients.name));
}

export async function getClientById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(clients).where(eq(clients.id, id));
  return result[0] || null;
}

export async function searchClients(searchTerm: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(clients)
    .where(or(like(clients.name, `%${searchTerm}%`), like(clients.email, `%${searchTerm}%`)))
    .orderBy(asc(clients.name))
    .limit(50);
}

export async function createClient(data: InsertClient) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result: any = await db.insert(clients).values(data);
  return result.insertId as number;
}

export async function updateClient(id: number, data: Partial<InsertClient>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(clients).set(data).where(eq(clients.id, id));
}

export async function deleteClient(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(clients).where(eq(clients.id, id));
}

// ============================================================================
// CASE MANAGEMENT
// ============================================================================

export async function getCasesByClientId(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cases).where(eq(cases.clientId, clientId)).orderBy(desc(cases.startDate));
}

export async function getCaseById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(cases).where(eq(cases.id, id));
  return result[0] || null;
}

export async function getCaseByCaseNumber(caseNumber: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(cases).where(eq(cases.caseNumber, caseNumber));
  return result[0] || null;
}

export async function createCase(data: InsertCase) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result: any = await db.insert(cases).values(data);
  return result.insertId as number;
}

export async function updateCase(id: number, data: Partial<InsertCase>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(cases).set(data).where(eq(cases.id, id));
}

export async function deleteCase(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(cases).where(eq(cases.id, id));
}

// ============================================================================
// SESSION LOOKUP TABLES
// ============================================================================

export async function getAllSessionTypes() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sessionTypes).where(eq(sessionTypes.isActive, 1)).orderBy(asc(sessionTypes.name));
}

export async function getSessionTypeById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(sessionTypes).where(eq(sessionTypes.id, id));
  return result[0] || null;
}

export async function createSessionType(data: InsertSessionType) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result: any = await db.insert(sessionTypes).values(data);
  return result.insertId as number;
}

export async function updateSessionType(id: number, data: Partial<InsertSessionType>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(sessionTypes).set(data).where(eq(sessionTypes.id, id));
}

export async function getAllSessionStatuses() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sessionStatuses).where(eq(sessionStatuses.isActive, 1)).orderBy(asc(sessionStatuses.name));
}

export async function getSessionStatusById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(sessionStatuses).where(eq(sessionStatuses.id, id));
  return result[0] || null;
}

export async function createSessionStatus(data: InsertSessionStatus) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result: any = await db.insert(sessionStatuses).values(data);
  return result.insertId as number;
}

export async function updateSessionStatus(id: number, data: Partial<InsertSessionStatus>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(sessionStatuses).set(data).where(eq(sessionStatuses.id, id));
}

export async function getAllSessionResults() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sessionResults).where(eq(sessionResults.isActive, 1)).orderBy(asc(sessionResults.name));
}

export async function getSessionResultById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(sessionResults).where(eq(sessionResults.id, id));
  return result[0] || null;
}

export async function createSessionResult(data: InsertSessionResult) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result: any = await db.insert(sessionResults).values(data);
  return result.insertId as number;
}

export async function updateSessionResult(id: number, data: Partial<InsertSessionResult>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(sessionResults).set(data).where(eq(sessionResults.id, id));
}

// ============================================================================
// SESSIONS
// ============================================================================

export async function getAllSessions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sessions).orderBy(desc(sessions.createdAt));
}

export async function getSessionsByCaseId(caseId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sessions).where(eq(sessions.caseId, caseId)).orderBy(desc(sessions.createdAt));
}

export async function getSessionsByStaffId(staffId: number, limit?: number) {
  const db = await getDb();
  if (!db) return [];
  const query = db.select().from(sessions).where(eq(sessions.staffId, staffId)).orderBy(desc(sessions.createdAt));
  if (limit) {
    return query.limit(limit);
  }
  return query;
}

export async function getUpcomingSessions(staffId: number, days: number = 7) {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + days);
  
  return db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.staffId, staffId),
        gte(sessions.scheduledDate, now),
        lte(sessions.scheduledDate, future)
      )
    )
    .orderBy(asc(sessions.scheduledDate));
}

export async function getRecentSessions(staffId: number, days: number = 7) {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  const past = new Date();
  past.setDate(past.getDate() - days);
  
  return db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.staffId, staffId),
        gte(sessions.completedAt, past),
        lte(sessions.completedAt, now)
      )
    )
    .orderBy(desc(sessions.completedAt));
}

export async function getSessionById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(sessions).where(eq(sessions.id, id));
  return result[0] || null;
}

export async function createSession(data: InsertSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result: any = await db.insert(sessions).values(data);
  return result.insertId as number;
}

export async function updateSession(id: number, data: Partial<InsertSession>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(sessions).set(data).where(eq(sessions.id, id));
}

export async function deleteSession(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(sessions).where(eq(sessions.id, id));
}

export async function canEditSession(sessionId: number, isAdmin: boolean): Promise<boolean> {
  if (isAdmin) return true;
  
  const session = await getSessionById(sessionId);
  if (!session || !session.completedAt) return true;
  
  const now = new Date();
  const completedAt = new Date(session.completedAt);
  const hoursSinceCompletion = (now.getTime() - completedAt.getTime()) / (1000 * 60 * 60);
  
  return hoursSinceCompletion <= 48;
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export async function getNotificationsBySessionId(sessionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(eq(notifications.sessionId, sessionId));
}

export async function getPendingNotifications() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(eq(notifications.status, "pending"));
}

export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result: any = await db.insert(notifications).values(data);
  return result.insertId as number;
}

export async function updateNotification(id: number, data: Partial<InsertNotification>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notifications).set(data).where(eq(notifications.id, id));
}

// ============================================================================
// REPORTING QUERIES
// ============================================================================

export async function getBillableHoursByStaff(staffId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return { totalSessions: 0, totalBillableHours: 0, sessions: [] };
  
  const sessionList = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.staffId, staffId),
        gte(sessions.completedAt, startDate),
        lte(sessions.completedAt, endDate)
      )
    )
    .orderBy(desc(sessions.completedAt));
  
  const totalBillableHours = sessionList.reduce((sum, s) => sum + parseFloat(s.billableHours || "0"), 0);
  
  return {
    totalSessions: sessionList.length,
    totalBillableHours,
    sessions: sessionList,
  };
}

export async function getBillableHoursByClient(clientId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return { totalSessions: 0, totalBillableHours: 0, sessions: [] };
  
  const sessionList = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.clientId, clientId),
        gte(sessions.completedAt, startDate),
        lte(sessions.completedAt, endDate)
      )
    )
    .orderBy(desc(sessions.completedAt));
  
  const totalBillableHours = sessionList.reduce((sum, s) => sum + parseFloat(s.billableHours || "0"), 0);
  
  return {
    totalSessions: sessionList.length,
    totalBillableHours,
    sessions: sessionList,
  };
}

export async function getMonthlyBillableHours(staffId: number, year: number, month: number) {
  const db = await getDb();
  if (!db) return 0;
  
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  const result = await getBillableHoursByStaff(staffId, startDate, endDate);
  return result.totalBillableHours;
}
