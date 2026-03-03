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
          const res = await fetch(url, { credentials: "include" });
          const data = await res.json();
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
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await Api.logout();
    } catch (err) {
      console.error("[Auth] Logout API call failed:", err);
    } finally {
      await Auth.removeSessionToken();
      await Auth.clearStaffInfo();
      setStaff(null);
      setError(null);
    }
  }, []);

  const isAuthenticated = useMemo(() => Boolean(staff), [staff]);

  useEffect(() => {
    if (autoFetch) {
      Auth.getStaffInfo().then((cachedStaff) => {
        if (cachedStaff) {
          setStaff(cachedStaff);
          setLoading(false);
        } else {
          fetchStaff();
        }
      });
    } else {
      setLoading(false);
    }
  }, [autoFetch, fetchStaff]);

  useEffect(() => {
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
