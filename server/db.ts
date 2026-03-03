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
  const db = await getDb();
  return db.select().from(staff);
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
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { organizations, staffDepartments, teams, staff } from "../drizzle/schema";
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
import { eq } from "drizzle-orm";


// Fetch all organizations, sorted by name
export async function getAllOrganizations() {
  const db = await getDb();
  return db.select().from(organizations).orderBy(organizations.name);
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

// Fetch teams by organizationId (0 = all), sorted by name
export async function getTeamsByOrganizationId(organizationId: number) {
  const db = await getDb();
  if (organizationId === 0) {
    return db.select().from(teams).orderBy(teams.name);
  }
  return db.select().from(teams).where(eq(teams.organizationId, organizationId)).orderBy(teams.name);
}
import { eq } from "drizzle-orm";

let _db = null;

export async function getDb() {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set");
    }
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    _db = drizzle(connection);
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
