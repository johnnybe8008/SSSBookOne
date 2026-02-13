/**
 * SQL Seed Data Runner
 * Executes the seed-data.sql file to populate the database
 */

import { getDb } from "../server/db";
import * as fs from "fs";
import * as path from "path";

async function runSeedSQL() {
  console.log("🌱 Starting SQL data seeding...\n");

  const db = await getDb();
  if (!db) {
    throw new Error("Database not available. Please check your DATABASE_URL environment variable.");
  }

  try {
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, "seed-data-clean.sql");
    const sqlContent = fs.readFileSync(sqlFilePath, "utf-8");

    // Remove comments and split by semicolons
    const cleanedSQL = sqlContent
      .split("\n")
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n");

    // Split by semicolons to get individual statements
    const statements = cleanedSQL
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (stmt) {
        try {
          await db.execute(stmt);
          
          // Log progress for major operations
          if (stmt.toUpperCase().includes("INSERT INTO")) {
            const tableName = stmt.match(/INSERT INTO (\w+)/i)?.[1];
            console.log(`✅ Inserted data into ${tableName}`);
          }
        } catch (error: any) {
          // Ignore duplicate key errors (in case data already exists)
          if (error.code === "ER_DUP_ENTRY") {
            console.log(`⚠️  Skipping duplicate entry`);
          } else {
            console.error(`❌ Error executing statement ${i + 1}:`, error.message);
            console.error(`Statement: ${stmt.substring(0, 100)}...`);
          }
        }
      }
    }

    console.log("\n✨ Data seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log("   - 3 Companies (Tech Solutions, Healthcare Partners, Education First)");
    console.log("   - 6 Divisions (2 per company)");
    console.log("   - 12 Departments (2 per division)");
    console.log("   - 12 Company Teams (1 per department)");
    console.log("   - 12 Staff members (1 per team)");
    console.log("   - 15 Clients across 5 departments:");
    console.log("     • 6 Mental Health clients");
    console.log("     • 3 Primary Care clients");
    console.log("     • 2 Patient Services clients");
    console.log("     • 2 Tech Solutions clients");
    console.log("     • 2 Education clients");
    console.log("   - 15 Cases (1 per client)");
    console.log("   - 45 Sessions total:");
    console.log("     • 24 Mental Health sessions");
    console.log("     • 9 Primary Care sessions");
    console.log("     • 4 Patient Services sessions");
    console.log("     • 6 Tech Solutions sessions");
    console.log("     • 2 Education sessions");
    console.log("\n🎉 Your database is now populated with sample data!");
    console.log("   You can now view the Reports & Analytics dashboard with real data.");

  } catch (error) {
    console.error("❌ Error seeding data:", error);
    throw error;
  }
}

// Run the seeding function
runSeedSQL()
  .then(() => {
    console.log("\n✅ Seeding script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Seeding script failed:", error);
    process.exit(1);
  });
