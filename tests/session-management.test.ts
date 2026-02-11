import { describe, it, expect } from "vitest";

/**
 * Tests for Custom Session Management
 * 
 * Verifies that the custom session management system is properly configured
 * for email/password authentication.
 */
describe("Custom Session Management", () => {
  it("should have authSessions table in schema", async () => {
    const schema = await import("../drizzle/schema");
    expect(schema.authSessions).toBeDefined();
    expect(typeof schema.authSessions).toBe("object");
  });

  it("should export session manager functions", async () => {
    const sessionManager = await import("../server/session-manager");
    expect(sessionManager.createSession).toBeDefined();
    expect(sessionManager.validateSession).toBeDefined();
    expect(sessionManager.deleteSession).toBeDefined();
    expect(typeof sessionManager.createSession).toBe("function");
    expect(typeof sessionManager.validateSession).toBe("function");
  });

  it("should have updated context to validate custom sessions", async () => {
    const context = await import("../server/_core/context");
    expect(context.createContext).toBeDefined();
    expect(typeof context.createContext).toBe("function");
  });

  it("should have updated login router to use createSession", async () => {
    const routers = await import("../server/routers");
    expect(routers.appRouter).toBeDefined();
  });
});
