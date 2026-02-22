import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { validateSessionToken } from "../session-manager";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  staffRole: "admin" | "counselor" | "viewer" | null;
};

export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // First try Manus OAuth authentication (for OAuth users)
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // If OAuth fails, try custom session token (for email/password users)
    // Check Authorization header first (for native apps)
    const authHeader = opts.req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      user = await validateSessionToken(token);
    }
    // Debug log: print cookies and session token
    console.log('[DEBUG] Incoming cookies:', opts.req.cookies);
    if (!user && opts.req.cookies) {
      const sessionToken = opts.req.cookies['session_token'];
      console.log('[DEBUG] Session token from cookie:', sessionToken);
      if (sessionToken) {
        user = await validateSessionToken(sessionToken);
        console.log('[DEBUG] Session lookup result:', user);
      }
    }
  }

  // Fetch staff role if user is authenticated
  let staffRole: "admin" | "counselor" | "viewer" | null = null;
  if (user) {
    try {
      const { getStaffByUserId } = await import("../db");
      const staff = await getStaffByUserId(user.id);
      staffRole = (staff as any)?.role || null;
    } catch (error) {
      // Staff record not found, leave role as null
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    staffRole,
  };
}
