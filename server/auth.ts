import bcrypt from "bcryptjs";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Email/Password Authentication Helpers
 */

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function authenticateUser(email: string, password: string) {
  const db = await getDb();
  if (!db) return null;
  
  // Find user by email
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user) {
    return null;
  }

  // Verify password
  if (!user.passwordHash) {
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  // Update last signed in
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));

  return user;
}

export async function createDefaultAdmin() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if default admin already exists
  const [existingAdmin] = await db
    .select()
    .from(users)
    .where(eq(users.email, "admin@dohbookone.com"))
    .limit(1);

  if (existingAdmin) {
    console.log("Default admin user already exists");
    return existingAdmin;
  }

  // Create default admin user
  const passwordHash = await hashPassword("password");
  
  const result = await db.insert(users).values({
    email: "admin@dohbookone.com",
    name: "Admin",
    passwordHash,
    loginMethod: "email",
    role: "admin",
    openId: null,
  });

  const insertId = (result as any).insertId;
  
  console.log("Default admin user created: admin@dohbookone.com / password");
  
  // Return the created user
  const [newAdmin] = await db.select().from(users).where(eq(users.id, insertId)).limit(1);
  return newAdmin;
}

export async function changePassword(userId: number, newPassword: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const passwordHash = await hashPassword(newPassword);
  await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
}
