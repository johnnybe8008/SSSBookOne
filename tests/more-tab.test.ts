import { describe, it, expect } from "vitest";
import appConfig from "../app.config";

/**
 * Tests for More Tab functionality
 * 
 * These tests verify:
 * 1. Version number is correctly set in app.config.ts
 * 2. App configuration is valid
 */
describe("More Tab Configuration", () => {
  it("should have version 1.0.8 in app config", () => {
    expect(appConfig.version).toBe("1.0.8");
  });

  it("should have correct app name", () => {
    expect(appConfig.name).toBe("DoH Book One");
  });

  it("should have correct app slug", () => {
    expect(appConfig.slug).toBe("doh-book-one");
  });
});
