import { trpc } from "@/lib/trpc";
import { useAuth } from "./use-auth";

export type StaffRole = "admin" | "counselor" | "viewer" | null;

/**
 * Hook to get the current staff's role for permission checks
 * Returns null if staff is not authenticated or has no staff record
 */
export function useStaffRole() {
  const { staff } = useAuth();
  const role: StaffRole = (staff as any)?.role ?? null;
  return {
    role,
    isLoading: false, // Adjust if you want to track loading
    isAdmin: role === "admin",
    isCounselor: role === "counselor",
    isViewer: role === "viewer",
    canWrite: role === "admin" || role === "counselor",
    canManageStaff: role === "admin",

    canManageOrganizations: role === "admin"
  };
}
