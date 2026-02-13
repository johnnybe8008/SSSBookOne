import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { validateSession } from "../session-manager";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
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
      user = await validateSession(token);
    }
    
    // If no Authorization header, check for session token in cookies (for web)
    if (!user && opts.req.cookies) {
      const sessionToken = opts.req.cookies['session_token'];
      if (sessionToken) {
        user = await validateSession(sessionToken);
      }
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
