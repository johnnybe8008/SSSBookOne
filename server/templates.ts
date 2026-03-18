import { eq } from "drizzle-orm";
import { coDepartments, companyTeams, companyTemplates } from "../drizzle/schema";
import { getDb } from "./db";

export interface TemplateStructure {
  departments: Array<{
    name: string;
    teams: Array<{
      name: string;
    }>;
  }>;
}

export async function saveCompanyAsTemplate(
  companyId: number,
  templateName: string,
  _templateDescription: string,
  staffId: number,
): Promise<{ success: boolean; message: string; templateId?: number }> {
  const db = await getDb();

  try {
    const companyDepartments = await db.select().from(coDepartments).where(eq(coDepartments.companyId, companyId));
    const templateStructure: TemplateStructure = { departments: [] };

    for (const department of companyDepartments) {
      const departmentTeams = await db
        .select()
        .from(companyTeams)
        .where(eq(companyTeams.coDepartmentId, department.id));

      templateStructure.departments.push({
        name: department.name,
        teams: departmentTeams.map((team) => ({
          name: team.name,
        })),
      });
    }

    const [result] = await db.insert(companyTemplates).values({
      name: templateName,
      templateData: templateStructure,
      createdBy: staffId,
    });

    return {
      success: true,
      message: "Template saved successfully",
      templateId: Number(result.insertId),
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to save template: ${error.message}`,
    };
  }
}

export async function applyTemplateToCompany(
  templateId: number,
  companyId: number,
  staffId: number,
): Promise<{ success: boolean; message: string; stats?: { departmentsCreated: number; teamsCreated: number } }> {
  const db = await getDb();

  try {
    const templates = await db.select().from(companyTemplates).where(eq(companyTemplates.id, templateId));
    const template = templates[0];

    if (!template) {
      return { success: false, message: "Template not found" };
    }

    const structure = template.templateData as TemplateStructure;
    const stats = { departmentsCreated: 0, teamsCreated: 0 };

    for (const departmentData of structure.departments ?? []) {
      const [departmentResult] = await db.insert(coDepartments).values({
        companyId,
        name: departmentData.name,
        createdBy: staffId,
        updatedBy: staffId,
      });

      const departmentId = Number(departmentResult.insertId);
      stats.departmentsCreated += 1;

      for (const teamData of departmentData.teams ?? []) {
        await db.insert(companyTeams).values({
          companyId,
          coDepartmentId: departmentId,
          name: teamData.name,
          createdBy: staffId,
          updatedBy: staffId,
        });
        stats.teamsCreated += 1;
      }
    }

    return {
      success: true,
      message: `Template applied successfully. Created ${stats.departmentsCreated} departments and ${stats.teamsCreated} teams.`,
      stats,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to apply template: ${error.message}`,
    };
  }
}

export async function getAllTemplates() {
  const db = await getDb();
  return db.select().from(companyTemplates);
}

export async function deleteTemplate(templateId: number): Promise<{ success: boolean; message: string }> {
  const db = await getDb();

  try {
    await db.delete(companyTemplates).where(eq(companyTemplates.id, templateId));
    return { success: true, message: "Template deleted successfully" };
  } catch (error: any) {
    return { success: false, message: `Failed to delete template: ${error.message}` };
  }
}

export async function renameTemplate(
  templateId: number,
  newName: string,
  _newDescription?: string,
): Promise<{ success: boolean; message: string }> {
  const db = await getDb();

  try {
    await db.update(companyTemplates).set({ name: newName }).where(eq(companyTemplates.id, templateId));
    return { success: true, message: "Template renamed successfully" };
  } catch (error: any) {
    return { success: false, message: `Failed to rename template: ${error.message}` };
  }
}
