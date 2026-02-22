// import { createDefaultAdmin } from "./auth";

/**
 * Server initialization tasks
 * Run once when the server starts
 */
export async function initializeServer() {
  console.log("[Server] Running initialization tasks...");
  
  try {
    // Create default admin user if it doesn't exist
    // await createDefaultAdmin();
    console.log("[Server] Initialization complete");
  } catch (error) {
    console.error("[Server] Initialization failed:", error);
  }
}
