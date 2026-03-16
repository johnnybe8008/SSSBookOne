import { getDb } from "./db";
import { companies, coDepartments, companyTeams, clients } from "../drizzle/schema";
import { and, eq } from "drizzle-orm";

export interface ClientCSVRow {
  Name: string;
  Email?: string;
  HomePhone?: string;
  MobilePhone?: string;
  WorkPhone?: string;
  Address?: string;
  Occupation?: string;
  Title?: string;
  DateOfBirth?: string; // YYYY-MM-DD
  Company: string;
  Department: string;
  Team?: string;
  ReferralSourceType?: string; // fsm | staff | client
  ReferralSourceId?: string;
}

export interface ClientImportResult {
  success: boolean;
  message: string;
  clientsCreated: number;
  clientsSkipped: number;
  errors: string[];
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

/**
 * Parse CSV text into client rows.
 */
export function parseClientCSV(csvText: string): ClientCSVRow[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (lines.length < 2) {
    throw new Error("CSV must have at least a header row and one data row");
  }

  const headers = parseCSVLine(lines[0]).map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows: ClientCSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    if (!rawLine) continue;

    const values = parseCSVLine(rawLine).map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });
    rows.push(row as ClientCSVRow);
  }

  return rows;
}

/**
 * Import clients from CSV data using current company -> department -> team schema.
 */
export async function importClientsFromCSV(csvRows: ClientCSVRow[], createdBy: number): Promise<ClientImportResult> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database connection failed");
  }

  let clientsCreated = 0;
  let clientsSkipped = 0;
  const errors: string[] = [];

  const companyRows: any[] = await db.select().from(companies);
  const departmentRows: any[] = await db.select().from(coDepartments);
  const teamRows: any[] = await db.select().from(companyTeams);

  const companyMap = new Map<string, number>();
  const departmentMap = new Map<string, number>();
  const teamMap = new Map<string, number>();

  companyRows.forEach((row) => companyMap.set(normalizeKey(row.name), Number(row.id)));
  departmentRows.forEach((row) => departmentMap.set(`${Number(row.companyId)}:${normalizeKey(row.name)}`, Number(row.id)));
  teamRows.forEach((row) => teamMap.set(`${Number(row.coDepartmentId)}:${normalizeKey(row.name)}`, Number(row.id)));

  for (let i = 0; i < csvRows.length; i++) {
    const row = csvRows[i];
    const rowNum = i + 2;

    try {
      const name = normalize(row.Name);
      const companyName = normalize(row.Company);
      const departmentName = normalize(row.Department);
      const teamName = normalize(row.Team);

      if (!name) {
        errors.push(`Row ${rowNum}: Name is required`);
        clientsSkipped++;
        continue;
      }
      if (!companyName) {
        errors.push(`Row ${rowNum}: Company is required`);
        clientsSkipped++;
        continue;
      }
      if (!departmentName) {
        errors.push(`Row ${rowNum}: Department is required`);
        clientsSkipped++;
        continue;
      }

      const companyKey = normalizeKey(companyName);
      let companyId = companyMap.get(companyKey);
      if (!companyId) {
        const companyInsert: any = await db.insert(companies).values({
          name: companyName,
          createdBy,
          updatedBy: createdBy,
        });
        companyId = Number(companyInsert?.[0]?.insertId || 0);
        if (companyId) {
          companyMap.set(companyKey, companyId);
        }
      }

      if (!companyId) {
        errors.push(`Row ${rowNum}: Could not resolve company "${companyName}"`);
        clientsSkipped++;
        continue;
      }

      const departmentKey = `${companyId}:${normalizeKey(departmentName)}`;
      let coDepartmentId = departmentMap.get(departmentKey);
      if (!coDepartmentId) {
        const deptInsert: any = await db.insert(coDepartments).values({
          companyId,
          name: departmentName,
          createdBy,
          updatedBy: createdBy,
        });
        coDepartmentId = Number(deptInsert?.[0]?.insertId || 0);
        if (coDepartmentId) {
          departmentMap.set(departmentKey, coDepartmentId);
        }
      }

      if (!coDepartmentId) {
        errors.push(`Row ${rowNum}: Could not resolve department "${departmentName}"`);
        clientsSkipped++;
        continue;
      }

      let companyTeamId: number | null = null;
      if (teamName) {
        const teamKey = `${coDepartmentId}:${normalizeKey(teamName)}`;
        companyTeamId = teamMap.get(teamKey) || null;
        if (!companyTeamId) {
          const teamInsert: any = await db.insert(companyTeams).values({
            companyId,
            coDepartmentId,
            name: teamName,
            createdBy,
            updatedBy: createdBy,
          });
          companyTeamId = Number(teamInsert?.[0]?.insertId || 0) || null;
          if (companyTeamId) {
            teamMap.set(teamKey, companyTeamId);
          }
        }
      }

      const duplicate = await db
        .select({ id: clients.id })
        .from(clients)
        .where(
          and(
            eq(clients.name, name),
            eq(clients.companyId, companyId),
            eq(clients.coDepartmentId, coDepartmentId)
          )
        )
        .limit(1);

      if (duplicate.length > 0) {
        errors.push(`Row ${rowNum}: Client "${name}" already exists in ${companyName} / ${departmentName}`);
        clientsSkipped++;
        continue;
      }

      let referralSourceType: "fsm" | "staff" | "client" | null = null;
      let referralSourceId: number | null = null;
      const rawReferralType = normalizeKey(row.ReferralSourceType);
      const rawReferralId = normalize(row.ReferralSourceId);
      if (rawReferralType || rawReferralId) {
        if (!(rawReferralType === "fsm" || rawReferralType === "staff" || rawReferralType === "client")) {
          errors.push(`Row ${rowNum}: ReferralSourceType must be one of fsm, staff, client`);
        } else {
          referralSourceType = rawReferralType;
          const idNum = Number(rawReferralId);
          if (!Number.isFinite(idNum) || idNum <= 0) {
            errors.push(`Row ${rowNum}: ReferralSourceId must be a positive number when ReferralSourceType is provided`);
            referralSourceType = null;
          } else {
            referralSourceId = idNum;
          }
        }
      }

      let dateOfBirth: Date | null = null;
      const rawDob = normalize(row.DateOfBirth);
      if (rawDob) {
        const parsed = new Date(rawDob);
        if (Number.isNaN(parsed.getTime())) {
          errors.push(`Row ${rowNum}: Invalid DateOfBirth \"${rawDob}\" (use YYYY-MM-DD)`);
        } else {
          dateOfBirth = parsed;
        }
      }

      await db.insert(clients).values({
        companyId,
        coDepartmentId,
        companyTeamId,
        name,
        email: normalize(row.Email) || null,
        homePhone: normalize(row.HomePhone) || null,
        mobilePhone: normalize(row.MobilePhone) || null,
        workPhone: normalize(row.WorkPhone) || null,
        address: normalize(row.Address) || null,
        occupation: normalize(row.Occupation) || null,
        title: normalize(row.Title) || null,
        dateOfBirth,
        referralSourceType,
        referralSourceId,
        createdBy,
        updatedBy: createdBy,
      });

      clientsCreated++;
    } catch (error: any) {
      errors.push(`Row ${rowNum}: ${error?.message || "Unknown error"}`);
      clientsSkipped++;
    }
  }

  const success = clientsCreated > 0;
  const message = success
    ? `Successfully imported ${clientsCreated} client(s). ${clientsSkipped} skipped.${errors.length > 0 ? ` ${errors.length} error(s) encountered.` : ""}`
    : `Import failed. ${errors.length} error(s) encountered.`;

  return {
    success,
    message,
    clientsCreated,
    clientsSkipped,
    errors,
  };
}
