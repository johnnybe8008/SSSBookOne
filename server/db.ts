// Update a company team by ID
export async function updateCompanyTeam(id, data) {
  const db = await getDb();
  const { id: _id, ...updateData } = data;
  await db.update(companyTeams)
    .set(updateData)
    .where(eq(companyTeams.id, id));
  return { success: true };
}
// Update a company by ID
export async function updateCompany(id, data) {
  const db = await getDb();
  const { id: _id, ...updateData } = data;
  await db.update(companies)
    .set(updateData)
    .where(eq(companies.id, id));
  return { success: true };
}
// Fetch user by OpenId
export async function getUserByOpenId(openId) {
  // Legacy compatibility: current schema no longer stores openId on staff.
  // Use email as a best-effort lookup key for OAuth flows.
  if (!openId) return null;
  const db = await getDb();
  const [user] = await db.select().from(staff).where(eq(staff.email, openId)).limit(1);
  return user || null;
}

export async function getStaffByOpenId(openId) {
  return getUserByOpenId(openId);
}

export async function upsertStaff(input) {
  const db = await getDb();
  if (!input?.email) {
    return { success: false, reason: "email required" };
  }

  const email = String(input.email).trim().toLowerCase();
  const existing = await db.select().from(staff).where(eq(staff.email, email)).limit(1);

  if (existing.length > 0) {
    await db.update(staff)
      .set({
        name: input.name ?? existing[0].name,
        email,
        updatedAt: new Date(),
      })
      .where(eq(staff.id, existing[0].id));
    return { id: existing[0].id, updated: true };
  }

  const [result] = await db.insert(staff).values({
    name: input.name || email,
    email,
    role: "viewer",
    isVipRated: 0,
    isAdmin: 0,
    mustChangePassword: 0,
    createdBy: 1,
    updatedBy: 1,
  });
  return { id: result.insertId, created: true };
}

export async function upsertUser(input) {
  return upsertStaff(input);
}
// Create a new company team (client organization team)
export async function createCompanyTeam(input) {
  const db = await getDb();
  // Remove id if present, as it should be auto-incremented
  const { id, ...data } = input;
  console.log('[DEBUG createCompanyTeam] mutation payload:', data);
  const [result] = await db.insert(companyTeams).values(data);
  return result;
}
// Create a new client department (coDepartment)
// Update an organization by ID
// Update a staff department by ID
export async function updateStaffDepartment(id, data) {
  const db = await getDb();
  // Remove id if present in data
  const { id: _id, ...updateData } = data;
  await db.update(staffDepartments)
    .set(updateData)
    .where(eq(staffDepartments.id, id));
  return { success: true };
}
export async function updateOrganization(id, data) {
  const db = await getDb();
  // Remove id if present in data
  const { id: _id, ...updateData } = data;
  await db.update(organizations)
    .set(updateData)
    .where(eq(organizations.id, id));
  return { success: true };
}
// Fetch all staff records
export async function getAllStaff() {
  try {
    const db = await getDb();
    return await db.select().from(staff);
  } catch (error) {
    console.error("[db.getAllStaff] Failed to fetch staff:", error);
    return [];
  }
}

export async function getStaffByTeamId(teamId: number) {
  const db = await getDb();
  if (teamId === 0) {
    return db.select().from(staff).orderBy(staff.name);
  }
  return db.select().from(staff).where(eq(staff.teamId, teamId)).orderBy(staff.name);
}
// Create a new organization
export async function createOrganization(input) {
  const db = await getDb();
  // Remove id if present, as it should be auto-incremented
  const { id, ...data } = input;
  const [result] = await db.insert(organizations).values(data);
  return result;
}
// Delete a staff department by ID and cascade delete its teams
export async function deleteStaffDepartment(id, organizationId) {
  const db = await getDb();
  // Delete teams under this department
  await db.delete(teams).where(eq(teams.staffDepartmentId, id));
  // Delete the department itself
  await db.delete(staffDepartments).where(eq(staffDepartments.id, id));
  return { success: true };
}
// Delete a team by ID
export async function deleteTeam(id) {
  const db = await getDb();
  await db.delete(teams).where(eq(teams.id, id));
  return { success: true };
}
// Create a new staff department
export async function createStaffDepartment(input) {
  const db = await getDb();
  // Remove id if present, as it should be auto-incremented
  const { id, ...data } = input;
  const [result] = await db.insert(staffDepartments).values(data);
  return result;
}
// Create a new staff record
export async function createStaff(input) {
  const db = await getDb();
  // Remove id if present, as it should be auto-incremented
  const { id, ...data } = input;
  const [result] = await db.insert(staff).values(data);
  return result;
}
// Update a staff record by ID
export async function updateStaff(id, data) {
  const db = await getDb();
  // Remove id if present in data
  const { id: _id, ...updateData } = data;
  await db.update(staff)
    .set(updateData)
    .where(eq(staff.id, id));
  return { success: true };
}

export async function deleteStaff(id: number) {
  const db = await getDb();
  await db.delete(staff).where(eq(staff.id, id));
  return { success: true };
}
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { organizations, staffDepartments, teams, staff, companies, divisions, departments, companyTeams, clients, fsms, caseFolders, sessions, sessionTypes, sessionStatuses, sessionResults } from "../drizzle/schema";
// Create a new client company
export async function createCompany(input) {
  const db = await getDb();
  // Remove id if present, as it should be auto-incremented
  const { id, ...data } = input;
  const [result] = await db.insert(companies).values(data);
  return result;
}
// Create a new team
export async function createTeam(input) {
  const db = await getDb();
  // Remove id if present, as it should be auto-incremented
  const { id, ...data } = input;
  const [result] = await db.insert(teams).values(data);
  return result;
}

// Update a team by ID
export async function updateTeam(id, data) {
  const db = await getDb();
  // Remove id if present in data
  const { id: _id, ...updateData } = data;
  await db.update(teams)
    .set(updateData)
    .where(eq(teams.id, id));
  return { success: true };
}
import { and, desc, eq, gte, like, lte, or } from "drizzle-orm";


// Fetch all organizations, sorted by name
export async function getAllOrganizations() {
  const db = await getDb();
  return db.select().from(organizations).orderBy(organizations.name);
}

export async function getOrganizationById(id: number) {
  const db = await getDb();
  const [organization] = await db.select().from(organizations).where(eq(organizations.id, id)).limit(1);
  return organization || null;
}

// Delete an organization and cascade delete its departments and teams
export async function deleteOrganization(id) {
  const db = await getDb();
  // Delete teams for all departments in this organization
  const departments = await db.select().from(staffDepartments).where(eq(staffDepartments.organizationId, id));
  const departmentIds = departments.map((d) => d.id);
  if (departmentIds.length > 0) {
    await db.delete(teams).where((row) => departmentIds.includes(row.staffDepartmentId));
    await db.delete(staffDepartments).where((row) => departmentIds.includes(row.id));
  }
  // Delete the organization itself
  await db.delete(organizations).where(eq(organizations.id, id));
  return { success: true };
}

// Fetch staff departments by organizationId (0 = all), sorted by name
export async function getStaffDepartmentsByOrganizationId(organizationId: number) {
  const db = await getDb();
  if (organizationId === 0) {
    return db.select().from(staffDepartments).orderBy(staffDepartments.name);
  }
  return db.select().from(staffDepartments).where(eq(staffDepartments.organizationId, organizationId)).orderBy(staffDepartments.name);
}

export async function getStaffDepartmentById(id: number) {
  const db = await getDb();
  const [department] = await db.select().from(staffDepartments).where(eq(staffDepartments.id, id)).limit(1);
  return department || null;
}

// Fetch teams by organizationId (0 = all), sorted by name
export async function getTeamsByOrganizationId(organizationId: number) {
  const db = await getDb();
  if (organizationId === 0) {
    return db.select().from(teams).orderBy(teams.name);
  }
  return db.select().from(teams).where(eq(teams.organizationId, organizationId)).orderBy(teams.name);
}

export async function getTeamById(id: number) {
  const db = await getDb();
  const [team] = await db.select().from(teams).where(eq(teams.id, id)).limit(1);
  return team || null;
}

// Add missing getAllDivisions, getAllDepartments, getAllCompanyTeams functions
export async function getAllDivisions() {
  const db = await getDb();
  return db.select().from(divisions).orderBy(divisions.name);
}

export async function getAllDepartments() {
  const db = await getDb();
  return db.select().from(departments).orderBy(departments.name);
}

export async function getAllCompanyTeams() {
  const db = await getDb();
  return db.select().from(companyTeams).orderBy(companyTeams.name);
}

// Add getAllCompanies function
export async function getAllCompanies() {
  const db = await getDb();
  return db.select().from(companies).orderBy(companies.name);
}

export async function getCompanyById(id: number) {
  const db = await getDb();
  const [company] = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
  return company || null;
}

export async function deleteCompany(id: number) {
  const db = await getDb();
  const companyDivisions = await db.select().from(divisions).where(eq(divisions.companyId, id));
  const divisionIds = companyDivisions.map((division) => division.id);

  await db.delete(clients).where(eq(clients.companyId, id));
  await db.delete(companyTeams).where(eq(companyTeams.companyId, id));
  await db.delete(coDepartments).where(eq(coDepartments.companyId, id));

  if (divisionIds.length > 0) {
    await db.delete(departments).where((row) => divisionIds.includes(row.divisionId));
  }

  await db.delete(divisions).where(eq(divisions.companyId, id));
  await db.delete(companies).where(eq(companies.id, id));
  return { success: true };
}

// --- CLIENT ORGS DB FUNCTIONS ---
// Fetch divisions by companyId
export async function getDivisionsByCompanyId(companyId: number) {
  const db = await getDb();
  if (companyId === 0) {
    return db.select().from(divisions).orderBy(divisions.name);
  }
  return db.select().from(divisions).where(eq(divisions.companyId, companyId)).orderBy(divisions.name);
}

export async function getDivisionById(id: number) {
  const db = await getDb();
  const [division] = await db.select().from(divisions).where(eq(divisions.id, id)).limit(1);
  return division || null;
}

export async function createDivision(input: any) {
  const db = await getDb();
  const { id, ...data } = input;
  const [result] = await db.insert(divisions).values(data);
  return result;
}

export async function updateDivision(id: number, data: any) {
  const db = await getDb();
  const { id: _id, ...updateData } = data;
  await db.update(divisions).set(updateData).where(eq(divisions.id, id));
  return { success: true };
}

export async function deleteDivision(id: number) {
  const db = await getDb();
  await db.delete(departments).where(eq(departments.divisionId, id));
  await db.delete(divisions).where(eq(divisions.id, id));
  return { success: true };
}

// Fetch departments by divisionId
export async function getDepartmentsByDivisionId(divisionId: number) {
  const db = await getDb();
  if (divisionId === 0) {
    return db.select().from(departments).orderBy(departments.name);
  }
  return db.select().from(departments).where(eq(departments.divisionId, divisionId)).orderBy(departments.name);
}

export async function getDepartmentById(id: number) {
  const db = await getDb();
  const [department] = await db.select().from(departments).where(eq(departments.id, id)).limit(1);
  return department || null;
}

export async function createDepartment(input: any) {
  const db = await getDb();
  const { id, ...data } = input;
  const [result] = await db.insert(departments).values(data);
  return result;
}

export async function updateDepartment(id: number, data: any) {
  const db = await getDb();
  const { id: _id, ...updateData } = data;
  await db.update(departments).set(updateData).where(eq(departments.id, id));
  return { success: true };
}

export async function deleteDepartment(id: number) {
  const db = await getDb();
  await db.delete(departments).where(eq(departments.id, id));
  return { success: true };
}

// Fetch company teams by departmentId
export async function getCompanyTeamsByDepartmentId(departmentId: number) {
  const db = await getDb();
  if (departmentId === 0) {
    return db.select().from(companyTeams).orderBy(companyTeams.name);
  }
  return db.select().from(companyTeams).where(eq(companyTeams.coDepartmentId, departmentId)).orderBy(companyTeams.name);
}

export async function getCompanyTeamById(id: number) {
  const db = await getDb();
  const [team] = await db.select().from(companyTeams).where(eq(companyTeams.id, id)).limit(1);
  return team || null;
}

export async function deleteCompanyTeam(id: number) {
  const db = await getDb();
  await db.delete(companyTeams).where(eq(companyTeams.id, id));
  return { success: true };
}

// --- coDepartments DB FUNCTIONS ---
import { coDepartments, notifications } from "../drizzle/schema";

export async function getCoDepartmentsByCompanyId(companyId: number) {
  const db = await getDb();
  if (companyId === 0) {
    return db.select().from(coDepartments).orderBy(coDepartments.name);
  }
  return db.select().from(coDepartments).where(eq(coDepartments.companyId, companyId)).orderBy(coDepartments.name);
}

export async function getAllCoDepartments() {
  const db = await getDb();
  return db.select().from(coDepartments).orderBy(coDepartments.name);
}

export async function getCoDepartmentById(id: number) {
  const db = await getDb();
  const [dept] = await db.select().from(coDepartments).where(eq(coDepartments.id, id)).limit(1);
  return dept || null;
}

export async function createCoDepartment(input) {
  const db = await getDb();
  const { id, ...data } = input;
  console.log('[DEBUG createCoDepartment] mutation payload:', data);
  const [result] = await db.insert(coDepartments).values(data);
  return result;
}

export async function updateCoDepartment(id, data) {
  const db = await getDb();
  const { id: _id, ...updateData } = data;
  await db.update(coDepartments)
    .set(updateData)
    .where(eq(coDepartments.id, id));
  return { success: true };
}

export async function deleteCoDepartment(id, organizationId) {
  const db = await getDb();
  await db.delete(coDepartments).where(eq(coDepartments.id, id));
  return { success: true };
}

let _db = null;
let _connection: any = null;

export async function getDb() {
  if (!_db || !_connection) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set");
    }
    _connection = await mysql.createConnection(process.env.DATABASE_URL);
    _db = drizzle(_connection);
    return _db;
  }

  try {
    // Ensure the underlying connection is still alive before returning cached drizzle client.
    await _connection.query("SELECT 1");
  } catch (error) {
    console.warn("[db.getDb] Stale MySQL connection detected, reconnecting...", error);
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set");
    }
    _connection = await mysql.createConnection(process.env.DATABASE_URL);
    _db = drizzle(_connection);
  }

  return _db;
}

/**
 * Fetch a staff record by ID
 */
export async function getStaffById(id: number) {
  const db = await getDb();
  if (!db) {
    console.error('[getStaffById] getDb() returned null');
    return null;
  }
  const [staffRecord] = await db.select().from(staff).where(eq(staff.id, id)).limit(1);
  if (!staffRecord) {
    console.error(`[getStaffById] No staff found for id: ${id}`);
  }
  return staffRecord || null;
}

// --- CLIENTS DB FUNCTIONS ---
export async function getAllClients() {
  const db = await getDb();
  return db.select().from(clients).orderBy(clients.name);
}

export async function getClientsByDepartmentId(departmentId: number) {
  const db = await getDb();
  if (departmentId === 0) {
    return db.select().from(clients).orderBy(clients.name);
  }
  return db
    .select()
    .from(clients)
    .where(eq(clients.coDepartmentId, departmentId))
    .orderBy(clients.name);
}

export async function getClientById(id: number) {
  const db = await getDb();
  const [client] = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return client || null;
}

export async function searchClients(searchTerm: string) {
  const db = await getDb();
  const term = `%${searchTerm}%`;
  return db
    .select()
    .from(clients)
    .where(or(like(clients.name, term), like(clients.email, term)))
    .orderBy(clients.name);
}

export async function createClient(input: any) {
  const db = await getDb();
  const { id, ...data } = input;
  const [result] = await db.insert(clients).values(data);
  return result;
}

export async function updateClient(id: number, data: any) {
  const db = await getDb();
  const { id: _id, ...updateData } = data;
  await db.update(clients).set(updateData).where(eq(clients.id, id));
  return { success: true };
}

export async function deleteClient(id: number) {
  const db = await getDb();
  await db.delete(clients).where(eq(clients.id, id));
  return { success: true };
}

// --- FSM DB FUNCTIONS ---
export async function getAllFSMs() {
  const db = await getDb();
  return db.select().from(fsms).orderBy(fsms.name);
}

export async function getFSMById(id: number) {
  const db = await getDb();
  const [fsm] = await db.select().from(fsms).where(eq(fsms.id, id)).limit(1);
  return fsm || null;
}

export async function createFSM(input: any) {
  const db = await getDb();
  const { id, ...data } = input;
  const [result] = await db.insert(fsms).values(data);
  return result;
}

export async function updateFSM(id: number, data: any) {
  const db = await getDb();
  const { id: _id, ...updateData } = data;
  await db.update(fsms).set(updateData).where(eq(fsms.id, id));
  return { success: true };
}

export async function deleteFSM(id: number) {
  const db = await getDb();
  await db.delete(fsms).where(eq(fsms.id, id));
  return { success: true };
}

// --- FOLDERS DB FUNCTIONS ---
export async function getFoldersByClientId(clientId: number) {
  await getDb();
  const [rows] = await _connection.query(
    `SELECT id, folderNumber, folderDescription, clientId, createdByStaffId, startDate, endDate, status, notes, createdAt, createdBy, updatedAt, updatedBy
     FROM caseFolders
     WHERE clientId = ?
     ORDER BY createdAt DESC`,
    [clientId]
  );
  return rows as any[];
}

export async function getAllFoldersWithClient() {
  await getDb();
  const [rows] = await _connection.query(
    `SELECT cf.id, cf.folderNumber, cf.folderDescription, cf.clientId, c.name AS clientName,
            cf.createdByStaffId, cf.startDate, cf.endDate, cf.status, cf.notes, cf.createdAt,
            cf.createdBy, cf.updatedAt, cf.updatedBy
     FROM caseFolders cf
     LEFT JOIN clients c ON c.id = cf.clientId
     ORDER BY c.name ASC, cf.folderNumber ASC`
  );
  return rows as any[];
}

export async function getFolderById(id: number) {
  await getDb();
  const [rows] = await _connection.query(
    `SELECT id, folderNumber, folderDescription, clientId, createdByStaffId, startDate, endDate, status, notes, createdAt, createdBy, updatedAt, updatedBy
     FROM caseFolders
     WHERE id = ?
     LIMIT 1`,
    [id]
  );
  const row = (rows as any[])[0];
  return row || null;
}

export async function getFolderByFolderNumber(clientId: number, folderNumber: string) {
  await getDb();
  const [rows] = await _connection.query(
    `SELECT id, folderNumber, folderDescription, clientId, createdByStaffId, startDate, endDate, status, notes, createdAt, createdBy, updatedAt, updatedBy
     FROM caseFolders
     WHERE clientId = ? AND folderNumber = ?
     LIMIT 1`,
    [clientId, folderNumber]
  );
  const row = (rows as any[])[0];
  return row || null;
}

export async function getNextFolderNumber(clientId: number) {
  const db = await getDb();
  const [latestFolder] = await db
    .select({ folderNumber: caseFolders.folderNumber })
    .from(caseFolders)
    .where(eq(caseFolders.clientId, clientId))
    .orderBy(desc(caseFolders.folderNumber))
    .limit(1);

  const latestNumber = latestFolder ? Number.parseInt(latestFolder.folderNumber, 10) : 0;
  if (latestNumber >= 999) {
    throw new Error("Folder number limit reached for this client (999)");
  }

  return String(latestNumber + 1).padStart(3, "0");
}

export async function createFolder(input: any) {
  const db = await getDb();
  const { id, ...data } = input;
  const resolvedFolderNumber = data.folderNumber || (await getNextFolderNumber(data.clientId));
  const [result] = await db.insert(caseFolders).values({ ...data, folderNumber: resolvedFolderNumber });
  return { id: result.insertId, ...data, folderNumber: resolvedFolderNumber };
}

export async function updateFolder(id: number, data: any) {
  const db = await getDb();
  const { id: _id, ...updateData } = data;

  if (updateData.folderNumber) {
    const currentFolder = await getFolderById(id);
    const clientId = updateData.clientId || currentFolder?.clientId;
    if (!clientId) {
      throw new Error("Client ID is required to validate folder number uniqueness");
    }
    const existing = await getFolderByFolderNumber(clientId, updateData.folderNumber);
    if (existing && existing.id !== id) {
      throw new Error("Folder number already exists for this client");
    }
  }

  await db.update(caseFolders).set(updateData).where(eq(caseFolders.id, id));
  return { success: true };
}

export async function deleteFolder(id: number) {
  const db = await getDb();
  await db.delete(caseFolders).where(eq(caseFolders.id, id));
  return { success: true };
}

// --- SESSIONS DB FUNCTIONS ---
export async function getAllSessions() {
  const db = await getDb();
  return db
    .select({
      id: sessions.id,
      folderId: sessions.folderId,
      clientId: sessions.clientId,
      staffId: sessions.staffId,
      sessionTypeId: sessions.sessionTypeId,
      sessionStatusId: sessions.sessionStatusId,
      sessionResultId: sessions.sessionResultId,
      interviewStartTime: sessions.interviewStartTime,
      interviewEndTime: sessions.interviewEndTime,
      interviewDuration: sessions.interviewDuration,
      sessionStartTime: sessions.sessionStartTime,
      sessionEndTime: sessions.sessionEndTime,
      sessionDuration: sessions.sessionDuration,
      billableHours: sessions.billableHours,
      notes: sessions.notes,
      scheduledDate: sessions.scheduledDate,
      completedAt: sessions.completedAt,
      createdAt: sessions.createdAt,
      createdBy: sessions.createdBy,
      updatedAt: sessions.updatedAt,
      updatedBy: sessions.updatedBy,
      clientName: clients.name,
      folderNumber: caseFolders.folderNumber,
      folderDescription: caseFolders.folderDescription,
      sessionTypeName: sessionTypes.name,
      sessionStatusName: sessionStatuses.name,
    })
    .from(sessions)
    .leftJoin(clients, eq(sessions.clientId, clients.id))
    .leftJoin(caseFolders, eq(sessions.folderId, caseFolders.id))
    .leftJoin(sessionTypes, eq(sessions.sessionTypeId, sessionTypes.id))
    .leftJoin(sessionStatuses, eq(sessions.sessionStatusId, sessionStatuses.id))
    .orderBy(desc(sessions.createdAt));
}

export async function getSessionsByFolderId(folderId: number) {
  const db = await getDb();
  return db.select().from(sessions).where(eq(sessions.folderId, folderId)).orderBy(desc(sessions.createdAt));
}

export async function getSessionsByStaffId(staffId: number, limit?: number) {
  const db = await getDb();
  let query: any = db
    .select({
      id: sessions.id,
      folderId: sessions.folderId,
      clientId: sessions.clientId,
      staffId: sessions.staffId,
      sessionTypeId: sessions.sessionTypeId,
      sessionStatusId: sessions.sessionStatusId,
      sessionResultId: sessions.sessionResultId,
      interviewStartTime: sessions.interviewStartTime,
      interviewEndTime: sessions.interviewEndTime,
      interviewDuration: sessions.interviewDuration,
      sessionStartTime: sessions.sessionStartTime,
      sessionEndTime: sessions.sessionEndTime,
      sessionDuration: sessions.sessionDuration,
      billableHours: sessions.billableHours,
      notes: sessions.notes,
      scheduledDate: sessions.scheduledDate,
      completedAt: sessions.completedAt,
      createdAt: sessions.createdAt,
      createdBy: sessions.createdBy,
      updatedAt: sessions.updatedAt,
      updatedBy: sessions.updatedBy,
      clientName: clients.name,
      folderNumber: caseFolders.folderNumber,
      folderDescription: caseFolders.folderDescription,
      sessionTypeName: sessionTypes.name,
      sessionStatusName: sessionStatuses.name,
    })
    .from(sessions)
    .leftJoin(clients, eq(sessions.clientId, clients.id))
    .leftJoin(caseFolders, eq(sessions.folderId, caseFolders.id))
    .leftJoin(sessionTypes, eq(sessions.sessionTypeId, sessionTypes.id))
    .leftJoin(sessionStatuses, eq(sessions.sessionStatusId, sessionStatuses.id))
    .where(eq(sessions.staffId, staffId))
    .orderBy(desc(sessions.createdAt));
  if (typeof limit === "number") {
    query = query.limit(limit);
  }
  return query;
}

export async function getSessionsByClientId(clientId: number, limit?: number) {
  const db = await getDb();
  let query: any = db
    .select({
      id: sessions.id,
      folderId: sessions.folderId,
      clientId: sessions.clientId,
      staffId: sessions.staffId,
      sessionTypeId: sessions.sessionTypeId,
      sessionStatusId: sessions.sessionStatusId,
      sessionResultId: sessions.sessionResultId,
      interviewStartTime: sessions.interviewStartTime,
      interviewEndTime: sessions.interviewEndTime,
      interviewDuration: sessions.interviewDuration,
      sessionStartTime: sessions.sessionStartTime,
      sessionEndTime: sessions.sessionEndTime,
      sessionDuration: sessions.sessionDuration,
      billableHours: sessions.billableHours,
      notes: sessions.notes,
      scheduledDate: sessions.scheduledDate,
      completedAt: sessions.completedAt,
      createdAt: sessions.createdAt,
      createdBy: sessions.createdBy,
      updatedAt: sessions.updatedAt,
      updatedBy: sessions.updatedBy,
      clientName: clients.name,
      folderNumber: caseFolders.folderNumber,
      folderDescription: caseFolders.folderDescription,
      sessionTypeName: sessionTypes.name,
      sessionStatusName: sessionStatuses.name,
    })
    .from(sessions)
    .leftJoin(clients, eq(sessions.clientId, clients.id))
    .leftJoin(caseFolders, eq(sessions.folderId, caseFolders.id))
    .leftJoin(sessionTypes, eq(sessions.sessionTypeId, sessionTypes.id))
    .leftJoin(sessionStatuses, eq(sessions.sessionStatusId, sessionStatuses.id))
    .where(eq(sessions.clientId, clientId))
    .orderBy(desc(sessions.createdAt));

  if (typeof limit === "number") {
    query = query.limit(limit);
  }

  return query;
}

export async function getUpcomingSessions(staffId: number, days: number) {
  const db = await getDb();
  const now = new Date();
  const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return db
    .select()
    .from(sessions)
    .where(and(eq(sessions.staffId, staffId), gte(sessions.scheduledDate, now), lte(sessions.scheduledDate, end)));
}

export async function getRecentSessions(staffId: number, days: number) {
  const db = await getDb();
  const now = new Date();
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return db
    .select()
    .from(sessions)
    .where(and(eq(sessions.staffId, staffId), gte(sessions.createdAt, start), lte(sessions.createdAt, now)))
    .orderBy(desc(sessions.createdAt));
}

export async function getSessionById(id: number) {
  const db = await getDb();
  const [row] = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
  return row || null;
}

export async function canEditSession(sessionId: number, isAdmin: boolean) {
  if (isAdmin) return true;
  const db = await getDb();
  const [row] = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);
  return !!row;
}

export async function createSession(input: any) {
  const db = await getDb();
  const { id, ...data } = input;
  const [result] = await db.insert(sessions).values(data);
  return { id: result.insertId, ...data };
}

// --- SESSION LOOKUP DB FUNCTIONS ---
export async function getAllSessionTypes() {
  const db = await getDb();
  return db.select().from(sessionTypes).orderBy(sessionTypes.name);
}

export async function getSessionTypeById(id: number) {
  const db = await getDb();
  const [row] = await db.select().from(sessionTypes).where(eq(sessionTypes.id, id)).limit(1);
  return row || null;
}

export async function createSessionType(input: any) {
  const db = await getDb();
  const { id, ...data } = input;
  const [result] = await db.insert(sessionTypes).values(data);
  return { id: result.insertId, ...data };
}

export async function updateSessionType(id: number, data: any) {
  const db = await getDb();
  const { id: _id, ...updateData } = data;
  await db.update(sessionTypes).set(updateData).where(eq(sessionTypes.id, id));
  return { success: true };
}

export async function getAllSessionStatuses() {
  const db = await getDb();
  return db.select().from(sessionStatuses).orderBy(sessionStatuses.name);
}

export async function getSessionStatusById(id: number) {
  const db = await getDb();
  const [row] = await db.select().from(sessionStatuses).where(eq(sessionStatuses.id, id)).limit(1);
  return row || null;
}

export async function createSessionStatus(input: any) {
  const db = await getDb();
  const { id, ...data } = input;
  const [result] = await db.insert(sessionStatuses).values(data);
  return { id: result.insertId, ...data };
}

export async function updateSessionStatus(id: number, data: any) {
  const db = await getDb();
  const { id: _id, ...updateData } = data;
  await db.update(sessionStatuses).set(updateData).where(eq(sessionStatuses.id, id));
  return { success: true };
}

export async function getAllSessionResults() {
  const db = await getDb();
  return db.select().from(sessionResults).orderBy(sessionResults.name);
}

export async function getSessionResultById(id: number) {
  const db = await getDb();
  const [row] = await db.select().from(sessionResults).where(eq(sessionResults.id, id)).limit(1);
  return row || null;
}

export async function createSessionResult(input: any) {
  const db = await getDb();
  const { id, ...data } = input;
  const [result] = await db.insert(sessionResults).values(data);
  return { id: result.insertId, ...data };
}

export async function updateSessionResult(id: number, data: any) {
  const db = await getDb();
  const { id: _id, ...updateData } = data;
  await db.update(sessionResults).set(updateData).where(eq(sessionResults.id, id));
  return { success: true };
}

export async function updateSession(id: number, data: any) {
  const db = await getDb();
  const { id: _id, ...updateData } = data;
  await db.update(sessions).set(updateData).where(eq(sessions.id, id));
  return { success: true };
}

export async function deleteSession(id: number) {
  const db = await getDb();
  await db.delete(sessions).where(eq(sessions.id, id));
  return { success: true };
}

export async function getNotificationsBySessionId(sessionId: number) {
  const db = await getDb();
  return db.select().from(notifications).where(eq(notifications.sessionId, sessionId)).orderBy(desc(notifications.createdAt));
}

export async function getPendingNotifications() {
  const db = await getDb();
  return db.select().from(notifications).where(eq(notifications.status, "pending")).orderBy(notifications.createdAt);
}

export async function createNotification(input: any) {
  const db = await getDb();
  const { id, ...data } = input;
  const [result] = await db.insert(notifications).values(data);
  return { id: result.insertId, ...data };
}

export async function deletePendingNotificationsBySessionId(sessionId: number) {
  const db = await getDb();
  await db
    .delete(notifications)
    .where(and(eq(notifications.sessionId, sessionId), eq(notifications.status, "pending")));
  return { success: true };
}

export async function updateNotification(id: number, data: any) {
  const db = await getDb();
  const { id: _id, ...updateData } = data;
  await db.update(notifications).set(updateData).where(eq(notifications.id, id));
  return { success: true };
}

// --- REPORTING DB FUNCTIONS ---
function parseHoursValue(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (!str) return null;
  const match = str.match(/\d+(?:\.\d+)?/);
  if (!match) return null;
  const num = Number(match[0]);
  return Number.isFinite(num) ? num : null;
}

function getEffectiveSessionDate(row: any): Date | null {
  const candidate = row.sessionStartTime || row.completedAt || row.scheduledDate || row.createdAt;
  if (!candidate) return null;
  const dt = new Date(candidate);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function getSessionHours(row: any): number {
  const fromBillable = parseHoursValue(row.billableHours);
  if (fromBillable !== null) return fromBillable;

  if (typeof row.sessionDuration === "number" && Number.isFinite(row.sessionDuration)) {
    return row.sessionDuration / 60;
  }

  if (row.sessionStartTime && row.sessionEndTime) {
    const start = new Date(row.sessionStartTime).getTime();
    const end = new Date(row.sessionEndTime).getTime();
    if (!Number.isNaN(start) && !Number.isNaN(end) && end >= start) {
      return (end - start) / (1000 * 60 * 60);
    }
  }

  return 0;
}

export async function getBillableHoursByStaff(staffId: number, startDate: Date, endDate: Date) {
  await getDb();
  const [rows] = await _connection.query(
    `SELECT billableHours, sessionDuration, sessionStartTime, sessionEndTime, completedAt, scheduledDate, createdAt
     FROM sessions
     WHERE staffId = ?`,
    [staffId]
  );

  let total = 0;
  for (const row of rows as any[]) {
    const effective = getEffectiveSessionDate(row);
    if (!effective) continue;
    if (effective < startDate || effective > endDate) continue;
    total += getSessionHours(row);
  }
  return Number(total.toFixed(2));
}

export async function getBillableHoursByClient(clientId: number, startDate: Date, endDate: Date) {
  await getDb();
  const [rows] = await _connection.query(
    `SELECT billableHours, sessionDuration, sessionStartTime, sessionEndTime, completedAt, scheduledDate, createdAt
     FROM sessions
     WHERE clientId = ?`,
    [clientId]
  );

  let total = 0;
  for (const row of rows as any[]) {
    const effective = getEffectiveSessionDate(row);
    if (!effective) continue;
    if (effective < startDate || effective > endDate) continue;
    total += getSessionHours(row);
  }
  return Number(total.toFixed(2));
}

export async function getMonthlyBillableHours(staffId: number, year: number, month: number) {
  const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  return getBillableHoursByStaff(staffId, startDate, endDate);
}
