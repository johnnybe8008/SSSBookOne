import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { Staff } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { validateSessionToken } from "../session-manager";
import { COOKIE_NAME } from "../../shared/const.js";

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
    } catch (_error) {
      // If OAuth fails, try custom session token (for email/password users)
      // Check Authorization header first (for native apps)
      const authHeader = opts.req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        user = await validateSessionToken(token);
      }
      // Debug log: print cookies and session token
      if (!user && opts.req.cookies) {
        const sessionToken =
          opts.req.cookies["session_token"] ||
          opts.req.cookies[COOKIE_NAME] ||
          opts.req.cookies["app_session_id"];
        if (sessionToken) {
          user = await validateSessionToken(sessionToken);
        }
      }
      // If no user is found, return unauthenticated context and let protectedProcedure handle it.
    }
  }

  // Fetch staff role if user is authenticated
  let staffRole: "admin" | "counselor" | "viewer" | null = null;
  if (user) {
    try {
      const { getStaffById } = await import("../db");
      const staff = await getStaffById(user.id);
      staffRole = (staff as any)?.role || null;
    } catch (_error) {
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
