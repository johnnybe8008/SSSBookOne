export async function authenticateStaff(email: string, password: string) {
  const db = await getDb();
  if (!db) return null;
  // Find staff by email
  const [staffRecord] = await db.select().from(staff).where(eq(staff.email, email)).limit(1);
  if (!staffRecord) {
    return null;
  }
  // Verify password
  if (!staffRecord.passwordHash) {
    return null;
  }
  const isValid = await verifyPassword(password, staffRecord.passwordHash);
  if (!isValid) {
    return null;
  }
  // Update last signed in
  await db.update(staff).set({ lastSignedIn: new Date() }).where(eq(staff.id, staffRecord.id));
  return staffRecord;
}

export async function changePassword(staffId: number, newPassword: string) {
  // TODO: Implement real password change logic
  return true;
}
import bcrypt from "bcryptjs";
import { getDb } from "./db";
import { staff, groups, teams } from "../drizzle/schema";
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
