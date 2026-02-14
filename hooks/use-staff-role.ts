import { trpc } from "@/lib/trpc";
import { useAuth } from "./use-auth";

export type StaffRole = "admin" | "counselor" | "viewer" | null;

/**
 * Hook to get the current user's staff role for permission checks
 * Returns null if user is not authenticated or has no staff record
 */
export function useStaffRole() {
  const { user } = useAuth();
  
  const { data: staff, isLoading } = trpc.staff.getByUserId.useQuery(
    { userId: user?.id ?? 0 },
    { enabled: !!user?.id }
  );

  const role: StaffRole = (staff as any)?.role || null;

  return {
    role,
    isLoading,
    isAdmin: role === "admin",
    isCounselor: role === "counselor",
    isViewer: role === "viewer",
    canWrite: role === "admin" || role === "counselor",
    canManageStaff: role === "admin",
    canManageOrganizations: role === "admin",
  };
}
