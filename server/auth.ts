import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { staff } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Email/password authentication helpers.
 */

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function authenticateStaff(email: string, password: string) {
  const db = await getDb();
  const normalizedEmail = email.trim().toLowerCase();
  const [staffRecord] = await db.select().from(staff).where(eq(staff.email, normalizedEmail)).limit(1);

  if (!staffRecord?.passwordHash) {
    return null;
  }

  const isValid = await verifyPassword(password, staffRecord.passwordHash);
  if (!isValid) {
    return null;
  }

  await db.update(staff).set({ lastSignedIn: new Date() }).where(eq(staff.id, staffRecord.id));
  return staffRecord;
}

export async function authenticateUser(email: string, password: string) {
  return authenticateStaff(email, password);
}

export async function createDefaultAdmin() {
  const db = await getDb();
  const adminEmail = "admin@dohbookone.com";
  const [existingAdmin] = await db.select().from(staff).where(eq(staff.email, adminEmail)).limit(1);

  if (existingAdmin) {
    return existingAdmin;
  }

  const passwordHash = await hashPassword("password");
  const [result] = await db.insert(staff).values({
    name: "Default Admin",
    email: adminEmail,
    passwordHash,
    role: "admin",
    notificationPreference: "sms",
    notificationOptOut: 0,
    isVipRated: 0,
    isAdmin: 1,
    mustChangePassword: 0,
    createdBy: 1,
    updatedBy: 1,
  });

  const [createdAdmin] = await db.select().from(staff).where(eq(staff.id, Number(result.insertId))).limit(1);
  return createdAdmin ?? null;
}

export async function changePassword(
  staffId: number,
  currentPasswordOrNewPassword: string,
  maybeNewPassword?: string,
) {
  const db = await getDb();
  const [staffRecord] = await db.select().from(staff).where(eq(staff.id, staffId)).limit(1);

  if (!staffRecord) {
    throw new Error("Staff account not found");
  }

  const newPassword = maybeNewPassword ?? currentPasswordOrNewPassword;
  if (maybeNewPassword && staffRecord.passwordHash) {
    const valid = await verifyPassword(currentPasswordOrNewPassword, staffRecord.passwordHash);
    if (!valid) {
      throw new Error("Current password is incorrect");
    }
  }

  await db
    .update(staff)
    .set({
      passwordHash: await hashPassword(newPassword),
      mustChangePassword: 0,
      updatedAt: new Date(),
      updatedBy: staffId,
    })
    .where(eq(staff.id, staffId));

  return true;
}
