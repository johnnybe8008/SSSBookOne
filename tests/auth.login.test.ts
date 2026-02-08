import { describe, expect, it, beforeAll } from "vitest";
import { createDefaultAdmin, authenticateUser } from "../server/auth";

describe("Email/Password Authentication", () => {
  beforeAll(async () => {
    // Ensure default admin exists
    await createDefaultAdmin();
  });

  it("creates default admin user", async () => {
    const admin = await createDefaultAdmin();
    expect(admin).toBeDefined();
    expect(admin?.email).toBe("admin@dohbookone.com");
    expect(admin?.role).toBe("admin");
  });

  it("authenticates with correct credentials", async () => {
    const user = await authenticateUser("admin@dohbookone.com", "password");
    expect(user).toBeDefined();
    expect(user?.email).toBe("admin@dohbookone.com");
    expect(user?.role).toBe("admin");
  });

  it("rejects incorrect password", async () => {
    const user = await authenticateUser("admin@dohbookone.com", "wrongpassword");
    expect(user).toBeNull();
  });

  it("rejects non-existent email", async () => {
    const user = await authenticateUser("nonexistent@example.com", "password");
    expect(user).toBeNull();
  });
});
