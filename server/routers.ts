import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { authenticateUser, changePassword } from "./auth";
import { fixAdminAccount } from "./fix-admin";
import { createSession } from "./session-manager";

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
        const user = await authenticateUser(input.email, input.password);
        if (!user) {
          throw new Error("Invalid email or password");
        }
        
        // Create custom session token for email/password users
        const sessionToken = await createSession(user.id);
        
        return { user, sessionToken, success: true };
      }),
    changePassword: protectedProcedure
      .input(
        z.object({
          newPassword: z.string().min(6),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new Error("Not authenticated");
        }
        await changePassword(ctx.user.id, input.newPassword);
        return { success: true };
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    fixAdmin: protectedProcedure.mutation(async ({ ctx }) => {
      if (!ctx.user) {
        throw new Error("Not authenticated");
      }
      const result = await fixAdminAccount(ctx.user.id);
      return result;
    }),
  }),

  // Staff Organization
  groups: router({
    list: protectedProcedure.query(() => db.getAllGroups()),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getGroupById(input.id)),
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1).max(255),
          description: z.string().optional(),
          createdBy: z.number(),
          updatedBy: z.number(),
        })
      )
      .mutation(({ input }) => db.createGroup(input)),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).max(255).optional(),
          description: z.string().optional(),
          updatedBy: z.number(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateGroup(id, data);
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteGroup(input.id)),
  }),

  teams: router({
    list: protectedProcedure.input(z.object({ groupId: z.number() })).query(({ input }) => db.getTeamsByGroupId(input.groupId)),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getTeamById(input.id)),
    create: protectedProcedure
      .input(
        z.object({
          groupId: z.number(),
          name: z.string().min(1).max(255),
          description: z.string().optional(),
          createdBy: z.number(),
          updatedBy: z.number(),
        })
      )
      .mutation(({ input }) => db.createTeam(input)),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).max(255).optional(),
          description: z.string().optional(),
          updatedBy: z.number(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateTeam(id, data);
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteTeam(input.id)),
  }),

  staff: router({
    list: protectedProcedure.input(z.object({ teamId: z.number() })).query(({ input }) => db.getStaffByTeamId(input.teamId)),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getStaffById(input.id)),
    getByUserId: protectedProcedure.input(z.object({ userId: z.number() })).query(({ input }) => db.getStaffByUserId(input.userId)),
    create: protectedProcedure
      .input(
        z.object({
          teamId: z.number(),
          userId: z.number().optional(),
          name: z.string().min(1).max(255),
          address: z.string().optional(),
          phone: z.string().max(50).optional(),
          email: z.string().email().optional(),
          isVipRated: z.number().default(0),
          isAdmin: z.number().default(0),
          createdBy: z.number(),
          updatedBy: z.number(),
        })
      )
      .mutation(({ input }) => db.createStaff(input)),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).max(255).optional(),
          address: z.string().optional(),
          phone: z.string().max(50).optional(),
          email: z.string().email().optional(),
          isVipRated: z.number().optional(),
          isAdmin: z.number().optional(),
          updatedBy: z.number(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateStaff(id, data);
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteStaff(input.id)),
  }),

  // Client Organization
  companies: router({
    list: protectedProcedure.query(() => db.getAllCompanies()),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getCompanyById(input.id)),
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1).max(255),
          address: z.string().optional(),
          phone: z.string().max(50).optional(),
          email: z.string().email().optional(),
          website: z.string().max(255).optional(),
          contactPerson: z.string().max(255).optional(),
          createdBy: z.number(),
          updatedBy: z.number(),
        })
      )
      .mutation(({ input }) => db.createCompany(input)),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).max(255).optional(),
          address: z.string().optional(),
          phone: z.string().max(50).optional(),
          email: z.string().email().optional(),
          website: z.string().max(255).optional(),
          contactPerson: z.string().max(255).optional(),
          updatedBy: z.number(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateCompany(id, data);
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteCompany(input.id)),
  }),

  divisions: router({
    list: protectedProcedure.input(z.object({ companyId: z.number() })).query(({ input }) => db.getDivisionsByCompanyId(input.companyId)),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getDivisionById(input.id)),
    create: protectedProcedure
      .input(
        z.object({
          companyId: z.number(),
          name: z.string().min(1).max(255),
          description: z.string().min(1), // Mandatory description
          createdBy: z.number(),
          updatedBy: z.number(),
        })
      )
      .mutation(({ input }) => db.createDivision(input)),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).max(255).optional(),
          description: z.string().optional(),
          updatedBy: z.number(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateDivision(id, data);
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteDivision(input.id)),
  }),

  departments: router({
    list: protectedProcedure.input(z.object({ divisionId: z.number() })).query(({ input }) => db.getDepartmentsByDivisionId(input.divisionId)),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getDepartmentById(input.id)),
    create: protectedProcedure
      .input(
        z.object({
          divisionId: z.number(),
          name: z.string().min(1).max(255),
          description: z.string().min(1), // Mandatory description
          createdBy: z.number(),
          updatedBy: z.number(),
        })
      )
      .mutation(({ input }) => db.createDepartment(input)),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).max(255).optional(),
          description: z.string().optional(),
          updatedBy: z.number(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateDepartment(id, data);
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteDepartment(input.id)),
  }),

  // Referral Sources
  fsms: router({
    list: protectedProcedure.query(() => db.getAllFSMs()),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getFSMById(input.id)),
    create: protectedProcedure
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
    update: protectedProcedure
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
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateFSM(id, data);
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteFSM(input.id)),
  }),

  // Clients
  clients: router({
    list: protectedProcedure.input(z.object({ departmentId: z.number() })).query(({ input }) => db.getClientsByDepartmentId(input.departmentId)),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getClientById(input.id)),
    search: protectedProcedure.input(z.object({ searchTerm: z.string() })).query(({ input }) => db.searchClients(input.searchTerm)),
    create: protectedProcedure
      .input(
        z.object({
          departmentId: z.number(),
          referralSourceId: z.number().optional(),
          referralSourceType: z.enum(["fsm", "staff", "client"]).optional(),
          name: z.string().min(1).max(255),
          address: z.string().optional(),
          homePhone: z.string().max(50).optional(),
          mobilePhone: z.string().max(50).optional(),
          workPhone: z.string().max(50).optional(),
          email: z.string().email().optional(),
          occupation: z.string().max(255).optional(),
          title: z.string().max(255).optional(),
          age: z.number().optional(),
          timeInService: z.number().optional(),
          status: z.enum(["Active", "Inactive", "Referred", "On Hold"]).default("Active"),
          isVip: z.number().default(0),
          notificationPreference: z.enum(["sms", "whatsapp"]).default("sms"),
          notificationOptOut: z.number().default(0),
          createdBy: z.number(),
          updatedBy: z.number(),
        })
      )
      .mutation(({ input }) => db.createClient(input)),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).max(255).optional(),
          address: z.string().optional(),
          homePhone: z.string().max(50).optional(),
          mobilePhone: z.string().max(50).optional(),
          workPhone: z.string().max(50).optional(),
          email: z.string().email().optional(),
          occupation: z.string().max(255).optional(),
          title: z.string().max(255).optional(),
          age: z.number().optional(),
          timeInService: z.number().optional(),
          status: z.enum(["Active", "Inactive", "Referred", "On Hold"]).optional(),
          isVip: z.number().optional(),
          notificationPreference: z.enum(["sms", "whatsapp"]).optional(),
          notificationOptOut: z.number().optional(),
          updatedBy: z.number(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateClient(id, data);
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteClient(input.id)),
  }),

  // Cases
  cases: router({
    list: protectedProcedure.input(z.object({ clientId: z.number() })).query(({ input }) => db.getCasesByClientId(input.clientId)),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getCaseById(input.id)),
    getByCaseNumber: protectedProcedure.input(z.object({ caseNumber: z.string() })).query(({ input }) => db.getCaseByCaseNumber(input.caseNumber)),
    create: protectedProcedure
      .input(
        z.object({
          caseNumber: z.string().max(100),
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
      .mutation(({ input }) => db.createCase(input)),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          endDate: z.date().optional(),
          status: z.enum(["Active", "Closed", "On Hold"]).optional(),
          notes: z.string().optional(),
          updatedBy: z.number(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateCase(id, data);
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteCase(input.id)),
  }),

  // Session Lookup Tables
  sessionTypes: router({
    list: protectedProcedure.query(() => db.getAllSessionTypes()),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getSessionTypeById(input.id)),
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1).max(100),
          isActive: z.number().default(1),
          createdBy: z.number(),
          updatedBy: z.number(),
        })
      )
      .mutation(({ input }) => db.createSessionType(input)),
    update: protectedProcedure
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
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1).max(100),
          isActive: z.number().default(1),
          createdBy: z.number(),
          updatedBy: z.number(),
        })
      )
      .mutation(({ input }) => db.createSessionStatus(input)),
    update: protectedProcedure
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
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1).max(100),
          isActive: z.number().default(1),
          createdBy: z.number(),
          updatedBy: z.number(),
        })
      )
      .mutation(({ input }) => db.createSessionResult(input)),
    update: protectedProcedure
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
    listByCase: protectedProcedure.input(z.object({ caseId: z.number() })).query(({ input }) => db.getSessionsByCaseId(input.caseId)),
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
    create: protectedProcedure
      .input(
        z.object({
          caseId: z.number(),
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
      .mutation(({ input }) => db.createSession(input)),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
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
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateSession(id, data);
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteSession(input.id)),
  }),

  // Notifications
  notifications: router({
    listBySession: protectedProcedure.input(z.object({ sessionId: z.number() })).query(({ input }) => db.getNotificationsBySessionId(input.sessionId)),
    pending: protectedProcedure.query(() => db.getPendingNotifications()),
    create: protectedProcedure
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
    update: protectedProcedure
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

  // Reporting
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
