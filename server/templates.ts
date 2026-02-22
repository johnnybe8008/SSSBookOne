import { getDb } from "./db";
import { 
  companies,
  divisions, 
  departments, 
  companyTeams,
  companyTemplates,
  type InsertCompanyTemplate
} from "../drizzle/schema";
import { eq, sql } from "drizzle-orm";

export interface TemplateStructure {
  divisions: Array<{
    name: string;
    description: string;
    departments: Array<{
      name: string;
      description: string;
      teams: Array<{
        name: string;
        description: string;
      }>;
    }>;
  }>;
}

/**
 * Save a company's organizational structure as a template
 */
export async function saveCompanyAsTemplate(
  companyId: number,
  templateName: string,
  templateDescription: string,
  staffId: number
): Promise<{ success: boolean; message: string; templateId?: number }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "Database not available" };
  }

  try {
    // Fetch all divisions for this company
    const companyDivisions: any[] = await db.select().from(divisions).where(eq(divisions.companyId, companyId));
    
    const templateStructure: TemplateStructure = {
      divisions: []
    };

    // For each division, fetch departments and teams
    for (const division of companyDivisions) {
      const divisionDepartments: any[] = await db.select().from(departments).where(eq(departments.divisionId, division.id));
      
      const divisionData: any = {
        name: division.name,
        description: division.description || '',
        departments: []
      };

      for (const department of divisionDepartments) {
        const departmentTeams: any[] = await db.select().from(companyTeams).where(eq(companyTeams.departmentId, department.id));
        
        divisionData.departments.push({
          name: department.name,
          description: department.description || '',
          teams: departmentTeams.map(team => ({
            name: team.name,
            description: team.description || ''
          }))
        });
      }

      templateStructure.divisions.push(divisionData);
    }

    // Save template
    const result: any = await db.insert(companyTemplates).values({
      name: templateName,
      description: templateDescription || null,
      templateData: templateStructure as any,
      createdBy: staffId
    });

    return {
      success: true,
      message: "Template saved successfully",
      templateId: result[0].insertId
    };
  } catch (error: any) {
    console.error("Save template error:", error);
    return {
      success: false,
      message: `Failed to save template: ${error.message}`
    };
  }
}

/**
 * Apply a template to a company
 */
export async function applyTemplateToCompany(
  templateId: number,
  companyId: number,
  staffId: number
): Promise<{ success: boolean; message: string; stats?: any }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "Database not available" };
  }

  try {
    // Fetch template
    const templates: any[] = await db.select().from(companyTemplates).where(eq(companyTemplates.id, templateId));
    if (templates.length === 0) {
      return { success: false, message: "Template not found" };
    }

    const template = templates[0];
    const structure: TemplateStructure = template.templateData;

    const stats = {
      divisionsCreated: 0,
      departmentsCreated: 0,
      teamsCreated: 0
    };

    // Apply structure to company
    for (const divisionData of structure.divisions) {
      // Generate division code
      const codeResult: any = await db.execute(
        sql`SELECT MAX(CAST(SUBSTRING(code, 5) AS UNSIGNED)) as maxNum FROM divisions WHERE code LIKE 'DIV-%'`
      );
      const maxNum = codeResult[0]?.[0]?.maxNum || 0;
      const divisionCode = `DIV-${String(maxNum + 1 + stats.divisionsCreated).padStart(3, '0')}`;

      const divisionResult: any = await db.insert(divisions).values({
        companyId,
        code: divisionCode,
        name: divisionData.name,
        description: divisionData.description,
        createdBy: staffId,
        updatedBy: staffId
      });
      const divisionId = divisionResult[0].insertId;
      stats.divisionsCreated++;

      // Create departments
      for (const departmentData of divisionData.departments) {
        const deptCodeResult: any = await db.execute(
          sql`SELECT MAX(CAST(SUBSTRING(code, 6) AS UNSIGNED)) as maxNum FROM departments WHERE code LIKE 'DEPT-%'`
        );
        const deptMaxNum = deptCodeResult[0]?.[0]?.maxNum || 0;
        const departmentCode = `DEPT-${String(deptMaxNum + 1 + stats.departmentsCreated).padStart(3, '0')}`;

        const departmentResult: any = await db.insert(departments).values({
          divisionId,
          code: departmentCode,
          name: departmentData.name,
          description: departmentData.description,
          createdBy: staffId,
          updatedBy: staffId
        });
        const departmentId = departmentResult[0].insertId;
        stats.departmentsCreated++;

        // Create teams
        for (const teamData of departmentData.teams) {
          const teamCodeResult: any = await db.execute(
            sql`SELECT MAX(CAST(SUBSTRING(code, 7) AS UNSIGNED)) as maxNum FROM companyTeams WHERE code LIKE 'CTEAM-%'`
          );
          const teamMaxNum = teamCodeResult[0]?.[0]?.maxNum || 0;
          const teamCode = `CTEAM-${String(teamMaxNum + 1 + stats.teamsCreated).padStart(3, '0')}`;

          await db.insert(companyTeams).values({
            departmentId,
            code: teamCode,
            name: teamData.name,
            description: teamData.description,
            createdBy: staffId,
            updatedBy: staffId
          });
          stats.teamsCreated++;
        }
      }
    }

    return {
      success: true,
      message: `Template applied successfully. Created ${stats.divisionsCreated} divisions, ${stats.departmentsCreated} departments, and ${stats.teamsCreated} teams.`,
      stats
    };
  } catch (error: any) {
    console.error("Apply template error:", error);
    return {
      success: false,
      message: `Failed to apply template: ${error.message}`
    };
  }
}

/**
 * Get all templates
 */
export async function getAllTemplates() {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const templates = await db.select().from(companyTemplates);
    return templates;
  } catch (error) {
    console.error("Get templates error:", error);
    return [];
  }
}

/**
 * Delete a template
 */
export async function deleteTemplate(templateId: number): Promise<{ success: boolean; message: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "Database not available" };
  }

  try {
    await db.delete(companyTemplates).where(eq(companyTemplates.id, templateId));
    return {
      success: true,
      message: "Template deleted successfully"
    };
  } catch (error: any) {
    console.error("Delete template error:", error);
    return {
      success: false,
      message: `Failed to delete template: ${error.message}`
    };
  }
}

/**
 * Rename a template
 */
export async function renameTemplate(
  templateId: number,
  newName: string,
  newDescription?: string
): Promise<{ success: boolean; message: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "Database not available" };
  }

  try {
    await db.update(companyTemplates)
      .set({ 
        name: newName,
        description: newDescription || null
      })
      .where(eq(companyTemplates.id, templateId));
    
    return {
      success: true,
      message: "Template renamed successfully"
    };
  } catch (error: any) {
    console.error("Rename template error:", error);
    return {
      success: false,
      message: `Failed to rename template: ${error.message}`
    };
  }
}
