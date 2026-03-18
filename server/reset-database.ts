/**
 * Preview Reset Database - Returns counts of preserved and deleted records
 * Does NOT modify any data.
 */
export async function previewResetDatabase(): Promise<{
  adminCount: number;
  coDepartmentCount: number;
  coDepartmentUniqueCount: number;
  staffDepartmentCount: number;
  staffDepartmentUniqueCount: number;
  companyTeamCount: number;
  companyTeamUniqueCount: number;
  staffTeamCount: number;
  staffTeamUniqueCount: number;
  clientCount: number;
  staffCount: number;
  companyCount: number;
  organizationCount: number;
  sessionCount: number;
}> {
  const db = await getDb();
  if (!db) {
    return {
      adminCount: 0,
      coDepartmentCount: 0,
      coDepartmentUniqueCount: 0,
      staffDepartmentCount: 0,
      staffDepartmentUniqueCount: 0,
      companyTeamCount: 0,
      companyTeamUniqueCount: 0,
      staffTeamCount: 0,
      staffTeamUniqueCount: 0,
      clientCount: 0,
      staffCount: 0,
      companyCount: 0,
      organizationCount: 0,
      sessionCount: 0,
    };
  }
  const [
    adminCount,
    coDepartmentCount,
    staffDepartmentCount,
    companyTeamCount,
    staffTeamCount,
    clientCount,
    staffCount,
    companyCount,
    organizationCount,
    sessionCount,
    coDepartmentNames,
    staffDepartmentNames,
    companyTeamNames,
    staffTeamNames
  ] = await Promise.all([
    db.select({ count: sql`COUNT(*)` }).from(staff).where(sql`role = 'admin'`).then(rows => Number(rows[0]?.count ?? 0)),
    db.select({ count: sql`COUNT(*)` }).from(coDepartments).then(rows => Number(rows[0]?.count ?? 0)),
    db.select({ count: sql`COUNT(*)` }).from(staffDepartments).then(rows => Number(rows[0]?.count ?? 0)),
    db.select({ count: sql`COUNT(*)` }).from(companyTeams).then(rows => Number(rows[0]?.count ?? 0)),
    db.select({ count: sql`COUNT(*)` }).from(teams).then(rows => Number(rows[0]?.count ?? 0)),
    db.select({ count: sql`COUNT(*)` }).from(clients).then(rows => Number(rows[0]?.count ?? 0)),
    db.select({ count: sql`COUNT(*)` }).from(staff).then(rows => Number(rows[0]?.count ?? 0)),
    db.select({ count: sql`COUNT(*)` }).from(companies).then(rows => Number(rows[0]?.count ?? 0)),
    db.select({ count: sql`COUNT(*)` }).from(organizations).then(rows => Number(rows[0]?.count ?? 0)),
    db.select({ count: sql`COUNT(*)` }).from(sessions).then(rows => Number(rows[0]?.count ?? 0)),
    db.select({ name: coDepartments.name }).from(coDepartments).then(rows => rows.map(r => r.name)),
    db.select({ name: staffDepartments.name }).from(staffDepartments).then(rows => rows.map(r => r.name)),
    db.select({ name: companyTeams.name }).from(companyTeams).then(rows => rows.map(r => r.name)),
    db.select({ name: teams.name }).from(teams).then(rows => rows.map(r => r.name)),
  ]);

  const toUniqueNames = (names: Array<string | null>) => {
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const value of names) {
      const trimmed = (value || "").trim();
      if (!trimmed) continue;
      const key = trimmed.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(trimmed);
      }
    }
    return unique;
  };

  return {
    adminCount,
    coDepartmentCount,
    coDepartmentUniqueCount: toUniqueNames(coDepartmentNames).length,
    staffDepartmentCount,
    staffDepartmentUniqueCount: toUniqueNames(staffDepartmentNames).length,
    companyTeamCount,
    companyTeamUniqueCount: toUniqueNames(companyTeamNames).length,
    staffTeamCount,
    staffTeamUniqueCount: toUniqueNames(staffTeamNames).length,
    clientCount,
    staffCount,
    companyCount,
    organizationCount,
    sessionCount,
  };
}
import { getDb } from "./db";
import { 
  companies, 
  divisions, 
  departments, 
  companyTeams,
  teams,
  organizations,
  staffDepartments,
  coDepartments,
  authSessions,
  clients,
  fsms,
  sessions,
  caseFolders,
  staff,
  notifications,
  companyTemplates,
} from "../drizzle/schema";
import { sql } from "drizzle-orm";

/**
 * Reset Database - Clear all data except admin staff
 * 
 * This function deletes all records from all tables except:
 * - Admin staff (role = 'admin')
 * 
 * Use with caution! This is irreversible.
 */
type AdminStaffSnapshot = {
  id: number;
  organizationId: number | null;
  staffDepartmentId: number | null;
  teamId: number | null;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  passwordHash: string | null;
  mustChangePassword: number;
  lastSignedIn: Date | string | null;
  role: "admin" | "counselor" | "viewer";
  isVipRated: number;
  isAdmin: number;
  createdAt: Date | string | null;
  createdBy: number;
  updatedAt: Date | string | null;
  updatedBy: number;
};

const toUniqueNames = (names: Array<string | null>) => {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const value of names) {
    const trimmed = (value || "").trim();
    if (!trimmed) {
      continue;
    }
    const key = trimmed.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(trimmed);
    }
  }
  return unique;
};

const toDateOrNow = (value: Date | string | null | undefined) => {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return new Date();
};

export async function resetDatabase(adminUserId: number): Promise<{ success: boolean; message: string }> {
  const db = await getDb();
  if (!db) {
    return {
      success: false,
      message: "Database not available"
    };
  }

  try {
    // Step 1/2/3: Snapshot unique names and admin staff before truncation.
    const [savedCoDepartments, savedStaffDepartments, savedCompanyTeams, savedTeams, adminStaff] = await Promise.all([
      db.select({ name: coDepartments.name }).from(coDepartments),
      db.select({ name: staffDepartments.name }).from(staffDepartments),
      db.select({ name: companyTeams.name }).from(companyTeams),
      db.select({ name: teams.name }).from(teams),
      db.select().from(staff).where(sql`role = 'admin'`),
    ]);

    const adminSnapshots = adminStaff as AdminStaffSnapshot[];
    if (adminSnapshots.length === 0) {
      return {
        success: false,
        message: "Reset aborted: no admin staff accounts were found to preserve.",
      };
    }

    const coDepartmentNames = toUniqueNames(savedCoDepartments.map((row) => row.name));
    const staffDepartmentNames = toUniqueNames(savedStaffDepartments.map((row) => row.name));
    const companyTeamNames = toUniqueNames(savedCompanyTeams.map((row) => row.name));
    const staffTeamNames = toUniqueNames(savedTeams.map((row) => row.name));

    // Step 4: Truncate all tables except sessionResults, sessionStatuses, sessionTypes.
    const truncateTables = [
      "authSessions",
      "notifications",
      "sessions",
      "caseFolders",
      "clients",
      "fsms",
      "companyTemplates",
      "companyTeams",
      "coDepartments",
      "departments",
      "divisions",
      "companies",
      "teams",
      "staffDepartments",
      "organizations",
      "staff",
    ];

    await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);
    try {
      for (const tableName of truncateTables) {
        await db.execute(sql.raw(`TRUNCATE TABLE \`${tableName}\``));
      }
    } finally {
      await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);
    }

    // Step 5: Reimport preserved admin staff + unique name lists.
    await db.insert(staff).values(
      adminSnapshots.map((row) => ({
        id: row.id,
        organizationId: null,
        staffDepartmentId: null,
        teamId: null,
        name: row.name,
        address: row.address,
        phone: row.phone,
        email: row.email,
        passwordHash: row.passwordHash,
        mustChangePassword: row.mustChangePassword ?? 0,
        lastSignedIn: toDateOrNow(row.lastSignedIn),
        role: "admin",
        isVipRated: row.isVipRated ?? 0,
        isAdmin: row.isAdmin ?? 1,
        createdAt: toDateOrNow(row.createdAt),
        createdBy: row.createdBy || row.id,
        updatedAt: toDateOrNow(row.updatedAt),
        updatedBy: row.updatedBy || row.id,
      }))
    );

    const actorId = adminSnapshots.find((row) => row.id === adminUserId)?.id ?? adminSnapshots[0].id;

    const [orgInsert] = await db.insert(organizations).values({
      name: "Restored Organization",
      createdBy: actorId,
      updatedBy: actorId,
    });
    const restoredOrganizationId = Number(orgInsert.insertId);

    const [companyInsert] = await db.insert(companies).values({
      name: "Restored Company",
      createdBy: actorId,
      updatedBy: actorId,
    });
    const restoredCompanyId = Number(companyInsert.insertId);

    const createdStaffDepartmentIds: number[] = [];
    for (const name of staffDepartmentNames) {
      const [result] = await db.insert(staffDepartments).values({
        organizationId: restoredOrganizationId,
        name,
        createdBy: actorId,
        updatedBy: actorId,
      });
      createdStaffDepartmentIds.push(Number(result.insertId));
    }

    const createdCoDepartmentIds: number[] = [];
    for (const name of coDepartmentNames) {
      const [result] = await db.insert(coDepartments).values({
        companyId: restoredCompanyId,
        name,
        createdBy: actorId,
        updatedBy: actorId,
      });
      createdCoDepartmentIds.push(Number(result.insertId));
    }

    let fallbackCoDepartmentId = createdCoDepartmentIds[0];
    if (!fallbackCoDepartmentId && companyTeamNames.length > 0) {
      const [result] = await db.insert(coDepartments).values({
        companyId: restoredCompanyId,
        name: "General",
        createdBy: actorId,
        updatedBy: actorId,
      });
      fallbackCoDepartmentId = Number(result.insertId);
      createdCoDepartmentIds.push(fallbackCoDepartmentId);
    }

    for (const name of companyTeamNames) {
      await db.insert(companyTeams).values({
        companyId: restoredCompanyId,
        coDepartmentId: fallbackCoDepartmentId,
        name,
        createdBy: actorId,
        updatedBy: actorId,
      });
    }

    const fallbackStaffDepartmentId = createdStaffDepartmentIds[0] ?? null;
    for (const name of staffTeamNames) {
      await db.insert(teams).values({
        organizationId: restoredOrganizationId,
        staffDepartmentId: fallbackStaffDepartmentId,
        name,
        createdBy: actorId,
        updatedBy: actorId,
      });
    }

    await db
      .update(staff)
      .set({
        organizationId: restoredOrganizationId,
        staffDepartmentId: fallbackStaffDepartmentId,
        updatedBy: actorId,
      })
      .where(sql`role = 'admin'`);
    
    return {
      success: true,
      message: `Database reset complete. Preserved ${adminSnapshots.length} admin staff, ${coDepartmentNames.length} co-departments, ${staffDepartmentNames.length} staff departments, ${companyTeamNames.length} company teams, and ${staffTeamNames.length} staff teams.`
    };
  } catch (error: any) {
    console.error("Database reset error:", error);
    return {
      success: false,
      message: `Failed to reset database: ${error.message}`
    };
  }
}
