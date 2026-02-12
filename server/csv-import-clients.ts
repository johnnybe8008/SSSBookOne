import { getDb } from "./db";
import { companies, divisions, departments, companyTeams, clients } from "../drizzle/schema";
import { sql } from "drizzle-orm";

export interface ClientCSVRow {
  Name: string;
  Email?: string;
  HomePhone?: string;
  MobilePhone?: string;
  WorkPhone?: string;
  Address?: string;
  Occupation?: string;
  Title?: string;
  Age?: string;
  Company?: string;
  Division?: string;
  Department: string; // Required - clients must belong to a department
  ReferralSourceType?: string; // "fsm", "staff", or "client"
  ReferralSourceId?: string;
}

export interface ClientImportResult {
  success: boolean;
  message: string;
  clientsCreated: number;
  clientsSkipped: number;
  errors: string[];
}

/**
 * Parse CSV text into client rows
 */
export function parseClientCSV(csvText: string): ClientCSVRow[] {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) {
    throw new Error("CSV must have at least a header row and one data row");
  }

  const headers = lines[0].split(",").map((h) => h.trim());
  const rows: ClientCSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    if (values.length === 0 || values.every((v) => !v)) continue; // Skip empty rows

    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });
    rows.push(row as ClientCSVRow);
  }

  return rows;
}

/**
 * Import clients from CSV data
 */
export async function importClientsFromCSV(
  csvRows: ClientCSVRow[],
  createdBy: number
): Promise<ClientImportResult> {
  const dbInstance = await getDb();
  if (!dbInstance) {
    throw new Error("Database connection failed");
  }
  let clientsCreated = 0;
  let clientsSkipped = 0;
  const errors: string[] = [];

  for (let i = 0; i < csvRows.length; i++) {
    const row = csvRows[i];
    const rowNum = i + 2; // +2 because: +1 for header, +1 for 0-index

    try {
      // Validate required fields
      if (!row.Name || !row.Name.trim()) {
        errors.push(`Row ${rowNum}: Name is required`);
        clientsSkipped++;
        continue;
      }
      if (!row.Department || !row.Department.trim()) {
        errors.push(`Row ${rowNum}: Department is required`);
        clientsSkipped++;
        continue;
      }

      // Find or create company
      let companyId: number | null = null;
      if (row.Company && row.Company.trim()) {
        // Check if company exists by querying
        const existingCompanies: any = await dbInstance.execute(
          sql`SELECT id FROM companies WHERE name = ${row.Company.trim()} LIMIT 1`
        );

        if (existingCompanies && existingCompanies[0] && existingCompanies[0].length > 0) {
          companyId = existingCompanies[0][0].id;
        } else {
          // Create new company
          const result: any = await dbInstance.insert(companies).values({
            name: row.Company.trim(),
            createdBy,
            updatedBy: createdBy,
          });
          companyId = result[0].insertId;
        }
      }

      // Find division (must exist if specified)
      let divisionId: number | null = null;
      if (row.Division && row.Division.trim() && companyId) {
        const existingDivisions: any = await dbInstance.execute(
          sql`SELECT id FROM divisions WHERE name = ${row.Division.trim()} AND companyId = ${companyId} LIMIT 1`
        );

        if (existingDivisions && existingDivisions[0] && existingDivisions[0].length > 0) {
          divisionId = existingDivisions[0][0].id;
        } else {
          errors.push(`Row ${rowNum}: Division "${row.Division}" not found for company "${row.Company}"`);
        }
      }

      // Find department (must exist if specified)
      let departmentId: number | null = null;
      if (row.Department && row.Department.trim() && divisionId) {
        const existingDepartments: any = await dbInstance.execute(
          sql`SELECT id FROM departments WHERE name = ${row.Department.trim()} AND divisionId = ${divisionId} LIMIT 1`
        );

        if (existingDepartments && existingDepartments[0] && existingDepartments[0].length > 0) {
          departmentId = existingDepartments[0][0].id;
        } else {
          errors.push(`Row ${rowNum}: Department "${row.Department}" not found in division "${row.Division}"`);
        }
      }

      // Company team is not used in client import (clients are assigned to departments)

      // Check for duplicate client (same name + department)
      if (departmentId) {
        const existingClients: any = await dbInstance.execute(
          sql`SELECT id FROM clients WHERE name = ${row.Name.trim()} AND departmentId = ${departmentId} LIMIT 1`
        );

        if (existingClients && existingClients[0] && existingClients[0].length > 0) {
          errors.push(`Row ${rowNum}: Client "${row.Name}" already exists in department "${row.Department}"`);
          clientsSkipped++;
          continue;
        }
      }

      // Parse referral source
      let referralSourceType: "fsm" | "staff" | "client" | null = null;
      let referralSourceId: number | null = null;

      if (row.ReferralSourceType && row.ReferralSourceId) {
        const source = row.ReferralSourceType.trim().toLowerCase();
        const refId = parseInt(row.ReferralSourceId.trim(), 10);

        if (isNaN(refId)) {
          errors.push(`Row ${rowNum}: Invalid ReferralSourceId "${row.ReferralSourceId}"`);
        } else {
          if (source === "fsm" || source === "staff" || source === "client") {
            referralSourceType = source as "fsm" | "staff" | "client";
            referralSourceId = refId;
          } else {
            errors.push(`Row ${rowNum}: Invalid ReferralSourceType "${row.ReferralSourceType}" (must be fsm, staff, or client)`);
          }
        }
      }

      // Parse age
      let age: number | null = null;
      if (row.Age && row.Age.trim()) {
        const parsedAge = parseInt(row.Age.trim(), 10);
        if (!isNaN(parsedAge)) {
          age = parsedAge;
        }
      }

      // Department is required
      if (!departmentId) {
        errors.push(`Row ${rowNum}: Could not find or create department "${row.Department}"`);
        clientsSkipped++;
        continue;
      }

      // Create client
      await dbInstance.insert(clients).values({
        name: row.Name.trim(),
        email: row.Email && row.Email.trim() ? row.Email.trim() : null,
        homePhone: row.HomePhone && row.HomePhone.trim() ? row.HomePhone.trim() : null,
        mobilePhone: row.MobilePhone && row.MobilePhone.trim() ? row.MobilePhone.trim() : null,
        workPhone: row.WorkPhone && row.WorkPhone.trim() ? row.WorkPhone.trim() : null,
        address: row.Address && row.Address.trim() ? row.Address.trim() : null,
        occupation: row.Occupation && row.Occupation.trim() ? row.Occupation.trim() : null,
        title: row.Title && row.Title.trim() ? row.Title.trim() : null,
        age: age,
        departmentId: departmentId,
        referralSourceType: referralSourceType,
        referralSourceId: referralSourceId,
        createdBy,
        updatedBy: createdBy,
      });

      clientsCreated++;
    } catch (error: any) {
      errors.push(`Row ${rowNum}: ${error.message || "Unknown error"}`);
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
