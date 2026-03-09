import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { Staff } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { validateSessionToken } from "../session-manager";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: Staff | null;
  staffRole: "admin" | "counselor" | "viewer" | null;
};

export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  let user: Staff | null = null;

  // Only skip session validation for login route
  const isLoginRoute = opts.req.url?.includes('/auth.login');
  if (!isLoginRoute) {
    try {
      // First try Manus OAuth authentication (for OAuth users)
      user = await sdk.authenticateRequest(opts.req);
      console.log('[DEBUG] Authenticated via OAuth (sdk.authenticateRequest)');
    } catch (error) {
      console.log('[DEBUG] OAuth authentication failed, falling back to custom session token:', error);
      // Print all cookies received for every request
      console.log('[DEBUG][CONTEXT] All cookies received:', opts.req.cookies);
      // If OAuth fails, try custom session token (for email/password users)
      // Check Authorization header first (for native apps)
      const authHeader = opts.req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        console.log('[DEBUG] Trying validateSessionToken with Authorization header:', token);
        user = await validateSessionToken(token);
        console.log('[DEBUG] validateSessionToken (Authorization header):', token, user);
      }
      // Debug log: print cookies and session token
      if (!user && opts.req.cookies) {
        const sessionToken = opts.req.cookies['session_token'];
        console.log('[DEBUG][CONTEXT] Session token from cookie:', sessionToken);
        if (sessionToken) {
          user = await validateSessionToken(sessionToken);
          console.log('[DEBUG][CONTEXT] validateSessionToken (cookie):', sessionToken, user);
        }
      }
      // If no user and no session token, force login
      if (!user) {
        // Custom error for frontend to detect and redirect
        throw Object.assign(new Error('Session expired. Please log in again.'), { code: 'SESSION_EXPIRED' });
      }
    }
  }

  // Fetch staff role if user is authenticated
  let staffRole: "admin" | "counselor" | "viewer" | null = null;
  if (user) {
    try {
      const { getStaffById } = await import("../db");
      const staff = await getStaffById(user.id);
      staffRole = (staff as any)?.role || null;
      console.log('[DEBUG] Staff record:', staff);
      console.log('[DEBUG] Staff role:', staffRole);
    } catch (error) {
      // Staff record not found, leave role as null
      console.log('[DEBUG] Staff record not found for user:', user);
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    staffRole,
  };
}
