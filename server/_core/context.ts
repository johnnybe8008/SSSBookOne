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
    const authHeader = opts.req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      user = await validateSession(token);
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
