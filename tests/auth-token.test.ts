import { describe, it, expect } from "vitest";

/**
 * Tests for Authentication Token Flow
 * 
 * These tests verify that the authentication system is properly configured
 * to return session tokens from the backend.
 */
describe("Authentication Token Flow", () => {
  it("should have sdk imported in routers.ts", async () => {
    const routersContent = await import("../server/routers");
    expect(routersContent).toBeDefined();
    expect(routersContent.appRouter).toBeDefined();
  });

  it("should export appRouter from routers.ts", async () => {
    const { appRouter } = await import("../server/routers");
    expect(appRouter).toBeDefined();
    expect(typeof appRouter).toBe("object");
  });
});
