import { getDb } from "./db";
import { 
  companies, 
  divisions, 
  departments, 
  companyTeams,
  teams,
  groups,
  clients,
  fsms,
  sessions,
  cases,
  staff,
  notifications
} from "../drizzle/schema";
import { sql } from "drizzle-orm";

/**
 * Reset Database - Clear all data except admin user
 * 
 * This function deletes all records from all tables except:
 * - The admin user (isAdmin = true)
 * 
 * Use with caution! This is irreversible.
 */
export async function resetDatabase(adminUserId: number): Promise<{ success: boolean; message: string }> {
  const db = await getDb();
  if (!db) {
    return {
      success: false,
      message: "Database not available"
    };
  }

  try {
    // Delete in correct order to respect foreign key constraints
    await db.delete(notifications);
    await db.delete(sessions);
    await db.delete(cases);
    await db.delete(clients);
    await db.delete(fsms);
    await db.delete(companyTeams);
    await db.delete(departments);
    await db.delete(divisions);
    await db.delete(companies);
    await db.delete(teams);
    await db.delete(groups);
    
    // Delete all staff except admin users
    await db.delete(staff).where(sql`role != 'admin'`);
    
    return {
      success: true,
      message: "Database reset successfully. All data cleared except admin users."
    };
  } catch (error: any) {
    console.error("Database reset error:", error);
    return {
      success: false,
      message: `Failed to reset database: ${error.message}`
    };
  }
}
