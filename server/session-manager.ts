// ...existing code...
import crypto from "crypto";
import { getDb } from "./db";
import { authSessions, staff } from "../drizzle/schema";
import { eq, and, gt, lt } from "drizzle-orm";

/**
 * Session Management for Email/Password Authentication
 * 
 * This module handles custom session tokens for email/password staff,
 * separate from Manus OAuth tokens.
 */

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

/**
 * Create a new session token for a staff
 */
export async function createSession(staffId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Generate a secure random token
  const token = crypto.randomBytes(32).toString("base64url");
  // Set expiration to 1 year from now
  const expiresAt = new Date(Date.now() + ONE_YEAR_MS);
  // Store in database (staffId)
  await db.insert(authSessions).values({
    staffId,
    token,
    expiresAt,
  });
  return token;
}

/**
 * Validate a session token and return the associated staff
 */
export async function validateSessionToken(token: string): Promise<any> {
  const db = await getDb();
  if (!db) {
    console.error('[validateSessionToken] getDb() returned null');
    return null;
  }
  // Find session that matches token and hasn't expired
  const now = new Date();
  const [session] = await db
    .select()
    .from(authSessions)
    .where(
      and(
        eq(authSessions.token, token),
        gt(authSessions.expiresAt, now)
      )
    )
    .limit(1);
  if (!session) {
    console.error(`[validateSessionToken] No valid session found for token: ${token}`);
    return null;
  }
  // Get the associated staff (use staffId)
  const [staffRecord] = await db
    .select()
    .from(staff)
    .where(eq(staff.id, session.staffId))
    .limit(1);
  if (!staffRecord) {
    console.error(`[validateSessionToken] No staff found for session.staffId: ${session.staffId}`);
  }
  return staffRecord || null;
}

/**
 * Delete a session (logout)
 */
export async function deleteSession(token: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.delete(authSessions).where(eq(authSessions.token, token));
}

/**
 * Delete all sessions for a staff
 */
export async function deleteAllSessionsForStaff(staffId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(authSessions).where(eq(authSessions.staffId, staffId));
}

/**
 * Clean up expired sessions (should be run periodically)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const now = new Date();
  const result = await db
    .delete(authSessions)
    .where(lt(authSessions.expiresAt, now));

  return (result as any).affectedRows || 0;
}
