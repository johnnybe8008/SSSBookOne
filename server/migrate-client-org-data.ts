import { getDb } from "./db";
import { clients, departments, divisions } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Migrate existing clients to populate companyId and divisionId
 * based on their departmentId
 */
async function migrateClientOrganizationalData() {
  const db = await getDb();
  if (!db) {
    console.error("Database connection failed");
    process.exit(1);
  }

  console.log("[Migration] Starting client organizational data migration...");

  try {
    // Get all clients
    const allClients = await db.select().from(clients);
    console.log(`[Migration] Found ${allClients.length} clients to process`);

    let updated = 0;
    let skipped = 0;

    for (const client of allClients) {
      // Skip if already has organizational data
      if (client.companyId && client.divisionId) {
        skipped++;
        continue;
      }

      // Get department
      const dept = await db.select().from(departments).where(eq(departments.id, client.departmentId)).limit(1);
      if (!dept || dept.length === 0) {
        console.warn(`[Migration] Client ${client.id} has invalid departmentId ${client.departmentId}`);
        skipped++;
        continue;
      }

      // Get division
      const div = await db.select().from(divisions).where(eq(divisions.id, dept[0].divisionId)).limit(1);
      if (!div || div.length === 0) {
        console.warn(`[Migration] Department ${dept[0].id} has invalid divisionId ${dept[0].divisionId}`);
        skipped++;
        continue;
      }

      // Update client with organizational data
      await db.update(clients)
        .set({
          companyId: div[0].companyId,
          divisionId: dept[0].divisionId,
        })
        .where(eq(clients.id, client.id));

      updated++;
      if (updated % 10 === 0) {
        console.log(`[Migration] Progress: ${updated} clients updated`);
      }
    }

    console.log(`[Migration] Complete! Updated ${updated} clients, skipped ${skipped}`);
    process.exit(0);
  } catch (error) {
    console.error("[Migration] Error:", error);
    process.exit(1);
  }
}

migrateClientOrganizationalData();
