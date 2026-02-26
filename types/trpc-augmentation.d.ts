// Patch tRPC types for teams.list and teams.create to use organizationId instead of groupId
import '@trpc/react-query';
declare module '@trpc/react-query' {
  interface Procedures {
    teams: {
      list: (input: { organizationId: number }) => any;
      create: (input: { organizationId: number; staffDepartmentId?: number; name: string; createdBy: number; updatedBy: number }) => any;
    };
  }
}
