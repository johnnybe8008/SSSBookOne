import * as Api from "@/lib/_core/api";
import * as Auth from "@/lib/_core/auth";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";


type UseAuthOptions = {
  autoFetch?: boolean;
};

export function useAuth(options?: UseAuthOptions) {
  const { autoFetch = true } = options ?? {};
  const [staff, setStaff] = useState<Auth.Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStaff = useCallback(async () => {
    console.log("[useAuth] fetchStaff called");
    try {
      setLoading(true);
      setError(null);
      // Always validate session with backend on web
      let backendStaff = null;
      if (Platform.OS === "web") {
        try {
          const { getApiBaseUrl } = await import("@/constants/oauth");
          const apiBaseUrl = getApiBaseUrl();
          const url = `${apiBaseUrl}/api/trpc/auth.me`;
          console.log("[useAuth] Fetching staff from:", url);
          const res = await fetch(url, { credentials: "include" });
          const data = await res.json();
          console.log("[useAuth] Full /auth.me tRPC response:", data);
          // Try to extract staff from all possible locations
          backendStaff = data?.result?.data?.json?.staff || data?.result?.data?.json || data?.result?.data || data?.result;
          console.log("[useAuth] Backend /auth.me result (parsed staff):", backendStaff);
        } catch (err) {
          console.error("[useAuth] Backend /auth.me error:", err);
        }
      }
      if (backendStaff && backendStaff.id) {
        setStaff(backendStaff);
        await Auth.setStaffInfo?.(backendStaff);
        return;
      }
      // Fallback to localStorage for native or if backend fails
      const cachedStaff = await Auth.getStaffInfo();
      console.log("[useAuth] Cached staff:", cachedStaff);
      if (cachedStaff) {
        setStaff(cachedStaff);
      } else {
        setStaff(null);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch staff");
      console.error("[useAuth] fetchStaff error:", error);
      setError(error);
      setStaff(null);
    } finally {
      setLoading(false);
      console.log("[useAuth] fetchStaff completed, loading:", false);
    }
  }, []);

  const logout = useCallback(async () => {
    console.log("[useAuth] logout called");
    try {
      await Api.logout();
      console.log("[useAuth] Api.logout() resolved");
    } catch (err) {
      console.error("[Auth] Logout API call failed:", err);
    } finally {
      await Auth.removeSessionToken();
      await Auth.clearStaffInfo();
      setStaff(null);
      setError(null);
      console.log("[useAuth] Local logout cleanup complete");
    }
  }, []);

  const isAuthenticated = useMemo(() => Boolean(staff), [staff]);

  useEffect(() => {
    console.log("[useAuth] useEffect triggered, autoFetch:", autoFetch, "platform:", Platform.OS);
    if (autoFetch) {
      Auth.getStaffInfo().then((cachedStaff) => {
        console.log("[useAuth] Cached staff check:", cachedStaff);
        if (cachedStaff) {
          console.log("[useAuth] Setting cached staff immediately");
          setStaff(cachedStaff);
          setLoading(false);
        } else {
          fetchStaff();
        }
      });
    } else {
      console.log("[useAuth] autoFetch disabled, setting loading to false");
      setLoading(false);
    }
  }, [autoFetch, fetchStaff]);

  useEffect(() => {
    console.log("[useAuth] State updated:", {
      hasStaff: !!staff,
      loading,
      isAuthenticated,
      error: error?.message,
    });
  }, [staff, loading, isAuthenticated, error]);

  return {
    staff,
    loading,
    error,
    isAuthenticated,
    refresh: fetchStaff,
    logout,
  };
}
