import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router, writeAccessProcedure, adminOnlyProcedure } from "./_core/trpc";
import * as db from "./db";
import { authenticateStaff, changePassword, completeForcedPasswordReset, getStaffByEmail, hashPassword } from "./auth";
import { createSession } from "./session-manager";
import { processPendingNotifications, sendDirectNotification } from "./notification-dispatcher";
import { resetDatabase } from "./reset-database";
import { previewResetDatabase } from "./reset-database";
// import { importOrganizationalCSV, parseCSV } from "./csv-import";
// import { importClientsFromCSV, parseClientCSV } from "./csv-import-clients";
import { saveCompanyAsTemplate, applyTemplateToCompany, getAllTemplates, deleteTemplate, renameTemplate } from "./templates";

async function syncSessionNotifications(session: {
  id: number;
  staffId: number;
  clientId: number;
  scheduledDate?: Date | string | null;
}) {
  await db.deletePendingNotificationsBySessionId(session.id);

  if (!session.scheduledDate) {
    return;
  }

  const scheduledAt = new Date(session.scheduledDate);
  if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() <= Date.now()) {
    return;
  }

  const staffRecord = await db.getStaffById(session.staffId);
  const clientRecord = await db.getClientById(session.clientId);

  if (staffRecord && !staffRecord.notificationOptOut && staffRecord.notificationPreference && staffRecord.mobilePhone) {
    await db.createNotification({
      sessionId: session.id,
      recipientType: "staff",
      recipientId: staffRecord.id,
      notificationType: staffRecord.notificationPreference,
      notificationTime: "1_hour",
      status: "pending",
    });
  }

  if (clientRecord && !clientRecord.notificationOptOut && clientRecord.notificationPreference && clientRecord.mobilePhone) {
    await db.createNotification({
      sessionId: session.id,
      recipientType: "client",
      recipientId: clientRecord.id,
      notificationType: clientRecord.notificationPreference,
      notificationTime: "1_hour",
      status: "pending",
    });
  }

  await processPendingNotifications();
}

function composeAddress(addressLine1?: string, city?: string, stateProvince?: string, postalCode?: string) {
  const line1 = addressLine1?.trim();
  const cityStatePostal = [city?.trim(), stateProvince?.trim(), postalCode?.trim()].filter(Boolean).join(" ");
  return [line1, cityStatePostal].filter(Boolean).join(", ") || undefined;
}

function pickPrimaryPhone(mobilePhone?: string, homePhone?: string, workPhone?: string, fallbackPhone?: string) {
  return mobilePhone?.trim() || homePhone?.trim() || workPhone?.trim() || fallbackPhone?.trim() || undefined;
}

function normalizeNotificationPreference(preference?: "sms" | "whatsapp" | null, mobilePhone?: string) {
  return mobilePhone?.trim() ? preference ?? undefined : undefined;
}

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    login: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(1),
        })
      )
      .mutation(async ({ input, ctx }) => {
      try{
        const staffRecord = await authenticateStaff(input.email, input.password);
        if (!staffRecord) {
          // console.error("Login failed: Invalid email or password for", input.email);
          throw new Error("Invalid email or password");
        }
        // Create custom session token for email/password staff
        const sessionToken = await createSession(staffRecord.id);
        // Set session token as HTTP-only cookie for web platform
        ctx.res.cookie('session_token', sessionToken, {
          httpOnly: true,
          secure: false, // Always false for local dev; set true for production/https
          sameSite: 'lax',
          path: '/',
          maxAge: 365 * 24 * 60 * 60 * 1000 // 1 year
        });
        return { staff: staffRecord, sessionToken, success: true };
      } catch (err) {
    // console.error("Login error:", err);
    throw err;
  }}
),
    passwordResetState: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
        })
      )
      .query(async ({ input }) => {
        const staffRecord = await getStaffByEmail(input.email);
        return {
          mustChangePassword: staffRecord?.mustChangePassword === 1,
        };
      }),
    completeForcedPasswordReset: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          newPassword: z.string().min(6),
        })
      )
      .mutation(async ({ input }) => {
        await completeForcedPasswordReset(input.email, input.newPassword);
        return { success: true };
      }),
    changePassword: protectedProcedure
      .input(
        z.object({
          currentPassword: z.string().min(1).optional(),
          newPassword: z.string().min(6),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new Error("Not authenticated");
        }
        if (ctx.user.mustChangePassword === 1) {
          await changePassword(ctx.user.id, input.newPassword);
          return { success: true, requiresLogin: true };
        }
        if (!input.currentPassword) {
          throw new Error("Current password is required");
        }
        await changePassword(ctx.user.id, input.currentPassword, input.newPassword);
        return { success: true };
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions });
      // Also clear custom session token cookie
      ctx.res.clearCookie('session_token', { path: '/' });
      return {
        success: true,
      } as const;
    }),
    fixAdmin: protectedProcedure.mutation(async ({ ctx }) => {
      if (!ctx.user) {
        throw new Error("Not authenticated");
      }
      return { success: true };
    }),
    resetDatabase: protectedProcedure.mutation(async ({ ctx }) => {
      if (!ctx.user) {
        throw new Error("Not authenticated");
      }
      // Only allow admin users to reset database
      if (ctx.user.role !== 'admin') {
        throw new Error("Only admin staff can reset the database");
      }
      const result = await resetDatabase(ctx.user.id);
      return result;
    }),
    importCSV: protectedProcedure
      .input(
        z.object({
          csvText: z.string().min(1),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // CSV import disabled: missing module
        return {
          success: false,
          message: "CSV import temporarily disabled."
        };
      }),
    importClients: protectedProcedure
      .input(z.object({ csvText: z.string() }))
      .mutation(async ({ input, ctx }) => {
        // Client CSV import disabled: missing module
        return {
          success: false,
          message: "Client CSV import temporarily disabled.",
          clientsCreated: 0,
          clientsSkipped: 0,
          errors: ["CSV import module missing"]
        };
      }),

    previewResetDatabase: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) {
        throw new Error("Not authenticated");
      }
      // Only allow admin users to preview reset
      if (ctx.user.role !== 'admin') {
        throw new Error("Only admin staff can preview the database reset");
      }
      return await previewResetDatabase();
    }),
  }),

  // Company Templates
  templates: router({
    list: protectedProcedure.query(() => getAllTemplates()),
    save: protectedProcedure
      .input(
        z.object({
          companyId: z.number(),
          templateName: z.string().min(1).max(255),
          templateDescription: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new Error("Not authenticated");
        }
        if (ctx.user.role !== 'admin') {
          throw new Error("Only admin users can save templates");
        }
        return await saveCompanyAsTemplate(
          input.companyId,
          input.templateName,
          input.templateDescription || '',
          ctx.user.id
        );
      }),
    applyToCompany: protectedProcedure
      .input(
        z.object({
          templateId: z.number(),
          companyId: z.number(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new Error("Not authenticated");
        }
        if (ctx.user.role !== 'admin') {
          throw new Error("Only admin users can apply templates");
        }
        return await applyTemplateToCompany(
          input.templateId,
          input.companyId,
          ctx.user.id
        );
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new Error("Not authenticated");
        }
        if (ctx.user.role !== 'admin') {
          throw new Error("Only admin users can delete templates");
        }
        return await deleteTemplate(input.id);
      }),
    rename: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).max(255),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new Error("Not authenticated");
        }
        if (ctx.user.role !== 'admin') {
          throw new Error("Only admin users can rename templates");
        }
        return await renameTemplate(input.id, input.name, input.description);
      }),
  }),

  // Staff Organization
  organizations: router({
    list: protectedProcedure.query(() => db.getAllOrganizations()),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getOrganizationById(input.id)),
    create: adminOnlyProcedure
      .input(
        z.object({
          name: z.string().min(1).max(255),
          address: z.string().optional(),
          addressLine1: z.string().optional(),
          city: z.string().optional(),
          stateProvince: z.string().optional(),
          postalCode: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().optional(),
          createdBy: z.number(),
          updatedBy: z.number(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return db.createOrganization(input);
      }),
    update: adminOnlyProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).max(255).optional(),
          address: z.string().optional(),
          addressLine1: z.string().optional(),
          city: z.string().optional(),
          stateProvince: z.string().optional(),
          postalCode: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().optional(),
          updatedBy: z.number(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateOrganization(id, data);
      }),
    delete: adminOnlyProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteOrganization(input.id)),
  }),

  staffDepartments: router({
    list: protectedProcedure
      .input(z.object({ organizationId: z.number() }))
      .query(({ input }) => db.getStaffDepartmentsByOrganizationId(input.organizationId)),
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getStaffDepartmentById(input.id)),
    // Temporary public endpoint for debugging
    // Return all departments across all orgs
    create: adminOnlyProcedure
      .input(
        z.object({
          organizationId: z.number(),
          name: z.string().min(1).max(255),
          description: z.string().optional(),
          createdBy: z.number(),
          updatedBy: z.number(),
        })
      )
      .mutation(({ input }) => db.createStaffDepartment(input)),
    update: adminOnlyProcedure
      .input(
        z.object({
          id: z.number(),
          organizationId: z.number().optional(),
          name: z.string().min(1).max(255).optional(),
          description: z.string().optional(),
          address: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().optional(),
          updatedBy: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, organizationId, ...data } = input;
        return db.updateStaffDepartment(id, data);
      }),
    delete: adminOnlyProcedure
      .input(z.object({ id: z.number(), organizationId: z.number().optional() }))
      .mutation(async ({ input }) => db.deleteStaffDepartment(input.id, input.organizationId)),
      // Duplicate keys removed: publicAll, all
    // Temporary public endpoint for debugging
    publicAll: publicProcedure.query(async () => {
      return db.getStaffDepartmentsByOrganizationId(0);
    }),
    // Return all departments across all orgs
    all: protectedProcedure.query(async () => db.getStaffDepartmentsByOrganizationId(0)),
  }),

  teams: router({
    list: protectedProcedure
      .input(z.object({ organizationId: z.number().optional() }).optional())
      .query(({ input }) => db.getTeamsByOrganizationId(input?.organizationId ?? 0)),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getTeamById(input.id)),
    create: adminOnlyProcedure
      .input(
        z.object({
          organizationId: z.number().optional(),
          staffDepartmentId: z.number().optional(),
          name: z.string().min(1).max(255),
          description: z.string().optional(),
          createdBy: z.number(),
          updatedBy: z.number(),
        })
      )
      .mutation(({ input }) => db.createTeam(input)),
    update: adminOnlyProcedure
      .input(
        z.object({
          id: z.number(),
          companyId: z.number().optional(),
          name: z.string().min(1).max(255).optional(),
          description: z.string().optional(),
          address: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().optional(),
          updatedBy: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateTeam(id, data);
      }),
    delete: adminOnlyProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteTeam(input.id)),
  }),

  staff: router({
    listAll: protectedProcedure.query(() => db.getAllStaff()),
    list: protectedProcedure.input(z.object({ teamId: z.number() })).query(({ input }) => db.getStaffByTeamId(input.teamId)),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getStaffById(input.id)),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      try {
        return await db.getStaffById(input.id);
      } catch (error) {
        console.error('[tRPC][staff.getById] Error:', error);
        throw error;
      }
    }),
    create: adminOnlyProcedure
      .input(
        z.object({
          groupId: z.number().optional(),
          organizationId: z.number().optional(),
          staffDepartmentId: z.number().optional(),
          teamId: z.number().optional(),
          userId: z.number().optional(),
          name: z.string().min(1).max(255),
          address: z.string().optional(),
          addressLine1: z.string().optional(),
          city: z.string().optional(),
          stateProvince: z.string().optional(),
          postalCode: z.string().optional(),
          phone: z.string().max(50).optional(),
          homePhone: z.string().max(50).optional(),
          mobilePhone: z.string().max(50).optional(),
          workPhone: z.string().max(50).optional(),
          email: z.string().email().optional(),
          password: z.string().min(6),
          mustChangePassword: z.number().optional(),
          role: z.enum(["admin", "counselor", "viewer"]).default("counselor"),
          notificationPreference: z.enum(["sms", "whatsapp"]).nullable().optional(),
          notificationOptOut: z.number().optional(),
          isVipRated: z.number().default(0),
          isAdmin: z.number().default(0), // DEPRECATED: kept for backward compatibility
          createdBy: z.number(),
          updatedBy: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        const { groupId, organizationId, password, ...data } = input;
        return db.createStaff({
          ...data,
          passwordHash: await hashPassword(password),
          mustChangePassword: data.mustChangePassword ?? 0,
          address: data.address ?? composeAddress(data.addressLine1, data.city, data.stateProvince, data.postalCode),
          phone: pickPrimaryPhone(data.mobilePhone, data.homePhone, data.workPhone, data.phone),
          notificationPreference: normalizeNotificationPreference(data.notificationPreference, data.mobilePhone),
          organizationId: organizationId ?? groupId,
        });
      }),
    update: adminOnlyProcedure
      .input(
        z.object({
          id: z.number(),
          groupId: z.number().optional(),
          organizationId: z.number().optional(),
          staffDepartmentId: z.number().optional(),
          teamId: z.number().optional(),
          name: z.string().min(1).max(255).optional(),
          address: z.string().optional(),
          addressLine1: z.string().optional(),
          city: z.string().optional(),
          stateProvince: z.string().optional(),
          postalCode: z.string().optional(),
          phone: z.string().max(50).optional(),
          homePhone: z.string().max(50).optional(),
          mobilePhone: z.string().max(50).optional(),
          workPhone: z.string().max(50).optional(),
          email: z.string().email().optional(),
          password: z.string().min(1).optional(),
          mustChangePassword: z.number().optional(),
          role: z.enum(["admin", "counselor", "viewer"]).optional(),
          notificationPreference: z.enum(["sms", "whatsapp"]).nullable().optional(),
          notificationOptOut: z.number().optional(),
          isVipRated: z.number().optional(),
          isAdmin: z.number().optional(), // DEPRECATED: kept for backward compatibility
          updatedBy: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, groupId, organizationId, ...data } = input;
        const updates: Record<string, unknown> = {
          ...data,
          address: data.address ?? composeAddress(data.addressLine1, data.city, data.stateProvince, data.postalCode),
          phone: pickPrimaryPhone(data.mobilePhone, data.homePhone, data.workPhone, data.phone),
          notificationPreference: normalizeNotificationPreference(data.notificationPreference, data.mobilePhone),
          organizationId: organizationId ?? groupId,
        };

        if (data.password) {
          updates.passwordHash = await hashPassword(data.password);
        }

        delete updates.password;

        return db.updateStaff(id, updates);
      }),
    delete: adminOnlyProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteStaff(input.id)),
    bulkUpdate: adminOnlyProcedure
      .input(
        z.object({
          staffIds: z.array(z.number()),
          teamId: z.number(),
          updatedBy: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        const { staffIds, teamId, updatedBy } = input;
        const results = [];
        for (const staffId of staffIds) {
          const result = await db.updateStaff(staffId, { teamId, updatedBy });
          results.push(result);
        }
        return { updated: results.length };
        }),
      }),

  // Client Organization
  companies: router({
    list: protectedProcedure.query(() => db.getAllCompanies()),
    all: protectedProcedure.query(() => db.getAllCompanies()),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getCompanyById(input.id)),
    create: publicProcedure
      .input(
        z.object({
          name: z.string().min(1).max(255),
          address: z.string().optional(),
          addressLine1: z.string().optional(),
          city: z.string().optional(),
          stateProvince: z.string().optional(),
          postalCode: z.string().optional(),
          phone: z.string().max(50).optional(),
          email: z.string().email().optional(),
          website: z.string().max(255).optional(),
          contactPerson: z.string().max(255).optional(),
          createdBy: z.number(),
          updatedBy: z.number(),
        })
      )
      .mutation(({ input }) => db.createCompany(input)),
    update: adminOnlyProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).max(255).optional(),
          address: z.string().optional(),
          addressLine1: z.string().optional(),
          city: z.string().optional(),
          stateProvince: z.string().optional(),
          postalCode: z.string().optional(),
          phone: z.string().max(50).optional(),
          email: z.string().email().optional(),
          website: z.string().max(255).optional(),
          contactPerson: z.string().max(255).optional(),
          updatedBy: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateCompany(id, data);
      }),
    delete: adminOnlyProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteCompany(input.id)),
  }),

  divisions: router({
    listAll: protectedProcedure.query(() => db.getAllDivisions()),
    all: publicProcedure.query(() => db.getAllDivisions()),
    list: protectedProcedure.input(z.object({ companyId: z.number() })).query(({ input }) => db.getDivisionsByCompanyId(input.companyId)),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getDivisionById(input.id)),
    create: adminOnlyProcedure
      .input(
        z.object({
          companyId: z.number(),
          name: z.string().min(1).max(255),
          address: z.string().optional(),
          phone: z.string().max(50).optional(),
          email: z.string().email().optional(),
          createdBy: z.number(),
          updatedBy: z.number(),
        })
      )
      .mutation(({ input }) => db.createDivision(input)),
    update: adminOnlyProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).max(255).optional(),
          address: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().optional(),
          updatedBy: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateDivision(id, data);
      }),
    delete: adminOnlyProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteDivision(input.id)),
  }),

  departments: router({
    listAll: protectedProcedure.query(() => db.getAllDepartments()),
    all: protectedProcedure.query(() => db.getAllDepartments()),
    list: protectedProcedure.input(z.object({ divisionId: z.number() })).query(({ input }) => db.getDepartmentsByDivisionId(input.divisionId)),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getDepartmentById(input.id)),
    create: adminOnlyProcedure
      .input(
        z.object({
          divisionId: z.number(),
          name: z.string().min(1).max(255),
          address: z.string().optional(),
          phone: z.string().max(50).optional(),
          email: z.string().email().optional(),
          createdBy: z.number(),
          updatedBy: z.number(),
        })
      )
      .mutation(({ input }) => db.createDepartment(input)),
    update: adminOnlyProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).max(255).optional(),
          address: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().optional(),
          updatedBy: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateDepartment(id, data);
      }),
    delete: adminOnlyProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteDepartment(input.id)),
  }),

  coDepartments: router({
    list: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(({ input }) => db.getCoDepartmentsByCompanyId(input.companyId)),
    all: protectedProcedure.query(() => db.getAllCoDepartments()),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getCoDepartmentById(input.id)),
    create: adminOnlyProcedure
      .input(
        z.object({
          companyId: z.number(),
          name: z.string().min(1).max(255),
          createdBy: z.number(),
          updatedBy: z.number(),
        })
      )
      .mutation(({ input }) => db.createCoDepartment(input)),
    update: adminOnlyProcedure
      .input(
        z.object({
          id: z.number(),
          companyId: z.number().optional(),
          name: z.string().min(1).max(255).optional(),
          description: z.string().optional(),
          address: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().optional(),
          updatedBy: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, companyId, ...data } = input;
        return db.updateCoDepartment(id, data);
      }),
    delete: adminOnlyProcedure.input(z.object({ id: z.number(), companyId: z.number().optional() })).mutation(({ input }) => db.deleteCoDepartment(input.id, input.companyId)),
  }),
  companyTeams: router({
    listAll: protectedProcedure.query(() => db.getAllCompanyTeams()),
    all: protectedProcedure.query(() => db.getAllCompanyTeams()),
    list: protectedProcedure.input(z.object({ coDepartmentId: z.number() })).query(({ input }) => db.getCompanyTeamsByDepartmentId(input.coDepartmentId)),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getCompanyTeamById(input.id)),
    create: adminOnlyProcedure
      .input(
        z.object({
          coDepartmentId: z.number(), // PATCHED: use coDepartmentId for consistency
          companyId: z.number(), // Ensure companyId is passed for team creation
          name: z.string().min(1).max(255),
          address: z.string().optional(),
          phone: z.string().max(50).optional(),
          email: z.string().email().optional(),
          createdBy: z.number(),
          updatedBy: z.number(),
        })
      )
      .mutation(({ input }) => db.createCompanyTeam(input)),
    update: adminOnlyProcedure
      .input(
        z.object({
          id: z.number(),
          coDepartmentId: z.number().optional(),
          name: z.string().min(1).max(255).optional(),
          address: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().optional(),
          updatedBy: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, coDepartmentId, ...data } = input;
        return db.updateCompanyTeam(id, data);
      }),
    delete: adminOnlyProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteCompanyTeam(input.id)),
  }),

  // Referral Sources
  fsms: router({
    list: protectedProcedure.query(() => db.getAllFSMs()),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getFSMById(input.id)),
    create: adminOnlyProcedure
      .input(
        z.object({
          name: z.string().min(1).max(255),
          address: z.string().optional(),
          phone: z.string().max(50).optional(),
          mobilePhone: z.string().max(50).optional(),
          email: z.string().email().optional(),
          organization: z.string().max(255).optional(),
          notes: z.string().optional(),
          createdBy: z.number(),
          updatedBy: z.number(),
        })
      )
      .mutation(({ input }) => db.createFSM(input)),
    update: adminOnlyProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).max(255).optional(),
          address: z.string().optional(),
          phone: z.string().max(50).optional(),
          mobilePhone: z.string().max(50).optional(),
          email: z.string().email().optional(),
          organization: z.string().max(255).optional(),
          notes: z.string().optional(),
          updatedBy: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateFSM(id, data);
      }),
    delete: adminOnlyProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteFSM(input.id)),
  }),

  // Clients
  clients: router({
    listAll: protectedProcedure.query(() => db.getAllClients()),
    list: protectedProcedure.input(z.object({ coDepartmentId: z.number() })).query(({ input }) => db.getClientsByDepartmentId(input.coDepartmentId)),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getClientById(input.id)),
    search: protectedProcedure.input(z.object({ searchTerm: z.string() })).query(({ input }) => db.searchClients(input.searchTerm)),
    create: adminOnlyProcedure
      .input(
        z.object({
          companyId: z.number(),
          coDepartmentId: z.number(),
          companyTeamId: z.number().optional(),
          referralSourceId: z.number().optional(),
          referralSourceType: z.enum(["fsm", "staff", "client"]).optional(),
          name: z.string().min(1).max(255),
          address: z.string().optional(),
          addressLine1: z.string().optional(),
          city: z.string().optional(),
          stateProvince: z.string().optional(),
          postalCode: z.string().optional(),
          homePhone: z.string().max(50).optional(),
          mobilePhone: z.string().max(50).optional(),
          workPhone: z.string().max(50).optional(),
          email: z.string().email().optional(),
          occupation: z.string().max(255).optional(),
          title: z.string().max(255).optional(),
          dateOfBirth: z.string().optional(),
          timeInServiceYears: z.number().optional(),
          timeInServiceMonths: z.number().optional(),
          timeInService: z.number().optional(),
          status: z.enum(["Active", "Inactive", "Referred", "On Hold"]).optional(),
          isVip: z.number().optional(),
          notificationPreference: z.enum(["sms", "whatsapp"]).nullable().optional(),
          notificationOptOut: z.number().optional(),
          createdBy: z.number(),
          updatedBy: z.number(),
        })
      )
      .mutation(({ input }) =>
        db.createClient({
          ...input,
          notificationPreference: normalizeNotificationPreference(input.notificationPreference, input.mobilePhone),
        })
      ),
    update: writeAccessProcedure
      .input(
        z.object({
          id: z.number(),
          companyId: z.number().optional(),
          coDepartmentId: z.number().optional(),
          companyTeamId: z.number().optional(),
          referralSourceId: z.number().optional(),
          referralSourceType: z.enum(["fsm", "staff", "client"]).optional(),
          name: z.string().min(1).max(255).optional(),
          address: z.string().optional(),
          addressLine1: z.string().optional(),
          city: z.string().optional(),
          stateProvince: z.string().optional(),
          postalCode: z.string().optional(),
          homePhone: z.string().max(50).optional(),
          mobilePhone: z.string().max(50).optional(),
          workPhone: z.string().max(50).optional(),
          email: z.string().email().optional(),
          occupation: z.string().max(255).optional(),
          title: z.string().max(255).optional(),
          dateOfBirth: z.string().optional(),
          timeInServiceYears: z.number().optional(),
          timeInServiceMonths: z.number().optional(),
          timeInService: z.number().optional(),
          status: z.enum(["Active", "Inactive", "Referred", "On Hold"]).optional(),
          isVip: z.number().optional(),
          notificationPreference: z.enum(["sms", "whatsapp"]).nullable().optional(),
          notificationOptOut: z.number().optional(),
          updatedBy: z.number(),
        })
      )
      .mutation(({ input }) => {
        const { id, dateOfBirth, ...data } = input;
        const updates: any = { ...data };
        updates.notificationPreference = normalizeNotificationPreference(data.notificationPreference, data.mobilePhone);
        if (dateOfBirth) {
          updates.dateOfBirth = dateOfBirth.slice(0, 10);
        }
        return db.updateClient(id, updates);
      }),
    delete: writeAccessProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteClient(input.id)),
    bulkUpdate: adminOnlyProcedure
      .input(
        z.object({
          clientIds: z.array(z.number()),
          companyId: z.number(),
          coDepartmentId: z.number(),
          companyTeamId: z.number(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { clientIds, companyId, coDepartmentId, companyTeamId } = input;
        const updates: any = {
          companyId,
          coDepartmentId,
          companyTeamId,
          updatedBy: ctx.user!.id,
        };
        
        // Update all clients
        const results = await Promise.all(
          clientIds.map((id) => db.updateClient(id, updates))
        );
        
        return { success: true, updatedCount: results.length };
      }),
  }),

  // Folders
  folders: router({
    listAll: protectedProcedure.query(() => db.getAllFoldersWithClient()),
    list: protectedProcedure.input(z.object({ clientId: z.number() })).query(({ input }) => db.getFoldersByClientId(input.clientId)),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getFolderById(input.id)),
    getByFolderNumber: protectedProcedure
      .input(z.object({ clientId: z.number(), folderNumber: z.string().regex(/^\d{3}$/) }))
      .query(({ input }) => db.getFolderByFolderNumber(input.clientId, input.folderNumber)),
    nextFolderNumber: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(({ input }) => db.getNextFolderNumber(input.clientId)),
    create: writeAccessProcedure
      .input(
        z.object({
          folderNumber: z.string().regex(/^\d{3}$/).optional(),
          folderDescription: z.string().optional(),
          clientId: z.number(),
          createdByStaffId: z.number(),
          startDate: z.date(),
          endDate: z.date().optional(),
          status: z.enum(["Active", "Closed", "On Hold"]).default("Active"),
          notes: z.string().optional(),
          createdBy: z.number(),
          updatedBy: z.number(),
        })
      )
      .mutation(({ input }) => {
        if (input.endDate && input.endDate < input.startDate) {
          throw new Error("Folder end date must be on or after start date");
        }
        return db.createFolder(input);
      }),
    update: writeAccessProcedure
      .input(
        z.object({
          id: z.number(),
          clientId: z.number().optional(),
          folderNumber: z.string().regex(/^\d{3}$/).optional(),
          folderDescription: z.string().optional(),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
          status: z.enum(["Active", "Closed", "On Hold"]).optional(),
          notes: z.string().optional(),
          updatedBy: z.number(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;

        if (data.folderNumber && ctx.user?.role !== "admin") {
          throw new Error("Only admin staff can edit folder numbers");
        }

        if (data.endDate) {
          const existingFolder = await db.getFolderById(id);
          const resolvedStartDate = data.startDate || existingFolder?.startDate;
          if (resolvedStartDate && data.endDate < resolvedStartDate) {
            throw new Error("Folder end date must be on or after start date");
          }
        }

        return db.updateFolder(id, data);
      }),
    delete: writeAccessProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteFolder(input.id)),
  }),

  // Session Lookup Tables
  sessionTypes: router({
    list: protectedProcedure.query(() => db.getAllSessionTypes()),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getSessionTypeById(input.id)),
    create: adminOnlyProcedure
      .input(
        z.object({
          name: z.string().min(1).max(100),
          isActive: z.number().default(1),
          createdBy: z.number(),
          updatedBy: z.number(),
        })
      )
      .mutation(({ input }) => db.createSessionType(input)),
    update: adminOnlyProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).max(100).optional(),
          isActive: z.number().optional(),
          updatedBy: z.number(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateSessionType(id, data);
      }),
  }),

  sessionStatuses: router({
    list: protectedProcedure.query(() => db.getAllSessionStatuses()),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getSessionStatusById(input.id)),
    create: adminOnlyProcedure
      .input(
        z.object({
          name: z.string().min(1).max(100),
          isActive: z.number().default(1),
          createdBy: z.number(),
          updatedBy: z.number(),
        })
      )
      .mutation(({ input }) => db.createSessionStatus(input)),
    update: adminOnlyProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).max(100).optional(),
          isActive: z.number().optional(),
          updatedBy: z.number(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateSessionStatus(id, data);
      }),
  }),

  sessionResults: router({
    list: protectedProcedure.query(() => db.getAllSessionResults()),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getSessionResultById(input.id)),
    create: adminOnlyProcedure
      .input(
        z.object({
          name: z.string().min(1).max(100),
          isActive: z.number().default(1),
          createdBy: z.number(),
          updatedBy: z.number(),
        })
      )
      .mutation(({ input }) => db.createSessionResult(input)),
    update: adminOnlyProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).max(100).optional(),
          isActive: z.number().optional(),
          updatedBy: z.number(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateSessionResult(id, data);
      }),
  }),

  // Sessions
  sessions: router({
    listAll: protectedProcedure.query(() => db.getAllSessions()),
    listByFolder: protectedProcedure.input(z.object({ folderId: z.number() })).query(({ input }) => db.getSessionsByFolderId(input.folderId)),
    listByClient: protectedProcedure
      .input(z.object({ clientId: z.number(), limit: z.number().optional() }))
      .query(({ input }) => db.getSessionsByClientId(input.clientId, input.limit)),
    listByStaff: protectedProcedure
      .input(z.object({ staffId: z.number(), limit: z.number().optional() }))
      .query(({ input }) => db.getSessionsByStaffId(input.staffId, input.limit)),
    upcoming: protectedProcedure
      .input(z.object({ staffId: z.number(), days: z.number().default(7) }))
      .query(({ input }) => db.getUpcomingSessions(input.staffId, input.days)),
    recent: protectedProcedure
      .input(z.object({ staffId: z.number(), days: z.number().default(7) }))
      .query(({ input }) => db.getRecentSessions(input.staffId, input.days)),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getSessionById(input.id)),
    canEdit: protectedProcedure
      .input(z.object({ sessionId: z.number(), isAdmin: z.boolean() }))
      .query(({ input }) => db.canEditSession(input.sessionId, input.isAdmin)),
    create: writeAccessProcedure
      .input(
        z.object({
          folderId: z.number(),
          clientId: z.number(),
          staffId: z.number(),
          sessionTypeId: z.number(),
          sessionStatusId: z.number(),
          sessionResultId: z.number().optional(),
          interviewStartTime: z.date().optional(),
          interviewEndTime: z.date().optional(),
          interviewDuration: z.number().optional(),
          sessionStartTime: z.date().optional(),
          sessionEndTime: z.date().optional(),
          sessionDuration: z.number().optional(),
          billableHours: z.string().optional(),
          notes: z.string().optional(),
          scheduledDate: z.date().optional(),
          completedAt: z.date().optional(),
          createdBy: z.number(),
          updatedBy: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await db.createSession(input);
        await syncSessionNotifications(result);
        return result;
      }),
    update: writeAccessProcedure
      .input(
        z.object({
          id: z.number(),
          folderId: z.number().optional(),
          clientId: z.number().optional(),
          staffId: z.number().optional(),
          sessionTypeId: z.number().optional(),
          sessionStatusId: z.number().optional(),
          sessionResultId: z.number().optional(),
          interviewStartTime: z.date().optional(),
          interviewEndTime: z.date().optional(),
          interviewDuration: z.number().optional(),
          sessionStartTime: z.date().optional(),
          sessionEndTime: z.date().optional(),
          sessionDuration: z.number().optional(),
          billableHours: z.string().optional(),
          notes: z.string().optional(),
          scheduledDate: z.date().optional(),
          completedAt: z.date().optional(),
          updatedBy: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateSession(id, data);
        const updatedSession = await db.getSessionById(id);
        if (updatedSession) {
          await syncSessionNotifications(updatedSession);
        }
        return { success: true };
      }),
    delete: adminOnlyProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteSession(input.id)),
  }),
  // Notifications
  notifications: router({
    listBySession: protectedProcedure.input(z.object({ sessionId: z.number() })).query(({ input }) => db.getNotificationsBySessionId(input.sessionId)),
    pending: protectedProcedure.query(() => db.getPendingNotifications()),
    sendManual: protectedProcedure
      .input(
        z.object({
          recipientType: z.enum(["staff", "client"]),
          recipientIds: z.array(z.number()).min(1),
          message: z.string().min(1).max(1000),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new Error("Not authenticated");
        }

        const isAdmin = ctx.staffRole === "admin" || ctx.user.role === "admin";
        const results: Array<{
          recipientId: number;
          status: "sent" | "failed" | "skipped";
          channel?: "sms" | "whatsapp";
          reason?: string;
        }> = [];

        if (!isAdmin && input.recipientType !== "client") {
          throw new Error("Only admins can send messages to staff");
        }

        let allowedClientIds = new Set<number>();
        if (!isAdmin && input.recipientType === "client") {
          const ownSessions = await db.getSessionsByStaffId(ctx.user.id);
          allowedClientIds = new Set(ownSessions.map((session: any) => Number(session.clientId)));
        }

        for (const recipientId of input.recipientIds) {
          if (!isAdmin && input.recipientType === "client" && !allowedClientIds.has(Number(recipientId))) {
            results.push({
              recipientId,
              status: "skipped",
              reason: "Client is not assigned to this staff member",
            });
            continue;
          }

          const recipientRecord =
            input.recipientType === "staff"
              ? await db.getStaffById(recipientId)
              : await db.getClientById(recipientId);

          try {
            const result = await sendDirectNotification({
              recipientType: input.recipientType,
              recipientRecord,
              message: input.message,
            });
            results.push({
              recipientId,
              status: result.status,
              channel: result.channel,
              reason: result.reason,
            });
          } catch (error: any) {
            results.push({
              recipientId,
              status: "failed",
              reason: error?.message || "Unknown notification error",
            });
          }
        }

        return {
          success: results.some((result) => result.status === "sent"),
          results,
        };
      }),
    create: writeAccessProcedure
      .input(
        z.object({
          sessionId: z.number(),
          recipientType: z.enum(["staff", "client"]),
          recipientId: z.number(),
          notificationType: z.enum(["email", "sms", "whatsapp"]),
          notificationTime: z.enum(["24_hours", "1_hour"]),
          status: z.enum(["pending", "sent", "failed", "skipped"]).default("pending"),
          skipReason: z.string().optional(),
        })
      )
      .mutation(({ input }) => db.createNotification(input)),
    update: writeAccessProcedure
      .input(
        z.object({
          id: z.number(),
          sentAt: z.date().optional(),
          status: z.enum(["pending", "sent", "failed", "skipped"]).optional(),
          skipReason: z.string().optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateNotification(id, data);
      }),
  }),
  reports: router({
    billableHoursByStaff: protectedProcedure
      .input(
        z.object({
          staffId: z.number(),
          startDate: z.date(),
          endDate: z.date(),
        })
      )
      .query(({ input }) => db.getBillableHoursByStaff(input.staffId, input.startDate, input.endDate)),
    billableHoursByClient: protectedProcedure
      .input(
        z.object({
          clientId: z.number(),
          startDate: z.date(),
          endDate: z.date(),
        })
      )
      .query(({ input }) => db.getBillableHoursByClient(input.clientId, input.startDate, input.endDate)),
    monthlyBillableHours: protectedProcedure
      .input(
        z.object({
          staffId: z.number(),
          year: z.number(),
          month: z.number(),
        })
      )
      .query(({ input }) => db.getMonthlyBillableHours(input.staffId, input.year, input.month)),
  }),
});

export type AppRouter = typeof appRouter;
