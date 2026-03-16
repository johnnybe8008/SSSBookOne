import { getDb } from "./db";
import { organizations, staffDepartments, teams, staff } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export interface CSVImportRow {
  Name: string;
  Email?: string;
  Phone?: string;
  Address?: string;
  Role?: string;
  IsVipRated?: string;
  Organization?: string;
  StaffDepartment?: string;
  Team?: string;
}

export interface ImportResult {
  success: boolean;
  message: string;
  stats?: {
    organizationsCreated: number;
    departmentsCreated: number;
    teamsCreated: number;
    staffCreated: number;
    staffSkipped: number;
  };
  errors?: string[];
}

const normalize = (value: string | null | undefined) => String(value || "").trim();
const normalizeKey = (value: string | null | undefined) => normalize(value).toLowerCase();

const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
      continue;
    }

    current += ch;
  }

  result.push(current.trim());
  return result;
};

const parseTruthy = (value: string | null | undefined) => {
  const v = normalizeKey(value);
  return v === "1" || v === "true" || v === "yes" || v === "y";
};

const parseRole = (value: string | null | undefined): "admin" | "counselor" | "viewer" => {
  const v = normalizeKey(value);
  if (v === "admin" || v === "viewer") return v;
  return "counselor";
};

/**
 * Parse CSV text into structured staff import rows.
 */
export function parseCSV(csvText: string): CSVImportRow[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (lines.length < 2) {
    throw new Error("CSV file must contain a header row and at least one data row");
  }

  const headers = parseCSVLine(lines[0]).map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows: CSVImportRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    if (!rawLine) continue;

    const values = parseCSVLine(rawLine).map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: any = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || "";
    });
    rows.push(row as CSVImportRow);
  }

  return rows;
}

/**
 * Import staff records from CSV data.
 *
 * CSV format:
 * Name,Email,Phone,Address,Role,IsVipRated,Organization,StaffDepartment,Team
 */
export async function importOrganizationalCSV(
  csvData: CSVImportRow[],
  userId: number
): Promise<ImportResult> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "Database not available" };
  }

  const errors: string[] = [];
  const stats = {
    organizationsCreated: 0,
    departmentsCreated: 0,
    teamsCreated: 0,
    staffCreated: 0,
    staffSkipped: 0,
  };

  try {
    const orgRows: any[] = await db.select().from(organizations);
    const deptRows: any[] = await db.select().from(staffDepartments);
    const teamRows: any[] = await db.select().from(teams);

    const orgMap = new Map<string, number>();
    const deptMap = new Map<string, number>();
    const teamMap = new Map<string, number>();

    orgRows.forEach((row) => orgMap.set(normalizeKey(row.name), Number(row.id)));
    deptRows.forEach((row) => deptMap.set(`${Number(row.organizationId)}:${normalizeKey(row.name)}`, Number(row.id)));
    teamRows.forEach((row) => teamMap.set(`${Number(row.staffDepartmentId || 0)}:${normalizeKey(row.name)}`, Number(row.id)));

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      const rowNum = i + 2;

      const name = normalize(row.Name);
      const email = normalize(row.Email);
      const phone = normalize(row.Phone);
      const address = normalize(row.Address);
      const orgName = normalize(row.Organization);
      const deptName = normalize(row.StaffDepartment);
      const teamName = normalize(row.Team);
      const role = parseRole(row.Role);
      const isVipRated = parseTruthy(row.IsVipRated) ? 1 : 0;
      const isAdmin = role === "admin" ? 1 : 0;

      if (!name) {
        errors.push(`Row ${rowNum}: Name is required`);
        stats.staffSkipped++;
        continue;
      }

      if ((deptName || teamName) && !orgName) {
        errors.push(`Row ${rowNum}: Organization is required when StaffDepartment or Team is provided`);
        stats.staffSkipped++;
        continue;
      }

      if (teamName && !deptName) {
        errors.push(`Row ${rowNum}: StaffDepartment is required when Team is provided`);
        stats.staffSkipped++;
        continue;
      }

      let organizationId: number | null = null;
      if (orgName) {
        const orgKey = normalizeKey(orgName);
        organizationId = orgMap.get(orgKey) || null;
        if (!organizationId) {
          const insertOrg: any = await db.insert(organizations).values({
            name: orgName,
            createdBy: userId,
            updatedBy: userId,
          });
          organizationId = Number(insertOrg?.[0]?.insertId || 0) || null;
          if (organizationId) {
            orgMap.set(orgKey, organizationId);
            stats.organizationsCreated++;
          }
        }
      }

      let staffDepartmentId: number | null = null;
      if (organizationId && deptName) {
        const deptKey = `${organizationId}:${normalizeKey(deptName)}`;
        staffDepartmentId = deptMap.get(deptKey) || null;
        if (!staffDepartmentId) {
          const insertDept: any = await db.insert(staffDepartments).values({
            organizationId,
            name: deptName,
            createdBy: userId,
            updatedBy: userId,
          });
          staffDepartmentId = Number(insertDept?.[0]?.insertId || 0) || null;
          if (staffDepartmentId) {
            deptMap.set(deptKey, staffDepartmentId);
            stats.departmentsCreated++;
          }
        }
      }

      let teamId: number | null = null;
      if (organizationId && staffDepartmentId && teamName) {
        const teamKey = `${staffDepartmentId}:${normalizeKey(teamName)}`;
        teamId = teamMap.get(teamKey) || null;
        if (!teamId) {
          const insertTeam: any = await db.insert(teams).values({
            organizationId,
            staffDepartmentId,
            name: teamName,
            createdBy: userId,
            updatedBy: userId,
          });
          teamId = Number(insertTeam?.[0]?.insertId || 0) || null;
          if (teamId) {
            teamMap.set(teamKey, teamId);
            stats.teamsCreated++;
          }
        }
      }

      let duplicate: any[] = [];
      if (email) {
        duplicate = await db.select({ id: staff.id }).from(staff).where(eq(staff.email, email.toLowerCase())).limit(1);
      } else {
        const sameNameRows: any[] = await db.select().from(staff).where(eq(staff.name, name));
        duplicate = sameNameRows.filter(
          (candidate: any) =>
            Number(candidate.organizationId || 0) === Number(organizationId || 0) &&
            Number(candidate.staffDepartmentId || 0) === Number(staffDepartmentId || 0) &&
            Number(candidate.teamId || 0) === Number(teamId || 0)
        );
      }

      if (duplicate.length > 0) {
        errors.push(`Row ${rowNum}: Staff record already exists (${email || name})`);
        stats.staffSkipped++;
        continue;
      }

      await db.insert(staff).values({
        organizationId,
        staffDepartmentId,
        teamId,
        name,
        address: address || null,
        phone: phone || null,
        email: email ? email.toLowerCase() : null,
        role,
        isVipRated,
        isAdmin,
        mustChangePassword: 1,
        createdBy: userId,
        updatedBy: userId,
      });

      stats.staffCreated++;
    }

    return {
      success: stats.staffCreated > 0,
      message:
        stats.staffCreated > 0
          ? `Imported ${stats.staffCreated} staff row(s). ${stats.staffSkipped} skipped.`
          : "No staff rows were imported.",
      stats,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error: any) {
    console.error("Staff CSV import error:", error);
    return {
      success: false,
      message: `Import failed: ${error.message}`,
      stats,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}
