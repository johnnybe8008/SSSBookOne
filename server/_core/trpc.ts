import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from "../../shared/const.js";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);

// Middleware to check if user can write (admin or counselor, not viewer)
const requireWriteAccess = t.middleware(async (opts) => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  if (ctx.staffRole === "viewer") {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: "Viewers do not have permission to create or edit data" 
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      staffRole: ctx.staffRole,
    },
  });
});

// Middleware to check if user is admin or counselor (blocks viewers)
export const writeAccessProcedure = t.procedure.use(requireUser).use(requireWriteAccess);

// Middleware to check if user is admin only (blocks counselors and viewers)
const requireAdminRole = t.middleware(async (opts) => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  if (ctx.staffRole !== "admin") {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: "Only administrators can perform this action" 
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      staffRole: ctx.staffRole,
    },
  });
});

export const adminOnlyProcedure = t.procedure.use(requireUser).use(requireAdminRole);
