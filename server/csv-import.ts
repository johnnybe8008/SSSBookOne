import { getDb } from "./db";
import { 
  companies, 
  divisions, 
  departments, 
  companyTeams,
  type InsertCompany,
  type InsertDivision,
  type InsertDepartment,
  type InsertCompanyTeam
} from "../drizzle/schema";
import { sql } from "drizzle-orm";

export interface CSVImportRow {
  companyName: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  divisionName?: string;
  divisionDescription?: string;
  departmentName?: string;
  departmentDescription?: string;
  teamName?: string;
  teamDescription?: string;
}

export interface ImportResult {
  success: boolean;
  message: string;
  stats?: {
    companiesCreated: number;
    divisionsCreated: number;
    departmentsCreated: number;
    teamsCreated: number;
  };
  errors?: string[];
}

/**
 * Import organizational structure from CSV data
 * 
 * CSV Format:
 * companyName,companyAddress,companyPhone,companyEmail,divisionName,divisionDescription,departmentName,departmentDescription,teamName,teamDescription
 * 
 * Example:
 * "Acme Corp","123 Main St","555-1234","info@acme.com","Sales Division","Sales operations","Sales Dept","Main sales","Team A","Sales team A"
 * "Acme Corp","","","","Sales Division","","Sales Dept","","Team B","Sales team B"
 * "Acme Corp","","","","Operations Division","Operations management","","","",""
 */
export async function importOrganizationalCSV(
  csvData: CSVImportRow[],
  userId: number
): Promise<ImportResult> {
  const db = await getDb();
  if (!db) {
    return {
      success: false,
      message: "Database not available"
    };
  }

  const errors: string[] = [];
  const stats = {
    companiesCreated: 0,
    divisionsCreated: 0,
    departmentsCreated: 0,
    teamsCreated: 0
  };

  try {
    // Track created entities to avoid duplicates
    const companyMap = new Map<string, number>(); // name -> id
    const divisionMap = new Map<string, number>(); // companyName:divisionName -> id
    const departmentMap = new Map<string, number>(); // divisionKey:departmentName -> id

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      const rowNum = i + 2; // +2 for header and 1-indexed

      // Validate required fields
      if (!row.companyName || row.companyName.trim() === "") {
        errors.push(`Row ${rowNum}: Company name is required`);
        continue;
      }

      // Create or get company
      let companyId: number | undefined = companyMap.get(row.companyName);
      if (!companyId) {
        const result: any = await db.insert(companies).values({
          name: row.companyName.trim(),
          address: row.companyAddress?.trim() || null,
          phone: row.companyPhone?.trim() || null,
          email: row.companyEmail?.trim() || null,
          createdBy: userId,
          updatedBy: userId
        });
        companyId = result[0].insertId;
        stats.companiesCreated++;
        if (companyId) {
          companyMap.set(row.companyName, companyId);
        }
      }

      if (!companyId) {
        errors.push(`Row ${rowNum}: Failed to create or find company`);
        continue;
      }

      // Create division if specified
      if (row.divisionName && row.divisionName.trim() !== "") {
        const divisionKey = `${row.companyName}:${row.divisionName}`;
        let divisionId: number | undefined = divisionMap.get(divisionKey);
        
        if (!divisionId) {
          // Generate unique code
          const codeResult: any = await db.execute(
            sql`SELECT MAX(CAST(SUBSTRING(code, 5) AS UNSIGNED)) as maxNum FROM divisions WHERE code LIKE 'DIV-%'`
          );
          const maxNum = codeResult[0]?.[0]?.maxNum || 0;
          const code = `DIV-${String(maxNum + 1).padStart(3, '0')}`;

          const result: any = await db.insert(divisions).values({
            companyId,
            code,
            name: row.divisionName.trim(),
            description: row.divisionDescription?.trim() || '',
            createdBy: userId,
            updatedBy: userId
          });
          divisionId = result[0].insertId;
          stats.divisionsCreated++;
          if (divisionId) {
            divisionMap.set(divisionKey, divisionId);
          }
        }

        if (!divisionId) {
          errors.push(`Row ${rowNum}: Failed to create or find division`);
          continue;
        }

        // Create department if specified
        if (row.departmentName && row.departmentName.trim() !== "") {
          const departmentKey = `${divisionKey}:${row.departmentName}`;
          let departmentId: number | undefined = departmentMap.get(departmentKey);
          
          if (!departmentId) {
            // Generate unique code
            const codeResult: any = await db.execute(
              sql`SELECT MAX(CAST(SUBSTRING(code, 6) AS UNSIGNED)) as maxNum FROM departments WHERE code LIKE 'DEPT-%'`
            );
            const maxNum = codeResult[0]?.[0]?.maxNum || 0;
            const code = `DEPT-${String(maxNum + 1).padStart(3, '0')}`;

            const result: any = await db.insert(departments).values({
              divisionId,
              code,
              name: row.departmentName.trim(),
              description: row.departmentDescription?.trim() || '',
              createdBy: userId,
              updatedBy: userId
            });
            departmentId = result[0].insertId;
            stats.departmentsCreated++;
            if (departmentId) {
              departmentMap.set(departmentKey, departmentId);
            }
          }

          if (!departmentId) {
            errors.push(`Row ${rowNum}: Failed to create or find department`);
            continue;
          }

          // Create company team if specified
          if (row.teamName && row.teamName.trim() !== "") {
            // Generate unique code
            const codeResult: any = await db.execute(
              sql`SELECT MAX(CAST(SUBSTRING(code, 7) AS UNSIGNED)) as maxNum FROM companyTeams WHERE code LIKE 'CTEAM-%'`
            );
            const maxNum = codeResult[0]?.[0]?.maxNum || 0;
            const code = `CTEAM-${String(maxNum + 1).padStart(3, '0')}`;

            await db.insert(companyTeams).values({
              departmentId,
              code,
              name: row.teamName.trim(),
              description: row.teamDescription?.trim() || '',
              createdBy: userId,
              updatedBy: userId
            });
            stats.teamsCreated++;
          }
        }
      }
    }

    return {
      success: true,
      message: `Import completed successfully. Created ${stats.companiesCreated} companies, ${stats.divisionsCreated} divisions, ${stats.departmentsCreated} departments, and ${stats.teamsCreated} teams.`,
      stats,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error: any) {
    console.error("CSV import error:", error);
    return {
      success: false,
      message: `Import failed: ${error.message}`,
      errors
    };
  }
}

/**
 * Parse CSV text into structured data
 */
export function parseCSV(csvText: string): CSVImportRow[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error("CSV file must contain a header row and at least one data row");
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows: CSVImportRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: any = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    rows.push(row as CSVImportRow);
  }

  return rows;
}
