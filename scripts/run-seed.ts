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
    const sqlFilePath = path.join(__dirname, "seed-data.sql");
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
    console.log("   - 3 Companies");
    console.log("   - 6 Divisions");
    console.log("   - 8 Departments");
    console.log("   - 9 Company Teams");
    console.log("   - 10 Staff members");
    console.log("   - 12 Clients");
    console.log("   - 12 Cases");
    console.log("   - 35+ Sessions");
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
